/**
 * Shared admin authentication helpers.
 *
 * Security model:
 * - The ADMIN_SECRET env var is the password. It is NEVER stored in a cookie.
 * - On login we derive a session token via HMAC-SHA256(secret, 'admin-session-v1').
 * - The cookie holds only the derived token. Rotating ADMIN_SECRET invalidates all sessions.
 * - All admin API routes call isAuthorised() before touching any data.
 */

import { createHmac } from 'crypto'
import { cookies } from 'next/headers'

/**
 * Derive a deterministic session token from the admin secret.
 * This means we never store the plain password as a cookie value.
 */
export function deriveSessionToken(secret: string): string {
  return createHmac('sha256', secret)
    .update('admin-session-v1')
    .digest('hex')
}

/**
 * Cookie options for the admin session cookie.
 */
export function adminCookieOptions(maxAge = 60 * 60 * 8): Parameters<Awaited<ReturnType<typeof cookies>>['set']>[2] {
  return {
    httpOnly: true,
    path: '/',
    maxAge,                                              // 8 hours default
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  }
}

/**
 * Returns true if the current request carries a valid admin session cookie.
 * All admin API route handlers must call this at the top.
 */
export async function isAuthorised(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  const secret = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD
  if (!secret || !token) return false
  return token === deriveSessionToken(secret)
}
