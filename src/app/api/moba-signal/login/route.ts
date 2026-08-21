// FILE: src/app/api/moba-signal/login/route.ts
// POST { password } -> sets the dashboard session cookie (30 days).

import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { deriveSignalToken, SIGNAL_COOKIE, signalPassword } from '@/lib/signal/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secret = signalPassword()
  if (!secret) {
    return NextResponse.json({ error: 'Dashboard access is not configured yet (MOBA_SIGNAL_PASSWORD).' }, { status: 503 })
  }
  let password: string
  try {
    const body = await req.json()
    password = String(body.password ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const a = Buffer.from(password)
  const b = Buffer.from(secret)
  const ok = a.length === b.length && timingSafeEqual(a, b)
  if (!ok) {
    await new Promise(r => setTimeout(r, 600)) // blunt brute-force damper
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SIGNAL_COOKIE, deriveSignalToken(secret), {
    httpOnly: true, path: '/moba/signal', maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax', secure: true,
  })
  return res
}
