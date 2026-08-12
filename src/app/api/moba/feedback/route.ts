export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Brand PWRD Media <results@brandpwrdmedia.com>'
const TO = process.env.ADMIN_EMAIL ?? 'mark@brandpwrdmedia.com'

// POST /api/moba/feedback — evaluation feedback from the demo walk-through.
// Persists to the DB FIRST (durable vangnet), then emails Mark best-effort.
// No PII stored.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`moba-feedback:${ip}`, 5, 30 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel berichten. Wacht even.' }, { status: 429 })
  }

  let body: { message?: string; context?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 })
  }

  const message = (body.message ?? '').trim().slice(0, 4000)
  if (!message) {
    return NextResponse.json({ error: 'Bericht is leeg' }, { status: 400 })
  }
  const context = (body.context ?? 'demo').slice(0, 40)

  // ── 1) Persist to DB first (the vangnet) ───────────────────
  // Defensive: if the table doesn't exist yet (migration not run), don't fail
  // the request — fall through to email so nothing is lost.
  let stored = false
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('moba_feedback') as any).insert({ message, context })
    if (error) {
      console.error('MOBA feedback DB insert error (continuing to email):', error)
    } else {
      stored = true
    }
  } catch (err) {
    console.error('MOBA feedback DB unexpected error (continuing to email):', err)
  }

  // ── 2) Email best-effort ───────────────────────────────────
  let emailed = false
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      reply_to: TO,
      subject: 'MOBA Marketing Survey — feedback op de demo',
      html: `
        <p>Nieuwe feedback op de MOBA Marketing Survey demo:</p>
        <blockquote style="border-left:3px solid #E8611A;padding-left:12px;color:#333;white-space:pre-wrap">${escapeHtml(message)}</blockquote>
      `,
    })
    if (error) console.error('MOBA feedback email error:', error)
    else emailed = true
  } catch (err) {
    console.error('MOBA feedback email unexpected error:', err)
  }

  // Success if we captured it at least once (DB or email).
  if (!stored && !emailed) {
    return NextResponse.json({ error: 'Opslaan mislukt. Probeer het opnieuw.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
