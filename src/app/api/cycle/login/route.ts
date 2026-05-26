// FILE: src/app/api/cycle/login/route.ts
// Passwordless magic-link login for Cycle Companion (multi-user).
//
// Flow:
//  1. User enters her email on /Cycle/login
//  2. We rate-limit, then call Supabase Auth's signInWithOtp
//  3. Supabase emails her a one-tap magic link (via Supabase SMTP or the
//     configured Resend SMTP relay — see Supabase Auth settings)
//  4. She clicks it, lands on /Cycle/auth/callback?code=... → session set
//
// Anti-enumeration: we always respond { ok: true, sent: true } so a probe
// can't tell whether an email is already registered.

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(`cycle-login-ip:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as { email?: string; next?: string }
  const email = (body.email ?? '').trim().toLowerCase()
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  // Per-email rate limit so one address can't be spammed with magic-link mails
  if (!rateLimit(`cycle-login-email:${email}`, 4, 60 * 60 * 1000)) {
    // Silent — same 200 response so the rate limit doesn't leak.
    return NextResponse.json({ ok: true, sent: true })
  }

  // /Cycle path-only guard against open-redirect via the next param
  const rawNext = body.next ?? ''
  const nextParam = rawNext.startsWith('/Cycle') ? rawNext : ''

  const origin = req.headers.get('origin') ?? 'https://markdekock.com'
  const redirectTo = `${origin}/Cycle/auth/callback${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`

  const supabase = createServiceClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      // shouldCreateUser=true is the default; first-time emails auto-create
      // an auth.users row when they verify the magic link.
    },
  })

  if (error) {
    console.error('[cycle login] signInWithOtp failed', { email, error: error.message })
    // Still return success-shaped to avoid enumeration; logs capture the truth
    return NextResponse.json({ ok: true, sent: true })
  }

  return NextResponse.json({ ok: true, sent: true })
}
