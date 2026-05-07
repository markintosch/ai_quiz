// FILE: src/lib/atelier/crawl/runner.ts
// ──────────────────────────────────────────────────────────────────────────────
// Crawl runner — given a source row, dispatches to the right adapter,
// extracts in parallel (capped concurrency), and persists into
// atelier_source_extracts. Updates last_crawled_at + status on the source.

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { isSubstackUrl, discoverSubstackTargets, extractSubstackPost } from './substack'
import { isBeehiivUrl,  discoverBeehiivTargets,  extractBeehiivPost  } from './beehiiv'
import {                  discoverGenericTargets, extractGenericPage  } from './generic'
import type { CrawlTarget, ExtractResult, CrawlResult } from './types'

function sb(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

interface SourceRow {
  id:       string
  url:      string | null
  name:     string
  metadata: Record<string, unknown> | null
}

// Concurrency cap so we don't hammer a host with parallel requests.
const CONCURRENCY = 3

async function runWithConcurrency<T, R>(
  items: T[], n: number, worker: (item: T) => Promise<R>,
): Promise<R[]> {
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

export async function crawlSource(sourceId: string): Promise<CrawlResult> {
  const client = sb()

  const { data: src } = await client
    .from('atelier_sources')
    .select('id, url, name, metadata')
    .eq('id', sourceId)
    .maybeSingle() as { data: SourceRow | null }

  if (!src) throw new Error(`Source ${sourceId} niet gevonden`)
  if (!src.url) {
    return { source_id: sourceId, pages_attempted: 0, pages_extracted: 0, pages_errored: 0, status: 'failed', results: [] }
  }

  const meta = src.metadata ?? {}
  const maxPages = Math.min(Math.max(Number((meta as { max_pages?: number }).max_pages ?? 12), 1), 50)

  // 1. Pick adapter + discover targets
  let targets: CrawlTarget[] = []
  let adapterError: string | null = null
  try {
    if (isSubstackUrl(src.url)) {
      targets = await discoverSubstackTargets(src.url, maxPages)
    } else if (isBeehiivUrl(src.url)) {
      targets = await discoverBeehiivTargets(src.url, maxPages)
    } else {
      targets = await discoverGenericTargets(src.url, maxPages)
    }
  } catch (err) {
    adapterError = err instanceof Error ? err.message : 'discovery faalde'
  }

  if (adapterError || targets.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (client.from('atelier_sources') as any).update({
      last_crawled_at:   new Date().toISOString(),
      last_crawl_status: 'failed',
      last_crawl_pages:  0,
      last_crawl_errors: 0,
    }).eq('id', sourceId)
    return {
      source_id: sourceId,
      pages_attempted: 0,
      pages_extracted: 0,
      pages_errored:   0,
      status: 'failed',
      results: [],
    }
  }

  // 2. Pick extractor based on URL pattern
  const extractFn = isSubstackUrl(src.url) ? extractSubstackPost
                  : isBeehiivUrl(src.url)  ? extractBeehiivPost
                  : extractGenericPage

  // 3. Skip URLs we already extracted (incremental crawl)
  const urls = targets.map(t => t.url)
  const { data: existing } = await client
    .from('atelier_source_extracts')
    .select('url')
    .eq('source_id', sourceId)
    .in('url', urls) as { data: { url: string }[] | null }
  const seen = new Set((existing ?? []).map(r => r.url))
  const fresh = targets.filter(t => !seen.has(t.url))

  // 4. Extract (with concurrency cap)
  const results: ExtractResult[] = await runWithConcurrency(fresh, CONCURRENCY, extractFn)

  // 5. Persist
  let extractedOk = 0
  let errored = 0
  for (const r of results) {
    if (r.error_message) errored += 1
    else extractedOk += 1
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (client.from('atelier_source_extracts') as any).upsert({
      source_id:     sourceId,
      url:           r.url,
      title:         r.title,
      signals:       r.signals,
      trend_claim:   r.trend_claim,
      excerpt:       r.excerpt,
      extractor:     r.extractor,
      error_message: r.error_message,
      extracted_at:  new Date().toISOString(),
    }, { onConflict: 'source_id,url' })
  }

  // 6. Update source freshness
  const status: CrawlResult['status'] =
    extractedOk === 0          ? 'failed' :
    errored > extractedOk      ? 'partial' :
    'ok'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (client.from('atelier_sources') as any).update({
    last_crawled_at:   new Date().toISOString(),
    last_crawl_status: status,
    last_crawl_pages:  extractedOk,
    last_crawl_errors: errored,
  }).eq('id', sourceId)

  return {
    source_id: sourceId,
    pages_attempted: results.length,
    pages_extracted: extractedOk,
    pages_errored:   errored,
    status,
    results,
  }
}
