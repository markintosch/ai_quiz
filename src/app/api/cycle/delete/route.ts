// FILE: src/app/api/cycle/delete/route.ts
// Hard-delete every Cycle Companion row owned by the user, then sign out.

import { NextResponse } from 'next/server'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function DELETE() {
  const user = await requireCycleUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const service = createServiceClient()
  await service.from('cycle_insights_seen').delete().eq('user_id', user.id)
  await service.from('cycle_weather').delete().eq('user_id', user.id)
  await service.from('cycle_daily_entries').delete().eq('user_id', user.id)
  await service.from('cycle_profiles').delete().eq('user_id', user.id)

  // Sign out the current session — keeps the auth user (so a new login is
  // possible if she changes her mind), just empties the cycle data.
  const supabase = await createClient()
  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
