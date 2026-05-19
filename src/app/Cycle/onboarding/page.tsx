// FILE: src/app/Cycle/onboarding/page.tsx

import { redirect } from 'next/navigation'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import OnboardingClient from './OnboardingClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Welkom — Cycle Companion' }

export default async function OnboardingPage() {
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('cycle_profiles')
    .select('onboarded_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.onboarded_at) redirect('/Cycle/today')
  return <OnboardingClient />
}
