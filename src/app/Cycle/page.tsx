// FILE: src/app/Cycle/page.tsx
// Entry point: route the user to the right place based on auth + onboarding.
//
// Volgorde:
//   1. Niet ingelogd → /Cycle/login
//   2. Ingelogd maar geen Perimenopause Compass gedaan → /perimenopause-compass
//      (Compass is sinds v2 de poort tot de Cycle app — eerst nulmeting
//       voordat je daily kunt tracken)
//   3. Wel Compass, geen technische onboarding (locatie, cyclus-datum) → /Cycle/onboarding
//   4. Alles compleet → /Cycle/today

import { redirect } from 'next/navigation'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CycleEntryPage() {
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  // Check of er al een Compass-profiel is voor deze e-mail.
  // Service client want de compass-tabel staat los van de Cycle auth namespace.
  const sc = createServiceClient()
  const { data: compass } = await sc
    .from('perimenopause_compass_profiles')
    .select('email')
    .ilike('email', user.email)
    .maybeSingle()

  if (!compass) {
    redirect(`/perimenopause-compass?source=cycle&email=${encodeURIComponent(user.email)}`)
  }

  // Technische onboarding (locatie, cyclus-datum)
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('cycle_profiles')
    .select('onboarded_at')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile?.onboarded_at) redirect('/Cycle/onboarding')

  redirect('/Cycle/today')
}
