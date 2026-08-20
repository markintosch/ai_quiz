// FILE: src/lib/signal/runner.ts
// ─── Moba Signal — collection run ─────────────────────────────────────────────
//
// One run = one source: fetch the listing page, follow a few article links,
// extract dated facts, link entities, score deterministically, and store
// everything as review_status='proposed'. Nothing a run writes is visible on
// the dashboard until the analyst approves it.
//
// Every run is logged to moba_signal_runs; the source health panel reads that
// log, so a failed run is visible rather than a quiet zero (PRD §8.6).

import type { SupabaseClient } from '@supabase/supabase-js'
import { discoverArticleLinks, fetchPage, htmlToText, parseFeed } from './crawl'
import { extractItems, type ExtractedItem } from './extract'
import { credibilityFor, dedupeKey, linkEntities, materialityFor, proximityFor, type EntityRow } from './score'

const MAX_ARTICLES = 5
const CONCURRENCY = 3

export interface RunResult {
  sourceId: string
  ok: boolean
  pagesFetched: number
  itemsFound: number
  itemsNew: number
  error?: string
}

async function withConcurrency<T, R>(items: T[], n: number, worker: (t: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  let cursor = 0
  async function lane() {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await worker(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => lane()))
  return results
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = SupabaseClient<any, any, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SourceRow { id: string; name: string; url: string; source_class: string; [k: string]: any }

/**
 * The shared second half of ingestion: link entities, score deterministically,
 * store everything as review_status='proposed', and turn unknown company
 * names into curator proposals. Used by the crawler and by manual uploads,
 * so both channels meet exactly the same standard.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storeExtracted(db: any, source: SourceRow, extracted: ExtractedItem[], opts?: {
  assertedBy?: string
  /** Extra provenance kept in the raw payload (e.g. uploaded filename). */
  provenance?: Record<string, unknown>
}): Promise<{ itemsNew: number }> {
  const { data: entityRows } = await db.from('moba_signal_entities')
    .select('id, name, ownership_kind, aliases, regions, priority')
  const entities: EntityRow[] = entityRows ?? []
  const { data: ctx } = await db.from('moba_signal_context').select('account_names')
  const accountNames: string[] = (ctx ?? []).flatMap((c: { account_names: string[] | null }) => c.account_names ?? [])

  let itemsNew = 0
  const unknownNames = new Map<string, number>()
  for (const item of extracted) {
    const link = linkEntities(item.entities, entities)
    if (link.entityGuess) unknownNames.set(link.entityGuess, (unknownNames.get(link.entityGuess) ?? 0) + 1)
    const row = {
      event_date:        item.date,
      entity_id:         link.entityId,
      entity_guess:      link.entityGuess,
      linked_entity_ids: link.linkedIds,
      title:             item.title,
      summary:           item.summary,
      type:              item.type,
      region:            item.region,
      category:          item.category,
      proximity:         proximityFor(item, link, entities, accountNames),
      materiality:       materialityFor(item.type),
      credibility:       credibilityFor(source.source_class),
      inference:         item.inference,
      quotes:            item.quotes,
      source_id:         source.id,
      source_url:        item.url ?? source.url,
      asserted_by:       opts?.assertedBy ?? 'collector',
      dedupe_key:        dedupeKey(item, link),
      raw:               opts?.provenance ? { ...item, ...opts.provenance } : item,
    }
    const { error: insErr } = await db.from('moba_signal_items').insert(row)
    if (!insErr) {
      itemsNew++
    } else if (String(insErr.code) === '23505') {
      await db.from('moba_signal_items')
        .update({ last_confirmed: new Date().toISOString() })
        .eq('dedupe_key', row.dedupe_key)
    }
  }

  for (const [name, count] of unknownNames) {
    await db.from('moba_signal_proposals').insert({
      kind: 'entity',
      title: `Track new entity: ${name}`,
      rationale: `Seen ${count}x in ${source.name} without matching a tracked entity or alias.`,
      proposed_by: 'curator',
      source_url: source.url,
    })
  }
  return { itemsNew }
}

