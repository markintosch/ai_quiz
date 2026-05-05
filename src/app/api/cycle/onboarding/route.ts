// FILE: src/app/api/cycle/onboarding/route.ts

import { NextResponse } from 'next/server'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: Request) {
  const user = await requireCycleUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  if (!rateLimit(`cycle-onboarding:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    last_period_start?: string
    typical_length?: number
    lat?: number
    lon?: number
    timezone?: string
    reminder_time?: string
  }

  const lastPeriod = body.last_period_start
  const typical    = Number(body.typical_length)
  const lat        = Number(body.lat)
  const lon        = Number(body.lon)
  const timezone   = body.timezone ?? 'Europe/Amsterdam'
  const reminder   = body.reminder_time ?? '20:00'

  if (
    !lastPeriod || !/^\d{4}-\d{2}-\d{2}$/.test(lastPeriod) ||
    !Number.isFinite(typical) || typical < 14 || typical > 60 ||
    !Number.isFinite(lat) || !Number.isFinite(lon) ||
    !/^\d{2}:\d{2}$/.test(reminder)
  ) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const supabase = createClient()
  const { error } = await supabase
    .from('cycle_profiles')
    .upsert({
      user_id:           user.id,
      last_period_start: lastPeriod,
      typical_length:    typical,
      lat,
      lon,
      timezone,
      reminder_time:     reminder,
      onboarded_at:      new Date().toISOString(),
    })

  if (error) {
    console.error('cycle onboarding error', error)
    return NextResponse.json({ ok: false, error: 'db' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
