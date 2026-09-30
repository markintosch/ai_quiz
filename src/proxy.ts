import { type NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

// ─── Admin gate ───────────────────────────────────────────────────────────────
// Next only loads this file from src/ (next to app/). The old root-level
// middleware.ts was never picked up, which left /admin open to anyone.
//
// This is the first line of defence only. The (panel) layout, every
// server-rendered admin page and every admin API route check the session
// themselves, so a proxy that stops running can no longer expose data.
//
// Public routes are deliberately not matched: the site runs without
// locale-prefix routing, and matching them would change public URLs.

// Must stay in sync with src/lib/admin/auth.ts deriveSessionToken()
function deriveSessionToken(secret: string): string {
  return createHmac('sha256', secret).update('admin-session-v1').digest('hex')
}

function hasValidSession(req: NextRequest): boolean {
  const token  = req.cookies.get('admin_token')?.value
  const secret = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD
  if (!secret || !token) return false
  const expected = Buffer.from(deriveSessionToken(secret), 'hex')
  const given    = Buffer.from(token, 'hex')
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === '/admin/login') return NextResponse.next()
  if (hasValidSession(req)) return NextResponse.next()
  return NextResponse.redirect(new URL('/admin/login', req.url))
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
