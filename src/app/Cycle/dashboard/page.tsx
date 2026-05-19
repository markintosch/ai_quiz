// FILE: src/app/Cycle/dashboard/page.tsx
// Dashboard met 3 visualisaties die meer inzicht geven dan een graph-over-tijd:
//   1. Weekly heatmap (kalender-view, 7 dagen × N weken, intensity per dag)
//   2. Trend vs baseline (slaap, stemming, stress per week + Compass nulmeting referentie)
//   3. Symptoom co-occurrence (welke symptomen treden samen op)

import { redirect } from 'next/navigation'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard — Cycle' }

interface EntryRow {
  entry_date:        string
  mood_score:        number | null
  sleep:             number | null
  stress:            number | null
  alcohol_glasses:   number | null
  busy_day:          boolean | null
  symptoms:          string[] | null
}

export default async function CycleDashboardPage(
  props: {
    searchParams: Promise<{ range?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  const days = searchParams.range === '90d' ? 90 : searchParams.range === '180d' ? 180 : 60
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const sinceISO = since.toISOString().slice(0, 10)

  const supabase = createClient()
  const { data: entries } = await supabase
    .from('cycle_daily_entries')
    .select('entry_date, mood_score, sleep, stress, alcohol_glasses, busy_day, symptoms')
    .eq('user_id', user.id)
    .gte('entry_date', sinceISO)
    .order('entry_date', { ascending: true })

  const rows = (entries ?? []) as EntryRow[]

  // Compass baseline koppelen (voor trend-referentie)
  const sc = createServiceClient()
  const { data: profile } = await sc
    .from('perimenopause_compass_profiles')
    .select('latest_assessment_id, baseline_overall')
    .ilike('email', user.email)
    .maybeSingle()

  type CompassBaselineRow = {
    score_overall: number; score_sleep_recovery: number;
    score_energy_capacity: number; score_stress_context: number;
  }
  let baseline: CompassBaselineRow | null = null
  const cp = profile as { latest_assessment_id?: string | null } | null
  if (cp?.latest_assessment_id) {
    const { data } = await sc
      .from('perimenopause_compass_assessments')
      .select('score_overall, score_sleep_recovery, score_energy_capacity, score_stress_context')
      .eq('id', cp.latest_assessment_id)
      .maybeSingle()
    baseline = (data as unknown as CompassBaselineRow | null) ?? null
  }

  return (
    <DashboardClient
      entries={rows}
      baseline={baseline}
      range={days}
    />
  )
}

