/**
 * IndyCar paid-credit cookie.
 *
 * Format: <count>.<expiryUnixMs>.<hmac>
 *   - count: remaining paid laps (integer, ≥ 0)
 *   - expiryUnixMs: when the cookie should be considered stale (ms since epoch)
 *   - hmac: HMAC-SHA256(`<count>.<expiryUnixMs>`, ADMIN_SECRET), hex-encoded
 *
 * The HMAC binds count + expiry so a user cannot edit the cookie to grant
 * themselves extra credits. ADMIN_SECRET is the project's existing secret —
 * rotating it invalidates all outstanding paid credits.
 */

import { createHmac, timingSafeEqual } from 'crypto'
import {
  CREDIT_COOKIE_NAME,
  CREDIT_COOKIE_TTL_DAYS,
} from '@/products/indycar/data'

function getSecret(): string {
  const s = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD
  if (!s) throw new Error('ADMIN_SECRET (or ADMIN_PASSWORD) is required for IndyCar credit signing')
  return s
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

export function encodeCreditCookie(count: number, ttlDays = CREDIT_COOKIE_TTL_DAYS): string {
  const safe   = Math.max(0, Math.floor(count))
  const expiry = Date.now() + ttlDays * 24 * 60 * 60 * 1000
  const body   = `${safe}.${expiry}`
  return `${body}.${sign(body)}`
}

/**
 * Verifies a cookie value and returns the remaining-credit count, or 0 if
 * the cookie is missing / malformed / tampered / expired.
 */
export function decodeCreditCookie(raw: string | undefined | null): number {
  if (!raw) return 0
  const parts = raw.split('.')
  if (parts.length !== 3) return 0
  const [countStr, expiryStr, mac] = parts
  const body = `${countStr}.${expiryStr}`
  let expected: string
  try {
    expected = sign(body)
  } catch {
    return 0
  }
  try {
    const ok = timingSafeEqual(
      Buffer.from(mac, 'hex'),
      Buffer.from(expected, 'hex'),
    )
    if (!ok) return 0
  } catch {
    return 0
  }
  const expiry = parseInt(expiryStr, 10)
  if (!Number.isFinite(expiry) || expiry < Date.now()) return 0
  const count = parseInt(countStr, 10)
  if (!Number.isFinite(count) || count < 0) return 0
  return count
}

export const COOKIE_NAME = CREDIT_COOKIE_NAME

export function creditCookieOptions(maxAgeSec = CREDIT_COOKIE_TTL_DAYS * 24 * 60 * 60) {
  return {
    httpOnly: true as const,
    path: '/',
    maxAge: maxAgeSec,
    sameSite: 'lax' as const,
    secure: true as const,
  }
}
