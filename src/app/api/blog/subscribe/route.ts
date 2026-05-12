// FILE: src/app/api/blog/subscribe/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/blog/subscribe — start blog newsletter signup (double opt-in).
//
// Body: { email, locale?, consentTextHash, sourcePath?, sourcePostId? }
//
// Flow:
// 1. Rate limit: 3 per IP per uur (anders kunnen bots Resend-quota leegtrekken).
// 2. Valideer e-mail + AVG-vinkje (hash MUST match).
// 3. Check of e-mail al bestaat:
//    - confirmed     → return success silently (geen lekken: bestaat-of-niet
//                      verschil is een privacy-leak; we tonen altijd "check je inbox")
//    - unconfirmed   → re-stuur bevestigingsmail met dezelfde token (rate-limit-binnen-DB
//                      via updated_at: max 1 hermail per uur)
//    - unsubscribed  → reactiveer (unsubscribed_at = NULL, nieuw token, mail opnieuw)
// 4. Anders: insert nieuwe rij + verstuur bevestigingsmail.
//
// Antwoord is altijd { ok: true } (geen "bestaat al" feedback) — privacy.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { randomBytes } from 'crypto'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { createServiceClient } from '@/lib/supabase/server'
import { BlogConfirmationEmail } from '@/lib/email/templates/blogConfirmation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'Mark de Kock <blog@brandpwrdmedia.com>'
const REPLY_TO = 'mark@brandpwrdmedia.com'
const BASE   = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'

// We slaan de letterlijk getoonde AVG-tekst op (consentText) zodat we later
// kunnen reproduceren waarmee iemand akkoord ging. Truncated naar 1000 char
// om misbruik (gigantische strings) te beperken.
const MAX_CONSENT_TEXT = 1000

interface SubscribeBody {
  email:        string
  locale?:      string
  consent:      boolean
  consentText?: string
  sourcePath?:  string
  sourcePostId?:string
}

// Hermail throttle (DB-level): minimaal 1 uur tussen bevestigingsmails voor
// dezelfde unconfirmed subscriber. Anders kan iemand iemand anders' inbox
// vol bombarderen door zijn e-mail in te tikken.
const REMAIL_COOLDOWN_MS = 60 * 60 * 1000

