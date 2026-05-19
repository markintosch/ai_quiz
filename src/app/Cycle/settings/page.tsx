// FILE: src/app/Cycle/settings/page.tsx

import { redirect } from 'next/navigation'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Instellingen — Cycle Companion' }

export default async function SettingsPage() {
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('cycle_profiles')
    .select('last_period_start, typical_length, reminder_time, timezone')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) redirect('/Cycle/onboarding')

  return (
    <SettingsClient
      email={user.email}
      lastPeriodStart={profile.last_period_start ?? ''}
      typicalLength={profile.typical_length ?? 28}
      reminderTime={profile.reminder_time ?? '20:00'}
    />
  )
}
