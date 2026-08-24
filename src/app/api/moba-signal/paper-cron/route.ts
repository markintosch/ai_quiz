// FILE: src/app/api/moba-signal/paper-cron/route.ts
// Quarterly (1 Feb / 1 May / 1 Aug / 1 Nov, 07:30 UTC — vercel.json): the
// Positioning agent drafts the Brand & Positioning paper for the new quarter.
// Draft only; the analyst approves in the console before anything renders.

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { draftPositioningPaper } from '@/lib/signal/paper'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const result = await draftPositioningPaper(createServiceClient())
  return NextResponse.json({ ok: result.drafted, ...result }, { status: result.drafted ? 200 : 502 })
}
