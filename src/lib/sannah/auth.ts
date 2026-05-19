/**
 * Scoped Sannah-CMS authentication.
 *
 * Two acceptable credentials:
 *  1. Master `admin_token` (set by /api/admin/auth — Mark) — always works.
 *  2. Sannah-only `sannah_admin_token` (set by /api/sannah/auth) — scoped to /sannah/admin.
 *
 * Same security model as src/lib/admin/auth.ts:
 *  - Password (env var) is never stored in cookie.
 *  - Cookie holds HMAC-derived token.
 *  - Comparison is timing-safe.
 */

import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

/** Sannah-scoped session token derivation (different label so master + Sannah can't collide). */
export function deriveSannahSessionToken(secret: string): string {
  return createHmac('sha256', secret).update('sannah-admin-session-v1').digest('hex')
}

/** Master admin token derivation — kept in sync with src/lib/admin/auth.ts */
export function deriveMasterSessionToken(secret: string): string {
  return createHmac('sha256', secret).update('admin-session-v1').digest('hex')
}

/** Cookie options shared by login + logout. */
export function sannahCookieOptions(maxAge = 60 * 60 * 12): Parameters<Awaited<Awaited<ReturnType<typeof cookies>>>['set']>[2] {
  return {
    httpOnly: true,
    path: '/',
    maxAge,                      // 12 hours
    sameSite: 'strict',
    secure: true,
  }
}

/** True if the request has a valid Sannah cookie OR a valid master admin cookie. */
export async function isSannahAuthorised(): Promise<boolean> {
  const cookieStore = await cookies()
  const sannahToken = cookieStore.get('sannah_admin_token')?.value
  const masterToken = cookieStore.get('admin_token')?.value
  const sannahSecret = process.env.SANNAH_ADMIN_PASSWORD
  const masterSecret = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD

  if (sannahToken && sannahSecret) {
    try {
      const expected = deriveSannahSessionToken(sannahSecret)
      if (timingSafeEqual(Buffer.from(sannahToken, 'hex'), Buffer.from(expected, 'hex'))) {
        return true
      }
    } catch { /* invalid hex → fall through */ }
  }

  if (masterToken && masterSecret) {
    try {
      const expected = deriveMasterSessionToken(masterSecret)
      if (timingSafeEqual(Buffer.from(masterToken, 'hex'), Buffer.from(expected, 'hex'))) {
        return true
      }
    } catch { /* invalid hex → fall through */ }
  }

  return false
}
