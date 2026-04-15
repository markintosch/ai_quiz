export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { timingSafeEqual, createHash } from 'crypto'
import { deriveSessionToken, adminCookieOptions } from '@/lib/admin/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // Rate-limit brute-force attempts: 5 tries per 15 minutes per IP
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 })
  }

  const body = await req.json() as { password?: string }
  const secret = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD

  if (!secret) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 })
  }

  // Timing-safe comparison — hash both sides so length is always equal (SHA-256 = 32 bytes)
  const inputHash  = createHash('sha256').update(body.password ?? '').digest()
  const secretHash = createHash('sha256').update(secret).digest()
  if (!timingSafeEqual(inputHash, secretHash)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_token', deriveSessionToken(secret), adminCookieOptions())

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.set('admin_token', '', adminCookieOptions(0))

  return NextResponse.json({ ok: true })
}
