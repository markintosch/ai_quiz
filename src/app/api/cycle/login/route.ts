// FILE: src/app/api/cycle/login/route.ts
// Magic-link request. Hidden allowlist: we always return 200 so that
// non-allowed emails don't learn whether they're configured.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAllowed } from '@/lib/cycle/auth'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(`cycle-login:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const body = (await req.json().catch(() => ({}))) as { email?: string }
  const email = body.email?.trim().toLowerCase() ?? ''
  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  if (!isAllowed(email)) {
    // Silent reject — no enumeration.
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const supabase = createClient()
  const origin = req.headers.get('origin') ?? 'https://markdekock.com'
  await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/Cycle/auth/callback` },
  })

  return NextResponse.json({ ok: true })
}
