export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'AI Leiderschap <results@brandpwrdmedia.com>'
const TO = process.env.LEIDERSCHAP_EMAIL ?? process.env.ADMIN_EMAIL ?? 'mark@brandpwrdmedia.com'

function esc(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`ail-waitlist:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel inzendingen. Probeer het later opnieuw.' }, { status: 429 })
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

  // Persist first; email is a best-effort notification.
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('leiderschap_waitlist').insert({
      name,
      email,
      organisation: body.organisation ?? null,
      role: body.role ?? null,
      preference: body.preference ?? null,
      consent: body.consent === 'on' || body.consent === 'true' || body.consent === '1',
    })
    if (error) throw new Error(error.message)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Opslaan mislukt.' },
      { status: 500 },
    )
  }

  const rows: Array<[string, string]> = [
    ['Naam', name],
    ['E-mail', email],
    ['Organisatie', body.organisation ?? ''],
    ['Rol', body.role ?? ''],
    ['Voorkeur periode', body.preference ?? ''],
  ]
  const html = `
    <h2>Nieuwe voorinschrijving — AI Leiderschap (volgende editie)</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#5a6678"><strong>${esc(k)}</strong></td><td>${esc(v || '—')}</td></tr>`).join('')}
    </table>`

  try {
    await resend.emails.send({
      from: FROM,
      to: TO,
      reply_to: email,
      subject: `AI Leiderschap voorinschrijving: ${name}${body.organisation ? ` (${body.organisation})` : ''}`,
      html,
    })
  } catch (err) {
    console.error('[ai-leiderschap/waitlist] notification email failed:', err)
  }

  return NextResponse.json({ ok: true })
}
