// FILE: src/app/Cycle/insights/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import { runInsightRules } from '@/lib/cycle/insights'
import InsightsClient from './InsightsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Patronen — Cycle Companion' }

export default async function InsightsPage() {
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  const supabase = await createClient()

  const [{ data: entries }, { data: weather }, { data: seenRules }] = await Promise.all([
    supabase.from('cycle_daily_entries')
      .select('entry_date, mood_score, sleep, stress, readiness_score, activity_intensity, activity_types, alcohol_glasses, symptoms, symptom_intensities, nap_taken, busy_day, cycle_phase')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: true })
      .limit(120),
    supabase.from('cycle_weather')
      .select('entry_date, condition')
      .eq('user_id', user.id),
    supabase.from('cycle_insights_seen')
      .select('rule_key')
      .eq('user_id', user.id)
      .is('dismissed_at', null),
  ])

  const weatherByDate: Record<string, string | null> = Object.fromEntries(
    (weather ?? []).map(w => [w.entry_date, w.condition]),
  )

  const inputs = (entries ?? []).map(e => ({
    date:               e.entry_date,
    mood:               e.mood_score,
    sleep:              e.sleep,
    stress:             e.stress,
    readiness:          e.readiness_score,
    activity_intensity: e.activity_intensity,
    activity_types:     e.activity_types ?? [],
    alcohol_glasses:    e.alcohol_glasses ?? 0,
    symptoms:           e.symptoms ?? [],
    symptom_intensities: (e.symptom_intensities ?? {}) as Record<string, number>,
    nap_taken:          e.nap_taken ?? false,
    busy_day:           e.busy_day ?? false,
    cycle_phase:        e.cycle_phase,
    rainy:              weatherByDate[e.entry_date] === 'rainy',
  }))

  const all = runInsightRules(inputs)
  const seenKeys = new Set((seenRules ?? []).map(s => s.rule_key))
  const unseen = all.filter(r => !seenKeys.has(r.rule_key))

  return <InsightsClient insights={unseen} totalEntries={entries?.length ?? 0} />
}
