// FILE: src/app/api/cycle/import/healthkit/route.ts
// Accepts a batch of per-day summaries parsed client-side from Apple Health
// export. For each day:
//   - If no existing entry for that date → insert a new row with defaults
//     for the user-entered fields (mood=5, stress=5, etc.) plus the
//     Health-derived data.
//   - If an existing entry → only update fields that are still defaults
//     (so we don't overwrite her own manual entries).
//
// We never accept or persist the raw XML — that stays on her device.

import { NextResponse } from 'next/server'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { detectPhase, inferPeriodStarts } from '@/lib/cycle/phase'
import { computeReadiness } from '@/lib/cycle/score'
import type { CyclePhase, ActivityType, ActivityIntensity } from '@/lib/cycle/types'

interface IncomingDay {
  date?: string
  sleep?: number
  menstruation_flag?: boolean
  activity_types?: string[]
  activity_intensity?: string | null
}

const ACTIVITY_TYPES: ActivityType[] = ['None', 'Walk', 'Run', 'Cycle', 'Strength', 'Yoga', 'Other']
const INTENSITIES: ActivityIntensity[] = ['Low', 'Medium', 'High']
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

export async function POST(req: Request) {
  const user = await requireCycleUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  // Rate limit: max 5 batch-uploads per user per hour. Each batch can have
  // hundreds of days — this isn't an interactive endpoint, just a one-off
  // backfill.
  if (!rateLimit(`cycle-import:${user.id}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as { days?: IncomingDay[] }
  const incoming = Array.isArray(body.days) ? body.days : []
  if (incoming.length === 0) {
    return NextResponse.json({ ok: false, error: 'empty' }, { status: 400 })
  }
  if (incoming.length > 1500) {
    return NextResponse.json({ ok: false, error: 'too_many' }, { status: 413 })
  }

  const supabase = createClient()

  // Profile for phase detection
  const { data: profile } = await supabase
    .from('cycle_profiles')
    .select('last_period_start, typical_length')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile) {
    return NextResponse.json({ ok: false, error: 'no_profile' }, { status: 400 })
  }

  // Load all existing entries for the date range so we can decide
  // insert-vs-update once per day.
  const validDates = incoming
    .map(d => d.date)
    .filter((d): d is string => typeof d === 'string' && ISO_RE.test(d))
  if (validDates.length === 0) {
    return NextResponse.json({ ok: false, error: 'no_valid_dates' }, { status: 400 })
  }
  const minDate = validDates.reduce((a, b) => a < b ? a : b)
  const maxDate = validDates.reduce((a, b) => a > b ? a : b)

  const { data: existing } = await supabase
    .from('cycle_daily_entries')
    .select('entry_date, mood_score, mood_variable, sleep, stress, activity_types, activity_intensity, menstruation_flag, alcohol_glasses, nap_taken, busy_day, symptoms, symptom_intensities')
    .eq('user_id', user.id)
    .gte('entry_date', minDate)
    .lte('entry_date', maxDate)

  type ExistingRow = NonNullable<typeof existing>[number]
  const existingByDate: Record<string, ExistingRow> = {}
  for (const row of existing ?? []) existingByDate[row.entry_date as string] = row

  // Pre-fetch menstruation history for phase prediction (we'll combine with
  // incoming period dates for the final inference)
  const { data: pastMenses } = await supabase
    .from('cycle_daily_entries')
    .select('entry_date')
    .eq('user_id', user.id)
    .eq('menstruation_flag', true)
    .order('entry_date', { ascending: false })
    .limit(200)

  // Build a combined menstruation date list: past from DB + new from incoming
  const allMensDates = new Set<string>([
    ...(pastMenses?.map(r => r.entry_date as string) ?? []),
    ...incoming.filter(d => d.menstruation_flag && d.date && ISO_RE.test(d.date)).map(d => d.date as string),
  ])

  let inserted = 0
  let updated = 0
  let skipped = 0
  let errored = 0

  // Process in chronological order so phase detection uses the right context
  const sorted = incoming
    .filter(d => d.date && ISO_RE.test(d.date))
    .sort((a, b) => (a.date as string).localeCompare(b.date as string))

  for (const day of sorted) {
    const date = day.date as string
    try {
      // Validate
      const sleep = Number.isFinite(day.sleep) ? Math.max(1, Math.min(10, Math.round(day.sleep!))) : null
      const types = (day.activity_types ?? []).filter((t): t is ActivityType => ACTIVITY_TYPES.includes(t as ActivityType))
      const intensity = INTENSITIES.includes(day.activity_intensity as ActivityIntensity) ? (day.activity_intensity as ActivityIntensity) : null
      const isRest = !types.length || (types.length === 1 && types[0] === 'None')
      const finalTypes: ActivityType[] = isRest ? ['None'] : types
      const finalIntensity = isRest ? null : intensity
      const period = Boolean(day.menstruation_flag)

      // Phase detection for this date
      const datesUpToHere = Array.from(allMensDates).filter(d => d <= date)
      const periodStarts = inferPeriodStarts(datesUpToHere)
      const phaseResult = detectPhase({
        today: date,
        cycle_profile: {
          last_period_start: profile.last_period_start ?? date,
          typical_length:    profile.typical_length ?? 28,
        },
        recent_period_starts: periodStarts,
      })

      // For readiness we don't have mood/stress at backfill time — use neutral.
      // The score will be approximate but consistent for the timeline.
      const score = computeReadiness({
        sleep:               sleep ?? 7,
        stress:              5,
        cycle_phase:         phaseResult.phase as CyclePhase,
        yesterday_intensity: null,
        yesterday_was_rest:  false,
      })

      const existingRow = existingByDate[date]
      if (existingRow) {
        // Only fill in fields that are still at their default — never
        // overwrite manual data.
        const update: Record<string, unknown> = {}
        if (sleep != null && existingRow.sleep === 7) update.sleep = sleep
        if (period && !existingRow.menstruation_flag) update.menstruation_flag = true
        if (!isRest && (Array.isArray(existingRow.activity_types) ? existingRow.activity_types.length === 1 && existingRow.activity_types[0] === 'None' : true)) {
          update.activity_types = finalTypes
          update.activity_intensity = finalIntensity
        }
        if (Object.keys(update).length === 0) {
          skipped++
          continue
        }
        const { error } = await supabase
          .from('cycle_daily_entries')
          .update(update)
          .eq('user_id', user.id)
          .eq('entry_date', date)
        if (error) { errored++; continue }
        updated++
      } else {
        const { error } = await supabase
          .from('cycle_daily_entries')
          .insert({
            user_id:            user.id,
            entry_date:         date,
            mood_score:         5,                              // neutral default
            mood_variable:      false,
            sleep:              sleep ?? 7,
            stress:             5,
            activity_types:     finalTypes,
            activity_intensity: finalIntensity,
            alcohol_glasses:    0,
            symptoms:           [],
            symptom_intensities: {},
            nap_taken:          false,
            busy_day:           false,
            menstruation_flag:  period,
            readiness_score:    score.readiness,
            cycle_phase:        phaseResult.phase,
          })
        if (error) { errored++; continue }
        inserted++
      }
    } catch (err) {
      console.error('[cycle import] day failed', date, err)
      errored++
    }
  }

  return NextResponse.json({
    ok: true,
    inserted,
    updated,
    skipped,
    errored,
    range: { from: minDate, to: maxDate },
  })
}
