// FILE: src/app/api/blog/confirm/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/blog/confirm?token=...
// Final step van double opt-in. Marks subscriber as confirmed,
// clears the one-time confirm_token, and redirects to /blog/confirmed.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BASE = 'https://markdekock.com'

export async function GET(req: Request) {
  const url   = new URL(req.url)
  const token = url.searchParams.get('token')
  if (!token || token.length < 16) {
    return NextResponse.redirect(`${BASE}/blog/confirmed?status=invalid`, 303)
  }

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_subscribers')
    .select('id, locale, confirmed, unsubscribed_at')
    .eq('confirm_token', token)
    .maybeSingle()

  if (!data) {
    return NextResponse.redirect(`${BASE}/blog/confirmed?status=invalid`, 303)
  }

  const row = data as { id: string; locale: 'nl'|'en'|'de'; confirmed: boolean; unsubscribed_at: string|null }

  if (row.unsubscribed_at) {
    // Subscriber heeft zich tussendoor uitgeschreven — wij confirmen niet.
    return NextResponse.redirect(`${BASE}/blog/confirmed?status=unsubscribed&lang=${row.locale}`, 303)
  }

  if (!row.confirmed) {
    await supabase
      .from('blog_subscribers')
      .update({
        confirmed:     true,
        confirm_token: null,
        confirmed_at:  new Date().toISOString(),
      } as never)
      .eq('id', row.id)
  }

  return NextResponse.redirect(`${BASE}/blog/confirmed?status=ok&lang=${row.locale}`, 303)
}
