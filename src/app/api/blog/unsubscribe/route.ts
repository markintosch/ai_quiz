// FILE: src/app/api/blog/unsubscribe/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/blog/unsubscribe?token=...   (klikken vanuit mail / browser)
// POST /api/blog/unsubscribe?token=...   (RFC 8058 one-click unsubscribe)
//
// Beide gedragen zich identiek: token opzoeken, unsubscribed_at vullen,
// rij blijft bestaan voor audit. We onthouden het adres NIET (niet hashen
// of compressen) — gewoon de rij laten staan met unsubscribed_at != NULL,
// zodat we kunnen aantonen dat we het verzoek hebben gehonoreerd.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BASE = 'https://markdekock.com'

async function unsubscribeByToken(token: string): Promise<{ ok: boolean; locale?: 'nl'|'en'|'de' }> {
  if (!token || token.length < 16) return { ok: false }
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_subscribers')
    .select('id, locale, unsubscribed_at')
    .eq('unsubscribe_token', token)
    .maybeSingle()
  if (!data) return { ok: false }
  const row = data as { id: string; locale: 'nl'|'en'|'de'; unsubscribed_at: string|null }
  if (!row.unsubscribed_at) {
    await supabase
      .from('blog_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() } as never)
      .eq('id', row.id)
  }
  return { ok: true, locale: row.locale }
}

export async function GET(req: Request) {
  const url   = new URL(req.url)
  const token = url.searchParams.get('token') ?? ''
  const r = await unsubscribeByToken(token)
  const status = r.ok ? 'ok' : 'invalid'
  const lang   = r.locale ?? 'nl'
  return NextResponse.redirect(`${BASE}/blog/unsubscribed?status=${status}&lang=${lang}`, 303)
}

// RFC 8058 one-click. Mailproviders posten zonder bevestiging — moet
// idempotent en zonder confirm-stap werken.
export async function POST(req: Request) {
  const url   = new URL(req.url)
  const token = url.searchParams.get('token') ?? ''
  const r = await unsubscribeByToken(token)
  if (!r.ok) return new NextResponse('not found', { status: 404 })
  return new NextResponse('OK', { status: 200 })
}
