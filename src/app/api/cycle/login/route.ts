// FILE: src/app/api/cycle/login/route.ts
// Password-gated login. On correct password the server uses Supabase admin
// to generate a magic-link action URL for the configured user, returns it,
// and the client redirects there. Supabase verifies the OTP and lands the
// browser at /Cycle/auth/callback which exchanges the code for a real
// session — same callback path as the previous email-based flow.
//
// No email is sent; the magic link is consumed server-to-browser-to-Supabase
// without going through the user's inbox.

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { createHmac, timingSafeEqual } from 'crypto'

function passwordsMatch(input: string, expected: string): boolean {
  // Constant-time compare via HMACs so length differences don't leak timing.
  const a = createHmac('sha256', expected).update(input).digest()
  const b = createHmac('sha256', expected).update(expected).digest()
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(`cycle-login:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 })
  }

  const expected = process.env.CYCLE_PASSWORD ?? ''
  const defaultEmail = process.env.CYCLE_DEFAULT_EMAIL ?? ''
  if (!expected || !defaultEmail) {
    return NextResponse.json({ ok: false, error: 'config' }, { status: 503 })
  }

  const body = (await req.json().catch(() => ({}))) as { password?: string }
  const input = (body.password ?? '').trim()
  if (!input) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }
  if (!passwordsMatch(input, expected)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 401 })
  }

  const origin = req.headers.get('origin') ?? 'https://markdekock.com'
  const supabase = createServiceClient()

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: defaultEmail,
    options: { redirectTo: `${origin}/Cycle/auth/callback` },
  })

  if (error || !data?.properties?.action_link) {
    console.error('[cycle login] generateLink failed', error)
    return NextResponse.json({ ok: false, error: 'auth' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, action_link: data.properties.action_link })
}
