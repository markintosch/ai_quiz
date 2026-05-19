// FILE: src/app/Cycle/auth/callback/route.ts
// Supabase magic-link return path. Exchanges the OTP code for a session,
// then sends the user into /Cycle for routing.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const supabase = await createClient()
  if (code) await supabase.auth.exchangeCodeForSession(code)
  return NextResponse.redirect(new URL('/Cycle', url.origin))
}
