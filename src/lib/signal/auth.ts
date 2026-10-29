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

// Hosting dashboards make it easy to paste a trailing newline/space or wrap the
// value in quotes, which then never matches what people type. Normalise both
// sides the same way so the password works exactly as written.
export function normaliseSignalPassword(value: string): string {
  let v = value.normalize('NFC').trim()
  if (v.length >= 2 && (v[0] === '"' || v[0] === "'") && v[v.length - 1] === v[0]) {
    v = v.slice(1, -1).trim()
  }
  return v
}

export function signalPassword(): string | null {
  const raw = process.env.MOBA_SIGNAL_PASSWORD
  if (!raw) return null
  return normaliseSignalPassword(raw) || null
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
