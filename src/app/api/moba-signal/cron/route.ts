// FILE: src/app/api/moba-signal/cron/route.ts
// ─── Moba Signal — scheduled collection with rotation ─────────────────────────
//
// Fires every 2 hours (vercel.json). Each firing runs the BATCH_SIZE active
// sources with the oldest last_run_at, so all sources get covered roughly 4x
// daily (PRD cadence) while no single invocation ever runs long, and one slow
// site cannot starve the others: it just goes to the back of the rotation.
//
// Authorization: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`.

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runSource } from '@/lib/signal/runner'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const BATCH_SIZE = 3

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Oldest-run-first rotation; never-run sources go first
  const { data: sources, error } = await db
    .from('moba_signal_sources')
    .select('id, last_run_at')
    .eq('active', true)
    .order('last_run_at', { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE)
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const results = []
  for (const s of sources ?? []) {
    results.push(await runSource(supabase, s.id))
  }

  return NextResponse.json({
    ok: true,
    ran: results.map(r => ({ sourceId: r.sourceId, ok: r.ok, itemsNew: r.itemsNew, error: r.error })),
  })
}
