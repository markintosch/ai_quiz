// FILE: src/app/api/sannah/auth/route.ts
// Login + logout voor Sannah-only CMS-toegang.
// Vereist env var SANNAH_ADMIN_PASSWORD (apart van ADMIN_SECRET).

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { timingSafeEqual, createHash } from 'crypto'
import { deriveSannahSessionToken, sannahCookieOptions } from '@/lib/sannah/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`sannah-login:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel pogingen. Probeer het over 15 min opnieuw.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({})) as { password?: string }
  const secret = process.env.SANNAH_ADMIN_PASSWORD
  if (!secret) {
    return NextResponse.json({ error: 'Server-configuratie ontbreekt (SANNAH_ADMIN_PASSWORD).' }, { status: 500 })
  }

  // Timing-safe vergelijken via SHA-256 — beide kanten naar 32 bytes hashen.
  const inputHash  = createHash('sha256').update(body.password ?? '').digest()
  const secretHash = createHash('sha256').update(secret).digest()
  if (!timingSafeEqual(inputHash, secretHash)) {
    return NextResponse.json({ error: 'Onjuist wachtwoord.' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('sannah_admin_token', deriveSannahSessionToken(secret), sannahCookieOptions())
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.set('sannah_admin_token', '', sannahCookieOptions(0))
  return NextResponse.json({ ok: true })
}
