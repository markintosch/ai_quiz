// FILE: src/app/api/cycle/feedback/route.ts
// Daily thumbs feedback on the readiness score.

import { NextResponse } from 'next/server'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: Request) {
  const user = await requireCycleUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  if (!rateLimit(`cycle-feedback:${user.id}`, 30, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as { feedback?: number }
  const value = body.feedback
  if (value !== -1 && value !== 0 && value !== 1) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const supabase = await createClient()
  const { error } = await supabase
    .from('cycle_daily_entries')
    .update({ score_feedback: value })
    .eq('user_id', user.id)
    .eq('entry_date', today)

  if (error) {
    console.error('cycle feedback error', error)
    return NextResponse.json({ ok: false, error: 'db' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
