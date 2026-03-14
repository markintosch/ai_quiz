import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { respondentId } = await req.json() as { respondentId?: string }

  if (!respondentId) {
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
export async function GET(req: NextRequest) {
  const respondentId = req.nextUrl.searchParams.get('rid')

  if (!respondentId) {
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
