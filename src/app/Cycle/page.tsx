// FILE: src/app/Cycle/page.tsx
// Entry point: route the user to the right place based on auth + onboarding.

import { redirect } from 'next/navigation'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CycleEntryPage() {
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  const supabase = createClient()
  const { data: profile } = await supabase
    .from('cycle_profiles')
    .select('onboarded_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile?.onboarded_at) redirect('/Cycle/onboarding')
  redirect('/Cycle/today')
}
