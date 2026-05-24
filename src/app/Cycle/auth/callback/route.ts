// FILE: src/app/Cycle/auth/callback/route.ts
// Supabase magic-link return path. Exchanges the OTP code for a session,
// then sends the user into /Cycle for routing.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function safeNext(raw: string | null): string {
  // Only allow internal /Cycle paths to prevent open-redirect abuse.
  if (!raw) return '/Cycle'
  if (!raw.startsWith('/Cycle')) return '/Cycle'
  return raw
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = safeNext(url.searchParams.get('next'))
  const supabase = await createClient()
  if (code) await supabase.auth.exchangeCodeForSession(code)
  return NextResponse.redirect(new URL(next, url.origin))
}
