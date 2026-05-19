// FILE: src/app/Cycle/today/page.tsx

import { redirect } from 'next/navigation'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import CheckinStepper from './CheckinStepper'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Vandaag — Cycle Companion' }

export default async function TodayPage(
  props: {
    searchParams: Promise<{ [k: string]: string | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: profile } = await supabase
    .from('cycle_profiles')
    .select('onboarded_at')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile?.onboarded_at) redirect('/Cycle/onboarding')

  const { data: existing } = await supabase
    .from('cycle_daily_entries')
    .select('mood_score, mood_variable, sleep, stress, activity_types, activity_intensity, alcohol_glasses, symptoms, symptom_intensities, nap_taken, busy_day, menstruation_flag')
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .maybeSingle()

  // If already entered today and not editing, send to the output screen.
  if (existing && searchParams.edit !== '1') redirect('/Cycle/output')

  // Reconstruct the intensity map from either symptom_intensities (preferred)
  // or fall back to a default-3 map keyed by the symptoms array.
  let symptomsInit: Record<string, number> = {}
  if (existing) {
    const intensitiesObj = existing.symptom_intensities as Record<string, number> | null
    if (intensitiesObj && typeof intensitiesObj === 'object' && Object.keys(intensitiesObj).length > 0) {
      symptomsInit = intensitiesObj
    } else if (Array.isArray(existing.symptoms)) {
      for (const k of existing.symptoms) symptomsInit[k] = 3
    }
  }

  const initial = existing
    ? {
        mood_score:         existing.mood_score,
        mood_variable:      existing.mood_variable,
        sleep:              existing.sleep,
        stress:             existing.stress,
        activity_types:     (existing.activity_types as any[] satisfies any[]) as any,
        activity_intensity: existing.activity_intensity as any,
        alcohol_glasses:    existing.alcohol_glasses ?? 0,
        symptoms:           symptomsInit as any,
        nap_taken:          existing.nap_taken ?? false,
        busy_day:           existing.busy_day ?? false,
        menstruation_flag:  existing.menstruation_flag,
      }
    : null

  return <CheckinStepper today={today} initial={initial} />
}
