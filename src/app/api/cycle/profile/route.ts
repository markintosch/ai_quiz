// FILE: src/app/api/cycle/profile/route.ts
// PATCH cycle_profiles fields editable from settings.

import { NextResponse } from 'next/server'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

export async function PATCH(req: Request) {
  const user = await requireCycleUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  if (!rateLimit(`cycle-profile:${user.id}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    last_period_start?: string
    typical_length?: number
    reminder_time?: string
  }

  const update: Record<string, unknown> = {}
  if (body.last_period_start && /^\d{4}-\d{2}-\d{2}$/.test(body.last_period_start)) {
    update.last_period_start = body.last_period_start
  }
  if (Number.isFinite(body.typical_length) && body.typical_length! >= 14 && body.typical_length! <= 60) {
    update.typical_length = body.typical_length
  }
  if (body.reminder_time && /^\d{2}:\d{2}$/.test(body.reminder_time)) {
    update.reminder_time = body.reminder_time
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('cycle_profiles')
    .update(update)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ ok: false, error: 'db' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
