// FILE: src/app/api/admin/moba-signal/paper/route.ts
// GET: current draft, latest approved edition, configured positioning pages.
// POST {action:'draft'}: run the Positioning agent now (minutes, not seconds).
// POST {action:'approve', edition, implications?, placements?}: save the
// analyst's edits and approve. The analyst's wording is final; an approved
// edition is never overwritten by the agent.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'
import { draftPositioningPaper } from '@/lib/signal/paper'
import type { PositioningPaper } from '@/products/moba_signal/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET() {
  if (!(await isAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any
  const [draft, approved, pages] = await Promise.all([
    db.from('moba_signal_papers').select('*').eq('status', 'draft').order('edition', { ascending: false }).limit(1).maybeSingle(),
    db.from('moba_signal_papers').select('*').eq('status', 'approved').order('edition', { ascending: false }).limit(1).maybeSingle(),
    db.from('moba_signal_paper_pages').select('*').order('entity_id'),
  ])
  return NextResponse.json({
    draft: draft.data ?? null,
    approved: approved.data ?? null,
    pages: pages.data ?? [],
  })
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  if (body.action === 'draft') {
    const result = await draftPositioningPaper(db)
    return NextResponse.json({ ok: result.drafted, ...result }, { status: result.drafted ? 200 : 502 })
  }

  if (body.action === 'approve') {
    if (!body.edition) return NextResponse.json({ error: 'edition required' }, { status: 400 })
    const { data: row } = await db.from('moba_signal_papers')
      .select('*').eq('edition', body.edition).maybeSingle()
    if (!row) return NextResponse.json({ error: `No edition ${body.edition}` }, { status: 404 })

    const content = row.content as PositioningPaper
    if (typeof body.implications === 'string' && body.implications.trim().length > 0) {
      content.implications = body.implications.trim()
    }
    // Analyst-adjusted map coordinates: {entityId: {x, y}}
    if (body.placements && typeof body.placements === 'object') {
      for (const p of content.map.placements) {
        const edit = body.placements[p.entityId]
        if (edit && Number.isFinite(edit.x) && Number.isFinite(edit.y)) {
          p.x = Math.max(0, Math.min(100, Math.round(edit.x)))
          p.y = Math.max(0, Math.min(100, Math.round(edit.y)))
        }
      }
    }
    const approvedAt = new Date().toISOString()
    content.approvedBy = 'Analyst'
    content.approvedAt = approvedAt
    const { error } = await db.from('moba_signal_papers').update({
      status: 'approved', content, approved_by: 'Analyst', approved_at: approvedAt,
    }).eq('edition', body.edition)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 })
}
