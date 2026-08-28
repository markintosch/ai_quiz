// FILE: src/app/api/admin/moba-signal/review/route.ts
// POST — the human half of the pipeline. Three actions:
//   { itemId, action: 'approve', entityId?, verification?, proximity?, materiality?, credibility?, note? }
//   { itemId, action: 'reject', note? }
//   { proposalId, action: 'accept-proposal' | 'reject-proposal' }
// Approval requires a linked entity. Rejections keep the row and the note:
// that is the learning loop's raw material.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

/** Slug for entities/sources created from the console: 'Huanong Machinery' -> 'huanong-machinery' */
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'entity'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createEntity(db: any, name: string, note?: string): Promise<{ id?: string; error?: string }> {
  const id = slugify(name)
  const { error } = await db.from('moba_signal_entities').insert({
    id, name, type: 'competitor', ownership_kind: 'independent',
    aliases: [name], note: note ?? 'Created from the review console.',
  })
  // 23505 = already exists, which is fine: link to the existing row
  if (error && String(error.code) !== '23505') return { error: error.message }
  return { id }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any
  const action = String(body.action ?? '')

  // Context corpus is the lens the agents read everything through; a stale lens
  // corrupts scoring silently, so each item carries a review date. Marking it
  // reviewed pushes the date forward (default +90 days) or to a date the analyst set.
  if (action === 'mark-context-reviewed') {
    const contextId = String(body.contextId ?? '')
    if (!contextId) return NextResponse.json({ error: 'contextId required' }, { status: 400 })
    let reviewBy = typeof body.reviewBy === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.reviewBy) ? body.reviewBy : null
    if (!reviewBy) {
      const d = new Date()
      d.setDate(d.getDate() + 90)
      reviewBy = d.toISOString().slice(0, 10)
    }
    const { data, error } = await db.from('moba_signal_context')
      .update({ review_by: reviewBy }).eq('id', contextId).select('id, review_by')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data || data.length === 0) {
      return NextResponse.json({ error: `No context item found with id "${contextId}"` }, { status: 404 })
    }
    return NextResponse.json({ ok: true, reviewBy })
  }

  if (action === 'accept-proposal' || action === 'reject-proposal') {
    const { data: prop } = await db.from('moba_signal_proposals').select('*').eq('id', body.proposalId).maybeSingle()
    if (!prop) return NextResponse.json({ error: 'Unknown proposal' }, { status: 404 })

    // Accepting is not just bookkeeping: entity and source proposals
    // materialise into real rows, so the pipeline can use them immediately.
    let created: string | undefined
    if (action === 'accept-proposal') {
      const name = String(prop.title).replace(/^(Add source|Track new entity|Add data pipeline|Add watchlist):\s*/i, '').trim()
      if (prop.kind === 'entity') {
        const r = await createEntity(db, name, prop.rationale)
        if (r.error) return NextResponse.json({ error: r.error }, { status: 500 })
        created = `entity ${r.id}`
      } else if (prop.kind === 'source' && prop.source_url) {
        const id = slugify(name)
        const { error } = await db.from('moba_signal_sources').insert({
          id, name, url: prop.source_url, source_class: 'trade-press', ingest: 'scrape',
        })
        if (error && String(error.code) !== '23505') {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        created = `source ${id}`
      }
    }

    const { error } = await db.from('moba_signal_proposals').update({
      state: action === 'accept-proposal' ? 'accepted' : 'rejected',
      decided_at: new Date().toISOString(),
    }).eq('id', body.proposalId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, created })
  }

  const itemId = String(body.itemId ?? '')
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })

  if (action === 'reject') {
    const { error } = await db.from('moba_signal_items').update({
      review_status: 'rejected',
      reviewed_at: new Date().toISOString(),
      review_note: body.note ?? null,
      human_reviewed: true,
    }).eq('id', itemId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'approve') {
    const { data: item } = await db.from('moba_signal_items').select('entity_id, entity_guess').eq('id', itemId).maybeSingle()
    let entityId = body.entityId ?? item?.entity_id
    // One-step path for unmatched items: create the guessed entity and link it
    if (entityId === '__new__') {
      const name = String(body.newEntityName ?? item?.entity_guess ?? '').trim()
      if (!name) return NextResponse.json({ error: 'No entity name to create.' }, { status: 400 })
      const r = await createEntity(db, name)
      if (r.error) return NextResponse.json({ error: r.error }, { status: 500 })
      entityId = r.id
    }
    if (!entityId) {
      return NextResponse.json({ error: 'Approval requires a linked entity. Pick one first.' }, { status: 400 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: Record<string, any> = {
      review_status: 'approved',
      reviewed_at: new Date().toISOString(),
      review_note: body.note ?? null,
      human_reviewed: true,
      entity_id: entityId,
      entity_guess: null,
    }
    for (const k of ['verification', 'proximity', 'materiality', 'credibility', 'disposition', 'recommended_action'] as const) {
      if (body[k] !== undefined) patch[k] = body[k]
    }
    const { error } = await db.from('moba_signal_items').update(patch).eq('id', itemId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}
