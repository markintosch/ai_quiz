// FILE: src/app/Cycle/timeline/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import TimelineClient from './TimelineClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Tijdlijn — Cycle Companion' }

export default async function TimelinePage() {
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  const supabase = await createClient()
  const today = new Date()
  const start = new Date(today); start.setDate(start.getDate() - 27)
  const startISO = start.toISOString().slice(0, 10)
  const todayISO = today.toISOString().slice(0, 10)

  const [{ data: entries }, { data: weather }, { count: totalEntries }] = await Promise.all([
    supabase.from('cycle_daily_entries')
      .select('entry_date, mood_score, mood_variable, sleep, stress, readiness_score, cycle_phase, menstruation_flag, activity_types, activity_intensity, alcohol_glasses, symptoms, symptom_intensities, nap_taken, busy_day')
      .eq('user_id', user.id)
      .gte('entry_date', startISO)
      .lte('entry_date', todayISO)
      .order('entry_date', { ascending: true }),
    supabase.from('cycle_weather')
      .select('entry_date, temp_c, condition')
      .eq('user_id', user.id)
      .gte('entry_date', startISO)
      .lte('entry_date', todayISO),
    supabase.from('cycle_daily_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  return (
    <TimelineClient
      startDate={startISO}
      todayDate={todayISO}
      entries={(entries ?? []).map(e => ({
        date: e.entry_date,
        mood: e.mood_score,
        moodVariable: e.mood_variable,
        sleep: e.sleep,
        stress: e.stress,
        readiness: e.readiness_score,
        phase: e.cycle_phase,
        period: e.menstruation_flag,
        activityTypes: e.activity_types ?? [],
        intensity: e.activity_intensity,
        alcohol: e.alcohol_glasses ?? 0,
        symptoms: (e.symptoms ?? []) as string[],
        symptomIntensities: (e.symptom_intensities ?? {}) as Record<string, number>,
        napTaken: e.nap_taken ?? false,
        busyDay: e.busy_day ?? false,
      }))}
      weather={(weather ?? []).map(w => ({
        date: w.entry_date,
        temp: w.temp_c,
        condition: w.condition,
      }))}
      canShowInsights={(totalEntries ?? 0) >= 14}
    />
  )
}
