// FILE: src/lib/cycle/auth.ts
// Email allowlist for Cycle Companion. Personal app — only the configured
// addresses can request a magic link or hold a session.

import { createClient } from '@/lib/supabase/server'

function allowlist(): string[] {
  return (process.env.CYCLE_ALLOWED_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false
  return allowlist().includes(email.trim().toLowerCase())
}

/**
 * Resolve the current authenticated user from the request cookies, returning
 * null if missing OR if the email is not on the allowlist. Use this as the
 * single guard in server components and API routes.
 */
export async function requireCycleUser(): Promise<
  | { id: string; email: string }
  | null
> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return null
  if (!isAllowed(user.email)) {
    await supabase.auth.signOut()
    return null
  }
  return { id: user.id, email: user.email }
}
