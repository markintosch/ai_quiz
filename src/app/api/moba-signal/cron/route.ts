// FILE: src/app/api/moba-signal/cron/route.ts
// ─── Moba Signal — scheduled collection with rotation ─────────────────────────
//
// Vercel Hobby allows each cron job to fire once per day, so vercel.json
// registers FOUR daily entries on this route (05:30, 11:30, 17:30, 23:30 UTC,
// each ±59 min on Hobby). Each firing runs the BATCH_SIZE active sources with
// the oldest last_run_at: 16 source-runs a day, so every source is collected
// at least daily and one slow site just rotates to the back. A Pro upgrade
// would allow a single 2-hourly entry instead; the route needs no change.
//
// Authorization: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`.

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runSource } from '@/lib/signal/runner'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const BATCH_SIZE = 4

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
