export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'HCSS Website <results@brandpwrdmedia.com>'
// Diederik's address is a TODO; until set, notifications go to HCSS_CONTACT_EMAIL
// or fall back to the platform admin address.
const TO = process.env.HCSS_CONTACT_EMAIL ?? process.env.ADMIN_EMAIL ?? 'mark@brandpwrdmedia.com'

function esc(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`hcss-contact:${ip}`, 5, 60 * 60 * 1000) // 5 per hour
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel berichten. Probeer het later opnieuw.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({})) as Record<string, string>
  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim()

  if (!name || !email) {
    return NextResponse.json({ error: 'Naam en e-mail zijn verplicht.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 })
  }

  const rows: Array<[string, string]> = [
    ['Naam', name],
    ['E-mail', email],
    ['Telefoon', body.phone ?? ''],
    ['Organisatie', body.organisation ?? ''],
    ['Aantal medewerkers', body.company_size ?? ''],
    ['Gevonden via', body.source ?? ''],
    ['Bericht', body.message ?? ''],
  ]
  const html = `
    <h2>Nieuw contactverzoek via HCSS-website</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#5a6678"><strong>${esc(k)}</strong></td><td>${esc(v || '—')}</td></tr>`).join('')}
    </table>`

  try {
    await resend.emails.send({
      from: FROM,
      to: TO,
      reply_to: email,
      subject: `HCSS contact: ${name}${body.organisation ? ` (${body.organisation})` : ''}`,
      html,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Verzenden mislukt.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
