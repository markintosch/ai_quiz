// FILE: src/lib/signal/db.ts
// ─── Moba Signal — dashboard read path ────────────────────────────────────────
//
// Maps approved database rows into the SignalDataset the dashboard renders.
// Live mode covers what the pipeline produces today: entities, approved items,
// sources with run health, proposals and questions. Claims, head to head and
// the event calendar still come from the curated sample until their phases
// land — the dashboard labels live mode so nobody mistakes one for the other.
//
// Returns null when the database is unreachable or holds no approved items:
// the page then falls back to the demo dataset, visibly, never silently.

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Entity, OpenQuestion, Ownership, Proposal, Signal, SignalDataset, Source, SourceStatus,
} from '@/products/moba_signal/types'
import { SIGNAL_DEMO } from '@/products/moba_signal/data'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = SupabaseClient<any, any, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

function ownershipOf(r: Row): Ownership {
  if (r.ownership_kind === 'moba') return { kind: 'moba' }
  if (r.ownership_kind === 'group') return { kind: 'group', parentId: r.parent_id ?? '', parentName: r.parent_name ?? '' }
  return { kind: 'independent' }
}

const day = (v: string | null | undefined) => (v ? String(v).slice(0, 10) : '')

export interface LiveDataset {
  dataset: SignalDataset
  counts: { approved: number; proposed: number }
}

export async function loadLiveDataset(supabase: Db): Promise<LiveDataset | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  try {
    const [entityQ, itemQ, srcQ, propQ, questionQ, runQ, annQ, pendingQ] = await Promise.all([
      db.from('moba_signal_entities').select('*'),
      db.from('moba_signal_items').select('*').eq('review_status', 'approved').order('event_date', { ascending: false }).limit(500),
      db.from('moba_signal_sources').select('*').eq('active', true),
      db.from('moba_signal_proposals').select('*').order('created_at', { ascending: false }).limit(50),
      db.from('moba_signal_questions').select('*').order('asked_on', { ascending: false }).limit(50),
      db.from('moba_signal_runs').select('source_id, started_at, ok, items_new').order('started_at', { ascending: false }).limit(400),
      db.from('moba_signal_annotations').select('*'),
      db.from('moba_signal_items').select('id', { count: 'exact', head: true }).eq('review_status', 'proposed'),
    ])
    if (entityQ.error || itemQ.error || srcQ.error) return null
    const items: Row[] = itemQ.data ?? []
    if (items.length === 0) return null

    const asOf = new Date().toISOString().slice(0, 10)

    const entities: Entity[] = (entityQ.data ?? []).map((r: Row) => ({
      id: r.id, name: r.name, type: r.type, ownership: ownershipOf(r),
      priority: r.priority ?? false, regions: r.regions ?? [], note: r.note ?? undefined,
      addedOn: day(r.added_on), backfilledTo: r.backfilled_to ? day(r.backfilled_to) : undefined,
    }))

    const annByItem = new Map<string, Row[]>()
    for (const a of (annQ.data ?? []) as Row[]) {
      annByItem.set(a.item_id, [...(annByItem.get(a.item_id) ?? []), a])
    }

    const signals: Signal[] = items
      .filter(r => r.entity_id) // approval requires a linked entity; belt and braces
      .map(r => ({
        id: r.id,
        date: day(r.event_date),
        entityId: r.entity_id,
        linkedEntityIds: r.linked_entity_ids ?? [],
        title: r.title,
        summary: r.summary,
        type: r.type,
        region: r.region,
        category: r.category,
        proximity: r.proximity,
        materiality: r.materiality,
        credibility: r.credibility,
        status: r.verification,
        sourceId: r.source_id,
        sourceUrl: r.source_url,
        firstSeen: day(r.first_seen),
        lastConfirmed: day(r.last_confirmed),
        assertedBy: r.asserted_by,
        humanReviewed: r.human_reviewed,
        inference: r.inference || undefined,
        annotations: (annByItem.get(r.id) ?? []).map(a => ({
          id: a.id, author: a.author, role: a.role, createdAt: a.created_at,
          means: a.means, consider: a.consider, whoNeedsToKnow: a.who_needs_to_know,
          promotedToBriefing: a.promoted, replies: [],
        })),
      }))

    // Source health from the run log: failed > stale (no item in 14d) > ok
    const lastItemBySource = new Map<string, string>()
    for (const r of items) {
      const prev = lastItemBySource.get(r.source_id)
      if (!prev || r.event_date > prev) lastItemBySource.set(r.source_id, day(r.event_date))
    }
    const runs: Row[] = runQ.data ?? []
    const sources: Source[] = (srcQ.data ?? []).map((r: Row) => {
      const srcRuns = runs.filter(x => x.source_id === r.id)
      const status: SourceStatus =
        r.status === 'failed' ? 'failed'
        : r.last_item_at && (Date.parse(asOf) - Date.parse(r.last_item_at)) > 14 * 86_400_000 ? 'stale'
        : r.status
      return {
        id: r.id, name: r.name, url: r.url, sourceClass: r.source_class, status,
        lastRun: r.last_run_at ?? '', lastItem: lastItemBySource.get(r.id) ?? (r.last_item_at ? day(r.last_item_at) : null),
        itemsLast30d: srcRuns.filter(x => (Date.parse(asOf) - Date.parse(x.started_at)) < 30 * 86_400_000)
          .reduce((a, x) => a + (x.items_new ?? 0), 0),
        scoredItemsLast90d: items.filter(i => i.source_id === r.id).length,
        failureReason: r.failure_reason ?? undefined,
        language: r.language ?? undefined,
      }
    })

    const proposals: Proposal[] = (propQ.data ?? []).map((r: Row) => ({
      id: r.id, kind: r.kind, title: r.title, rationale: r.rationale,
      proposedBy: r.proposed_by, proposedOn: day(r.created_at), state: r.state,
      sourceUrl: r.source_url ?? undefined, why: r.why ?? undefined,
      contributor: r.contributor ?? undefined, channel: r.channel ?? undefined,
      confidential: r.confidential ?? undefined,
    }))

    const questions: OpenQuestion[] = (questionQ.data ?? []).map((r: Row) => ({
      id: r.id, question: r.question, askedBy: r.asked_by, askedOn: day(r.asked_on),
      attempts: r.attempts ?? 0, lastAttempt: r.last_attempt ? day(r.last_attempt) : day(r.asked_on),
      state: r.state, resolution: r.resolution ?? undefined,
    }))

    const contextQ = await db.from('moba_signal_context').select('*')
    const context = (contextQ.data ?? []).map((r: Row) => ({
      id: r.id, name: r.name, owner: r.owner, loadedOn: day(r.loaded_on),
      reviewBy: day(r.review_by), note: r.note ?? undefined,
    }))

    const dataset: SignalDataset = {
      asOf,
      entities,
      signals,
      sources,
      proposals,
      questions,
      context,
      // Curated modules keep the sample until their pipeline phases land
      claims: SIGNAL_DEMO.claims,
      whitespace: SIGNAL_DEMO.whitespace,
      axes: SIGNAL_DEMO.axes,
      headToHead: SIGNAL_DEMO.headToHead,
      events: SIGNAL_DEMO.events,
    }
    return { dataset, counts: { approved: signals.length, proposed: pendingQ.count ?? 0 } }
  } catch {
    return null
  }
}
