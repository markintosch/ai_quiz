export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'AI Governance <results@brandpwrdmedia.com>'
const TO = process.env.AI_GOVERNANCE_EMAIL ?? process.env.ADMIN_EMAIL ?? 'mark@brandpwrdmedia.com'

function esc(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`aig-signup:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel inzendingen. Probeer het later opnieuw.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({})) as Record<string, string>
  const first = (body.first_name ?? '').trim()
  const last = (body.last_name ?? '').trim()
  const email = (body.email ?? '').trim()

  if (!first || !last || !email) {
    return NextResponse.json({ error: 'Naam en e-mail zijn verplicht.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 })
  }

  // Persist first — this is the record of record. Email is a best-effort notice.
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('ai_governance_signups').insert({
      first_name: first,
      last_name: last,
      email,
      organisation: body.organisation ?? null,
      role: body.role ?? null,
      company_size: body.company_size ?? null,
      question: body.question ?? null,
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
    ['Naam', `${first} ${last}`],
    ['E-mail', email],
    ['Organisatie', body.organisation ?? ''],
    ['Rol', body.role ?? ''],
    ['Aantal medewerkers', body.company_size ?? ''],
    ['Grootste governance-vraag', body.question ?? ''],
  ]
  const html = `
    <h2>Nieuwe voorinschrijving — AI Governance middag</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#5a6678"><strong>${esc(k)}</strong></td><td>${esc(v || '—')}</td></tr>`).join('')}
    </table>`

  try {
    await resend.emails.send({
      from: FROM,
      to: TO,
      reply_to: email,
      subject: `AI Governance voorinschrijving: ${first} ${last}${body.organisation ? ` (${body.organisation})` : ''}`,
      html,
    })
  } catch (err) {
    // Row is already saved; a failed notification email must not fail the signup.
    console.error('[ai-governance/signup] notification email failed:', err)
  }

  return NextResponse.json({ ok: true })
}