export async function runSource(supabase: Db, sourceId: string): Promise<RunResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: source } = await db.from('moba_signal_sources').select('*').eq('id', sourceId).maybeSingle()
  if (!source) return { sourceId, ok: false, pagesFetched: 0, itemsFound: 0, itemsNew: 0, error: 'Unknown source' }

  const { data: runRow } = await db.from('moba_signal_runs')
    .insert({ source_id: sourceId }).select('id').single()

  let pagesFetched = 0
  let itemsFound = 0
  let itemsNew = 0
  let error: string | undefined

  try {
    // 1. Prefer the verified feed when the source has one: RSS carries the
    //    publication date and the canonical article URL, so the extractor
    //    starts from facts instead of inferring them from page furniture.
    const pages: Array<{ url: string; text: string; dateHint?: string }> = []
    let feedWorked = false
    if (source.feed_url) {
      try {
        const feedXml = await fetchPage(source.feed_url)
        pagesFetched++
        const entries = parseFeed(feedXml, MAX_ARTICLES)
        if (entries.length > 0) {
          feedWorked = true
          const bodies = await withConcurrency(entries, CONCURRENCY, async e => {
            // Aggregator entries (Google News) link to redirect pages, not
            // articles: the feed's own title and description are the content.
            if (/(^|\.)news\.google\.com$/.test(new URL(e.url).hostname)) {
              return { url: e.url, text: `${e.title}\n\n${e.description ?? ''}`, dateHint: e.publishedAt }
            }
            try {
              const html = await fetchPage(e.url)
              return { url: e.url, text: `${e.title}\n\n${htmlToText(html)}`, dateHint: e.publishedAt }
            } catch {
              // Article page blocked: the feed description is still usable
              return e.description
                ? { url: e.url, text: `${e.title}\n\n${e.description}`, dateHint: e.publishedAt }
                : null
            }
          })
          for (const b of bodies) if (b) { pages.push(b); pagesFetched++ }
        }
      } catch {
        // fall through to the listing scrape
      }
    }

    // 2. Fallback: scrape the listing page plus discovered article links
    if (!feedWorked) {
      const listingHtml = await fetchPage(source.url)
      pagesFetched++
      pages.push({ url: source.url, text: htmlToText(listingHtml) })
      const links = discoverArticleLinks(listingHtml, source.url, MAX_ARTICLES)
      const articles = await withConcurrency(links, CONCURRENCY, async l => {
        try {
          const html = await fetchPage(l.url)
          return { url: l.url, text: htmlToText(html) }
        } catch {
          return null
        }
      })
      for (const a of articles) if (a) { pages.push(a); pagesFetched++ }
    }

    const batches = await withConcurrency(pages, 2, p => extractItems(p.url, p.text, p.dateHint).catch(() => [] as ExtractedItem[]))
    const extracted = batches.flat()
    itemsFound = extracted.length

    // 3+4. Shared store step: link, score, propose
    const stored = await storeExtracted(db, source, extracted)
    itemsNew = stored.itemsNew

    await db.from('moba_signal_sources').update({
      status: 'ok',
      last_run_at: new Date().toISOString(),
      ...(itemsNew > 0 ? { last_item_at: new Date().toISOString() } : {}),
      failure_reason: null,
    }).eq('id', sourceId)
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
    await db.from('moba_signal_sources').update({
      status: 'failed',
      last_run_at: new Date().toISOString(),
      failure_reason: error,
    }).eq('id', sourceId)
  }

  if (runRow?.id) {
    await db.from('moba_signal_runs').update({
      finished_at: new Date().toISOString(),
      ok: !error,
      pages_fetched: pagesFetched,
      items_found: itemsFound,
      items_new: itemsNew,
      error: error ?? null,
    }).eq('id', runRow.id)
  }

  return { sourceId, ok: !error, pagesFetched, itemsFound, itemsNew, error }
}
