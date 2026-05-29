// FILE: src/app/api/summercourse/question/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/summercourse/question — public "ask a question" form on /summercourse.
//
// Body: { email, message }
// - Rate limit: 5 per IP per hour
// - Stores in `summercourse_questions` (defensive PGRST204 fallback if migration
//   hasn't been run yet)
// - Emails mark@brandpwrdmedia.com with the question (fire-and-forget — never
//   blocks the user response)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM     = 'Summer Course <results@brandpwrdmedia.com>'
const TO       = 'mark@brandpwrdmedia.com'

const MAX_MESSAGE = 4000
const MAX_EMAIL   = 254

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= MAX_EMAIL
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`sc-question:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Te veel vragen vanaf dit IP. Probeer het over een uur opnieuw.' },
      { status: 429 },
    )
  }

  let body: { email?: unknown; message?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldige aanvraag.' }, { status: 400 })
  }

  const email   = typeof body.email   === 'string' ? body.email.trim().toLowerCase() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
  }
  if (message.length < 5) {
    return NextResponse.json({ error: 'Vraag is te kort — vertel iets meer.' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: 'Vraag is te lang (max 4000 tekens).' }, { status: 400 })
  }

  // ── Store in DB (defensive: tolerate missing table during early deploys) ──
  const supabase = createServiceClient()
  const userAgent = req.headers.get('user-agent') ?? null

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('summercourse_questions')
      .insert({ email, message, ip, user_agent: userAgent })
    // PGRST204/PGRST205 = schema cache miss (migration not run yet) → tolerate silently
    if (error && error.code !== 'PGRST204' && error.code !== 'PGRST205') {
      console.error('[summercourse_questions] insert failed:', error)
    }
  } catch (err) {
    console.error('[summercourse_questions] insert threw:', err)
  }

  // ── Email Mark (fire-and-forget — don't fail user submit on email error) ──
  if (process.env.RESEND_API_KEY) {
    const safeEmail   = escapeHtml(email)
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>')

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;padding:24px;color:#1c2433">
        <h2 style="color:#354E5E;margin:0 0 16px">Nieuwe vraag · Summer Course</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
          <tr><td style="padding:6px 12px;color:#5a6678;width:120px">Van</td><td style="padding:6px 12px"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
          <tr style="background:#f9f9f9"><td style="padding:6px 12px;color:#5a6678">Tijd</td><td style="padding:6px 12px">${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}</td></tr>
        </table>
        <div style="background:#fbfaf8;border-left:3px solid #E8611A;padding:16px 20px;border-radius:4px">
          <p style="margin:0;font-size:15px;line-height:1.55">${safeMessage}</p>
        </div>
        <p style="margin-top:24px;font-size:13px;color:#5a6678">
          Beheer alle vragen in het <a href="https://markdekock.com/admin/summercourse/questions" style="color:#E8611A">admin-paneel</a>.
        </p>
      </div>
    `

    try {
      await resend.emails.send({
        from:     FROM,
        to:       TO,
        reply_to: email,
        subject: `[Summer Course] Nieuwe vraag van ${email}`,
        html,
      })
    } catch (err) {
      console.error('[summercourse_questions] email send failed:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