export async function POST(req: Request) {
  // ── Rate limit ────────────────────────────────────────────────────────
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`blog-sub:${ip}`, 3, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Te veel pogingen. Probeer het over een uurtje opnieuw.' },
      { status: 429 },
    )
  }

  // ── Parse + validate ─────────────────────────────────────────────────
  let body: SubscribeBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 })
  }
  if (!body.consent) {
    return NextResponse.json({ error: 'Je moet akkoord gaan met het privacybeleid.' }, { status: 400 })
  }
  const locale: 'nl' | 'en' | 'de' =
    body.locale === 'en' || body.locale === 'de' ? body.locale : 'nl'

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Mail service niet geconfigureerd.' }, { status: 500 })
  }

  const supabase = createServiceClient()

  // ── Look up existing subscriber (case-insensitive) ──────────────────
  const { data: existing } = await supabase
    .from('blog_subscribers')
    .select('id, email, confirmed, confirm_token, unsubscribe_token, unsubscribed_at, updated_at')
    .ilike('email', email)
    .maybeSingle()

  let confirmToken:     string
  let unsubscribeToken: string
  let subscriberId:     string

  if (existing) {
    const e = existing as {
      id: string; email: string; confirmed: boolean
      confirm_token: string | null; unsubscribe_token: string
      unsubscribed_at: string | null; updated_at: string
    }

    if (e.confirmed && !e.unsubscribed_at) {
      // Al bevestigd: silently OK (geen leak).
      return NextResponse.json({ ok: true, status: 'already_subscribed' })
    }

    if (!e.confirmed && e.confirm_token) {
      // Niet bevestigd: hermail mag, maar throttled.
      const ageMs = Date.now() - Date.parse(e.updated_at)
      if (ageMs < REMAIL_COOLDOWN_MS) {
        return NextResponse.json({ ok: true, status: 'pending' })
      }
      confirmToken     = randomBytes(24).toString('hex')
      unsubscribeToken = e.unsubscribe_token
      subscriberId     = e.id
      await supabase
        .from('blog_subscribers')
        .update({
          confirm_token:     confirmToken,
          locale,
          consent_text:      (body.consentText ?? '').slice(0, MAX_CONSENT_TEXT) || null,
          source_ip:         ip,
          source_path:       body.sourcePath ?? null,
          source_post_id:    body.sourcePostId ?? null,
        } as never)
        .eq('id', e.id)
    } else if (e.unsubscribed_at) {
      // Re-subscribe na unsubscribe: verse tokens, reset unsubscribed_at.
      confirmToken     = randomBytes(24).toString('hex')
      unsubscribeToken = randomBytes(24).toString('hex')
      subscriberId     = e.id
      await supabase
        .from('blog_subscribers')
        .update({
          confirmed:         false,
          confirm_token:     confirmToken,
          confirmed_at:      null,
          unsubscribe_token: unsubscribeToken,
          unsubscribed_at:   null,
          locale,
          consent_at:        new Date().toISOString(),
          consent_text:      (body.consentText ?? '').slice(0, MAX_CONSENT_TEXT) || null,
          source_ip:         ip,
          source_path:       body.sourcePath ?? null,
          source_post_id:    body.sourcePostId ?? null,
        } as never)
        .eq('id', e.id)
    } else {
      // Confirmed, of een toestand die we niet verwachten — silently OK.
      return NextResponse.json({ ok: true, status: 'pending' })
    }
  } else {
    // ── Nieuwe subscriber ─────────────────────────────────────────────
    confirmToken     = randomBytes(24).toString('hex')
    unsubscribeToken = randomBytes(24).toString('hex')
    const { data: inserted, error } = await supabase
      .from('blog_subscribers')
      .insert({
        email,
        locale,
        confirmed:         false,
        confirm_token:     confirmToken,
        unsubscribe_token: unsubscribeToken,
        consent_at:        new Date().toISOString(),
        consent_text:      (body.consentText ?? '').slice(0, MAX_CONSENT_TEXT) || null,
        source_ip:         ip,
        source_path:       body.sourcePath ?? null,
        source_post_id:    body.sourcePostId ?? null,
      } as never)
      .select('id')
      .single()
    if (error || !inserted) {
      return NextResponse.json({ error: 'Opslaan mislukt.' }, { status: 500 })
    }
    subscriberId = (inserted as { id: string }).id
  }

  // ── Bouw bevestigingsmail ─────────────────────────────────────────────
  const confirmUrl     = `${BASE}/api/blog/confirm?token=${confirmToken}`
  const unsubscribeUrl = `${BASE}/api/blog/unsubscribe?token=${unsubscribeToken}`

  const subject = locale === 'nl'
    ? 'Bevestig je inschrijving — Mark de Kock blog'
    : locale === 'de'
      ? 'Bestätige dein Abonnement — Mark de Kock Blog'
      : 'Confirm your subscription — Mark de Kock blog'

  const html = await render(
    BlogConfirmationEmail({ confirmUrl, unsubscribeUrl, locale }),
  )

  try {
    await resend.emails.send({
      from:    FROM,
      to:      email,
      subject,
      html,
      reply_to: REPLY_TO,
      headers: {
        // RFC 8058: one-click unsubscribe header (Gmail/Apple Mail respecteert dit)
        'List-Unsubscribe':      `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
  } catch (err) {
    return NextResponse.json({
      error: 'Mail versturen mislukt. Probeer het later opnieuw.',
      detail: err instanceof Error ? err.message : 'unknown',
    }, { status: 500 })
  }

  void subscriberId
  return NextResponse.json({ ok: true, status: 'pending' })
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function isValidEmail(s: string): boolean {
  // Pragmatisch: minstens user@host.tld, geen whitespace, max 254 tekens.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254
}
