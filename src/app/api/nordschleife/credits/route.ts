export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_NAME, creditCookieOptions, decodeCreditCookie, encodeCreditCookie } from '@/lib/nordschleife/credits'

// GET — current paid credit balance for this device
export async function GET() {
  const store = await cookies()
  const raw   = store.get(COOKIE_NAME)?.value
  const credits = decodeCreditCookie(raw)
  return NextResponse.json({ credits })
}

// POST — burn one paid credit (called by /nordschleife/play when starting a paid lap)
export async function POST(_req: NextRequest) {
  const store = await cookies()
  const raw   = store.get(COOKIE_NAME)?.value
  const current = decodeCreditCookie(raw)
  if (current <= 0) {
    return NextResponse.json({ credits: 0, used: false }, { status: 200 })
  }
  const next = current - 1
  const res = NextResponse.json({ credits: next, used: true })
  res.cookies.set(COOKIE_NAME, encodeCreditCookie(next), creditCookieOptions())
  return res
}
