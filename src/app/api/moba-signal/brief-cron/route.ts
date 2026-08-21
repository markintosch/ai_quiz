// FILE: src/app/api/moba-signal/brief-cron/route.ts
// Monday 06:30 UTC (vercel.json): the Editor agent drafts the weekly brief.
// Draft only; the analyst approves in the console before anything renders.

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { draftWeeklyBrief } from '@/lib/signal/brief'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const result = await draftWeeklyBrief(createServiceClient())
  return NextResponse.json({ ok: result.drafted, ...result }, { status: result.drafted ? 200 : 502 })
}
