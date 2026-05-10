// FILE: src/app/api/cycle/checkin/route.ts
// Daily check-in: validate, derive cycle_phase + readiness_score, upsert.

import { NextResponse } from 'next/server'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { detectPhase, inferPeriodStarts } from '@/lib/cycle/phase'
import { computeReadiness } from '@/lib/cycle/score'
import type { ActivityIntensity, ActivityType, CyclePhase } from '@/lib/cycle/types'
import { fetchWeather } from '@/lib/cycle/weather'
import { isValidSymptom, type SymptomKey } from '@/lib/cycle/symptoms'

const ACTIVITY_TYPES: ActivityType[] = ['None', 'Walk', 'Run', 'Cycle', 'Strength', 'Yoga', 'Other']
const INTENSITIES: ActivityIntensity[] = ['Low', 'Medium', 'High']

function isISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

function previousISODate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

export async function POST(req: Request) {
  const user = await requireCycleUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  if (!rateLimit(`cycle-checkin:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    entry_date?: string
    mood_score?: number
    mood_variable?: boolean
    sleep?: number
    stress?: number
    activity_types?: string[]
    activity_intensity?: string | null
    alcohol_glasses?: number
    symptoms?: string[]
    nap_taken?: boolean
    busy_day?: boolean
    menstruation_flag?: boolean
  }

  // ── Validation ──────────────────────────────────────────────────────────
  const entryDate = body.entry_date ?? ''
  const mood      = Number(body.mood_score)
  const sleep     = Number(body.sleep)
  const stress    = Number(body.stress)
  const alcohol   = Number(body.alcohol_glasses ?? 0)
  const types     = (body.activity_types ?? []).filter((t): t is ActivityType =>
    ACTIVITY_TYPES.includes(t as ActivityType))
  const intensity = body.activity_intensity ?? null
  const symptoms  = (body.symptoms ?? []).filter(isValidSymptom) as SymptomKey[]
  const napTaken  = Boolean(body.nap_taken)
  const busyDay   = Boolean(body.busy_day)

  if (
    !isISODate(entryDate) ||
    !Number.isFinite(mood)   || mood < 0 || mood > 10 ||
    !Number.isFinite(sleep)  || sleep < 1 || sleep > 10 ||
    !Number.isFinite(stress) || stress < 1 || stress > 10 ||
    !Number.isFinite(alcohol) || alcohol < 0 || alcohol > 10 ||
    types.length === 0
  ) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }
  const isRest = types.length === 1 && types[0] === 'None'
  if (!isRest && !INTENSITIES.includes(intensity as ActivityIntensity)) {
    return NextResponse.json({ ok: false, error: 'invalid_intensity' }, { status: 400 })
  }

  // ── Profile (for phase detection) ───────────────────────────────────────
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('cycle_profiles')
    .select('last_period_start, typical_length, lat, lon, timezone')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile) {
    return NextResponse.json({ ok: false, error: 'no_profile' }, { status: 400 })
  }

  // ── Recent menstruation history → period starts → phase ──────────────────
  const { data: recentMenses } = await supabase
    .from('cycle_daily_entries')
    .select('entry_date')
    .eq('user_id', user.id)
    .eq('menstruation_flag', true)
    .order('entry_date', { ascending: false })
    .limit(60)

  // Include today's flag in the inference
  const menstruationDates = [
    ...(recentMenses?.map(r => r.entry_date as string) ?? []),
    ...(body.menstruation_flag ? [entryDate] : []),
  ]
  const periodStarts = inferPeriodStarts(menstruationDates)
  const phaseResult = detectPhase({
    today: entryDate,
    cycle_profile: {
      last_period_start: profile.last_period_start ?? entryDate,
      typical_length:    profile.typical_length ?? 28,
    },
    recent_period_starts: periodStarts,
  })

  // ── Yesterday's activity (for activityRecoveryScore) ─────────────────────
  const yesterday = previousISODate(entryDate)
  const { data: y } = await supabase
    .from('cycle_daily_entries')
    .select('activity_types, activity_intensity')
    .eq('user_id', user.id)
    .eq('entry_date', yesterday)
    .maybeSingle()

  const yesterdayWasRest = y
    ? Array.isArray(y.activity_types) && y.activity_types.length === 1 && y.activity_types[0] === 'None'
    : false
  const yesterdayIntensity = (y?.activity_intensity ?? null) as ActivityIntensity | null

  // ── Score computation ────────────────────────────────────────────────────
  const score = computeReadiness({
    sleep,
    stress,
    cycle_phase: phaseResult.phase as CyclePhase,
    yesterday_intensity: yesterdayIntensity,
    yesterday_was_rest: yesterdayWasRest,
  })

  // ── Upsert ──────────────────────────────────────────────────────────────
  const { error: upsertErr } = await supabase
    .from('cycle_daily_entries')
    .upsert({
      user_id:            user.id,
      entry_date:         entryDate,
      mood_score:         mood,
      mood_variable:      Boolean(body.mood_variable),
      sleep,
      stress,
      activity_types:     types,
      activity_intensity: isRest ? null : (intensity as ActivityIntensity),
      alcohol_glasses:    alcohol,
      symptoms,
      nap_taken:          napTaken,
      busy_day:           busyDay,
      menstruation_flag:  Boolean(body.menstruation_flag),
      readiness_score:    score.readiness,
      cycle_phase:        phaseResult.phase,
    }, { onConflict: 'user_id,entry_date' })

  if (upsertErr) {
    console.error('cycle checkin error', upsertErr)
    return NextResponse.json({ ok: false, error: 'db' }, { status: 500 })
  }

  // ── Weather snapshot (best-effort, never blocks) ─────────────────────────
  if (profile.lat != null && profile.lon != null) {
    fetchWeather(profile.lat, profile.lon, profile.timezone ?? 'Europe/Amsterdam')
      .then(async w => {
        if (!w) return
        await supabase.from('cycle_weather').upsert({
          user_id:    user.id,
          entry_date: entryDate,
          temp_c:     w.temp_c,
          precip_mm:  w.precip_mm,
          cloud_pct:  w.cloud_pct,
          wind_kmh:   w.wind_kmh,
          condition:  w.condition,
        }, { onConflict: 'user_id,entry_date' })
      })
      .catch(err => console.error('weather snapshot failed', err))
  }

  return NextResponse.json({
    ok: true,
    readiness: score.readiness,
    band: score.band,
    phase: phaseResult.phase,
    day_of_cycle: phaseResult.day_of_cycle,
  })
}
