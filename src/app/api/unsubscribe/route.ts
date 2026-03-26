export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = rateLimit(`unsubscribe-post:${ip}`, 10, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { respondentId } = await req.json() as { respondentId?: string }

  if (!respondentId || !UUID_RE.test(respondentId)) {
    return NextResponse.json({ error: 'Missing respondentId' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('respondents')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ unsubscribed: true, marketing_consent: false } as any)
    .eq('id', respondentId)

  if (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// GET — used by one-click unsubscribe links in emails
// Security note: rid is a UUID (122-bit entropy) sent only to the recipient's email.
// Rate limiting + UUID format guard protect against casual enumeration.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = rateLimit(`unsubscribe-get:${ip}`, 20, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.redirect(new URL('/unsubscribe?error=ratelimit', req.url))
  }

  const respondentId = req.nextUrl.searchParams.get('rid')

  if (!respondentId || !UUID_RE.test(respondentId)) {
    return NextResponse.redirect(new URL('/unsubscribe?error=missing', req.url))
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('respondents')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ unsubscribed: true, marketing_consent: false } as any)
    .eq('id', respondentId)

  if (error) {
    return NextResponse.redirect(new URL('/unsubscribe?error=failed', req.url))
  }

  return NextResponse.redirect(new URL('/unsubscribe?success=1', req.url))
}
