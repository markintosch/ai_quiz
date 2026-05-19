// FILE: src/app/Cycle/output/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import { computeReadiness, guidanceFor } from '@/lib/cycle/score'
import type { CyclePhase, ActivityIntensity, ReadinessBand } from '@/lib/cycle/types'
import OutputClient from './OutputClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Vandaag — Cycle Companion' }

const PHASE_LABEL_NL: Record<CyclePhase, string> = {
  menstrual:      'Menstruatie',
  follicular:     'Folliculair',
  ovulation:      'Ovulatie',
  'luteal-early': 'Luteaal — vroeg',
  'luteal-late':  'Luteaal — laat',
  unknown:        'Cyclus onduidelijk',
}

export default async function OutputPage() {
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  const today = new Date().toISOString().slice(0, 10)
  const supabase = await createClient()

  const [{ data: entry }, { data: weather }, { count: totalEntries }] = await Promise.all([
    supabase.from('cycle_daily_entries')
      .select('mood_score, sleep, stress, cycle_phase, readiness_score, score_feedback')
      .eq('user_id', user.id)
      .eq('entry_date', today)
      .maybeSingle(),
    supabase.from('cycle_weather')
      .select('temp_c, condition')
      .eq('user_id', user.id)
      .eq('entry_date', today)
      .maybeSingle(),
    supabase.from('cycle_daily_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  if (!entry) redirect('/Cycle/today')

  // Cold-start: hide score before 3 entries.
  const showScore = (totalEntries ?? 0) >= 3

  // Recompute components for the "why" expand. We don't store them; cheap to redo.
  const { data: yesterday } = await supabase
    .from('cycle_daily_entries')
    .select('activity_types, activity_intensity')
    .eq('user_id', user.id)
    .lt('entry_date', today)
    .order('entry_date', { ascending: false })
    .limit(1)
    .maybeSingle()
  const yIsRest = Array.isArray(yesterday?.activity_types) &&
    yesterday!.activity_types.length === 1 &&
    yesterday!.activity_types[0] === 'None'

  const score = computeReadiness({
    sleep:              entry.sleep,
    stress:             entry.stress,
    cycle_phase:        entry.cycle_phase as CyclePhase,
    yesterday_intensity:(yesterday?.activity_intensity ?? null) as ActivityIntensity | null,
    yesterday_was_rest: yIsRest,
  })

  const guidance = guidanceFor(score.band)
  const phaseLabel = PHASE_LABEL_NL[entry.cycle_phase as CyclePhase]

  return (
    <OutputClient
      readiness={entry.readiness_score ?? score.readiness}
      band={score.band as ReadinessBand}
      guidance={guidance}
      phaseLabel={phaseLabel}
      components={score.components}
      weather={
        weather && weather.temp_c != null && weather.condition
          ? { temp_c: weather.temp_c, condition: weather.condition }
          : null
      }
      feedback={(entry.score_feedback as -1 | 0 | 1 | null) ?? null}
      showScore={showScore}
      totalEntries={totalEntries ?? 0}
    />
  )
}
