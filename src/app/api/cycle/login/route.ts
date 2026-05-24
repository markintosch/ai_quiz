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

  const body = (await req.json().catch(() => ({}))) as { password?: string; next?: string }
  const input = (body.password ?? '').trim()
  // Only forward /Cycle paths — prevents open-redirect on the magic link
  const rawNext = body.next ?? ''
  const nextParam = rawNext.startsWith('/Cycle') ? rawNext : ''
  if (!input) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }
  if (!passwordsMatch(input, expected)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 401 })
  }

  const origin = req.headers.get('origin') ?? 'https://markdekock.com'
  const supabase = createServiceClient()

  let { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: defaultEmail,
    options: { redirectTo: `${origin}/Cycle/auth/callback${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}` },
  })

  // If the configured user doesn't exist in auth.users (e.g. deleted),
  // create it on the fly with confirmed email so the magic link can be issued.
  if (error && /not found|does not exist|user.*not.*registered/i.test(error.message ?? '')) {
    const { error: createErr } = await supabase.auth.admin.createUser({
      email: defaultEmail,
      email_confirm: true,
    })
    if (createErr) {
      console.error('[cycle login] createUser failed', createErr)
      return NextResponse.json(
        { ok: false, error: 'create_user', detail: createErr.message },
        { status: 500 },
      )
    }
    ;({ data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: defaultEmail,
      options: { redirectTo: `${origin}/Cycle/auth/callback${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}` },
    }))
  }

  if (error || !data?.properties?.action_link) {
    console.error('[cycle login] generateLink failed', error)
    return NextResponse.json(
      { ok: false, error: 'auth', detail: error?.message ?? 'unknown' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, action_link: data.properties.action_link })
}
