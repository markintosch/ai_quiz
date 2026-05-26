// FILE: src/lib/cycle/auth.ts
// Cycle Companion auth — passwordless magic-link, multi-user.
//
// Anyone who has provided an email (typically via Peri-Compass) can request
// a magic-link login. Supabase Auth handles user creation on first sign-in.
// All Cycle tables have row-level security keyed on auth.uid() so users
// only ever see their own data.

import { createClient } from '@/lib/supabase/server'

/**
 * Resolve the current authenticated user from the request cookies, returning
 * null if no valid session. Use this as the single guard in server components
 * and API routes.
 */
export async function requireCycleUser(): Promise<
  | { id: string; email: string }
  | null
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return null
  return { id: user.id, email: user.email }
}
