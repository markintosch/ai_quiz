import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const resend     = new Resend(process.env.RESEND_API_KEY)
const NOTIFY_TO  = 'mark@brandpwrdmedia.com'
const FROM       = 'AI-benchmark <noreply@brandpwrdmedia.nl>'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`ai_benchmark_waitlist:${ip}`, 5, 10 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { name, email, lang } = await req.json() as {
      name?:  string
      email?: string
      lang?:  string
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const safeName  = (name  || '').slice(0, 100).replace(/[<>]/g, '')
    const safeEmail = email.trim().slice(0, 200).replace(/[<>]/g, '')
    const safeLang  = (lang  || 'nl').slice(0, 5)

    const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;color:#0F172A;padding:24px;">
  <h2 style="margin:0 0 12px;font-size:18px;">Nieuwe aanmelding · AI-benchmark waitlist</h2>
  <table style="border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 12px 6px 0;color:#94A3B8;">Naam</td><td><strong>${safeName || '—'}</strong></td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#94A3B8;">E-mail</td><td><strong>${safeEmail}</strong></td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#94A3B8;">Taal</td><td>${safeLang}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#94A3B8;">IP</td><td>${ip}</td></tr>
  </table>
  <p style="margin-top:18px;font-size:12px;color:#94A3B8;">Verzonden vanuit /ai_benchmark/start — geen Supabase-tabel actief, alleen e-mailnotificatie.</p>
</body></html>`

    await resend.emails.send({
      from:    FROM,
      to:      NOTIFY_TO,
      subject: `AI-benchmark waitlist · ${safeName || safeEmail}`,
      html,
      replyTo: safeEmail,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[ai_benchmark/waitlist]', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
