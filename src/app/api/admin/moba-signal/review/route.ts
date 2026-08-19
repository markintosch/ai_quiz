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

  if (action === 'accept-proposal' || action === 'reject-proposal') {
    const { error } = await db.from('moba_signal_proposals').update({
      state: action === 'accept-proposal' ? 'accepted' : 'rejected',
      decided_at: new Date().toISOString(),
    }).eq('id', body.proposalId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
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
    const { data: item } = await db.from('moba_signal_items').select('entity_id').eq('id', itemId).maybeSingle()
    const entityId = body.entityId ?? item?.entity_id
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
    for (const k of ['verification', 'proximity', 'materiality', 'credibility'] as const) {
      if (body[k] !== undefined) patch[k] = body[k]
    }
    const { error } = await db.from('moba_signal_items').update(patch).eq('id', itemId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}
