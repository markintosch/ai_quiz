// FILE: src/app/api/admin/moba-signal/brief/route.ts
// GET: the current week's draft plus the latest approved brief.
// POST {action:'draft'}: regenerate the draft now.
// POST {action:'approve', briefId, edits}: save the analyst's edits and
// approve. The analyst's wording is final; the agent never edits it back.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'
import { draftWeeklyBrief } from '@/lib/signal/brief'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const EDITABLE = ['headline', 'what_happened', 'key_development', 'why_it_matters',
  'moba_advantage', 'marketing_response', 'sales_response', 'watch_next', 'temperature'] as const

export async function GET() {
  if (!(await isAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any
  const [draft, approved] = await Promise.all([
    db.from('moba_signal_briefs').select('*').eq('status', 'draft').order('week_start', { ascending: false }).limit(1).maybeSingle(),
    db.from('moba_signal_briefs').select('*').eq('status', 'approved').order('week_start', { ascending: false }).limit(1).maybeSingle(),
  ])
  return NextResponse.json({ draft: draft.data ?? null, approved: approved.data ?? null })
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  if (body.action === 'draft') {
    const result = await draftWeeklyBrief(db)
    return NextResponse.json({ ok: result.drafted, ...result }, { status: result.drafted ? 200 : 502 })
  }

  if (body.action === 'approve') {
    if (!body.briefId) return NextResponse.json({ error: 'briefId required' }, { status: 400 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: Record<string, any> = {
      status: 'approved', approved_by: 'Analyst', approved_at: new Date().toISOString(),
    }
    for (const k of EDITABLE) if (body.edits?.[k] !== undefined) patch[k] = body.edits[k]
    const { error } = await db.from('moba_signal_briefs').update(patch).eq('id', body.briefId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 })
}
