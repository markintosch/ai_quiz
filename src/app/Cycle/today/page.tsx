// FILE: src/app/Cycle/today/page.tsx

import { redirect } from 'next/navigation'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import CheckinStepper from './CheckinStepper'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Vandaag — Cycle Companion' }

export default async function TodayPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | undefined }
}) {
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  const supabase = createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: profile } = await supabase
    .from('cycle_profiles')
    .select('onboarded_at')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile?.onboarded_at) redirect('/Cycle/onboarding')

  const { data: existing } = await supabase
    .from('cycle_daily_entries')
    .select('mood_score, mood_variable, sleep, stress, activity_types, activity_intensity, alcohol_glasses, menstruation_flag')
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .maybeSingle()

  // If already entered today and not editing, send to the output screen.
  if (existing && searchParams.edit !== '1') redirect('/Cycle/output')

  const initial = existing
    ? {
        mood_score:         existing.mood_score,
        mood_variable:      existing.mood_variable,
        sleep:              existing.sleep,
        stress:             existing.stress,
        activity_types:     (existing.activity_types as any[] satisfies any[]) as any,
        activity_intensity: existing.activity_intensity as any,
        alcohol_glasses:    existing.alcohol_glasses ?? 0,
        menstruation_flag:  existing.menstruation_flag,
      }
    : null

  return <CheckinStepper today={today} initial={initial} />
}
