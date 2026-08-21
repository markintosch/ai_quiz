// FILE: src/lib/signal/auth.ts
// ─── Moba Signal — dashboard access (shared team password) ────────────────────
//
// P0 access control, interim model: one password for marketing + innovation
// (MOBA_SIGNAL_PASSWORD env var), same derived-token pattern as the admin.
// The cookie holds only an HMAC of the secret, so rotating the password
// revokes every session at once. Per-person Supabase Auth is the planned
// upgrade when the audience grows (P2 sales access).

import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export const SIGNAL_COOKIE = 'moba_signal_token'

export function deriveSignalToken(secret: string): string {
  return createHmac('sha256', secret).update('moba-signal-session-v1').digest('hex')
}

export function signalPassword(): string | null {
  return process.env.MOBA_SIGNAL_PASSWORD ?? null
}

export async function isSignalAuthorised(): Promise<boolean> {
  const secret = signalPassword()
  if (!secret) return false // fail closed until the password is configured
  const token = (await cookies()).get(SIGNAL_COOKIE)?.value
  if (!token) return false
  try {
    return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(deriveSignalToken(secret), 'hex'))
  } catch {
    return false
  }
}
