import { Resend } from 'resend'
import { logEmail } from './sender'
import type { Locale, ScanResult } from '@/products/wouterblok/data'

// Result + admin emails for the Growth Flywheel Scan. Reuses the shared Resend
// client config and email_log helper, but keeps wouterblok-native copy/markup so
// it stays self-contained (emerald/navy, EN/NL/DE).

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Wouter Blok <results@brandpwrdmedia.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'mark@brandpwrdmedia.com'

const ACCENT = '#0E9F6E'
const NAVY   = '#0C2B3A'
const GOLD   = '#E8920A'

const SUBJECT: Record<Locale, (tierLabel: string, pct: number) => string> = {
  en: (t, p) => `Your Growth Flywheel Scan: ${p}% — ${t}`,
  nl: (t, p) => `Jouw Growth Flywheel Scan: ${p}% — ${t}`,
  de: (t, p) => `Dein Growth Flywheel Scan: ${p}% — ${t}`,
}

const STRINGS: Record<Locale, {
  hi: (n: string) => string; overall: string; weakest: string; move: string
  cta: string; view: string; outro: string
}> = {
  en: {
    hi: n => `Hi ${n},`,
    overall: 'Overall flywheel maturity',
    weakest: 'Your weakest pillar',
    move: 'Your first move',
    cta: 'Book a call with Wouter',
    view: 'View your full result',
    outro: 'Reply to this email if you want to talk it through.',
  },
  nl: {
    hi: n => `Hi ${n},`,
    overall: 'Totale flywheel-volwassenheid',
    weakest: 'Je zwakste pijler',
    move: 'Je eerste stap',
    cta: 'Plan een gesprek met Wouter',
    view: 'Bekijk je volledige resultaat',
    outro: 'Reageer op deze mail als je het wilt doorpraten.',
  },
  de: {
    hi: n => `Hi ${n},`,
    overall: 'Gesamte Flywheel-Reife',
    weakest: 'Deine schwächste Säule',
    move: 'Dein erster Schritt',
    cta: 'Gespräch mit Wouter buchen',
    view: 'Vollständiges Ergebnis ansehen',
    outro: 'Antworte auf diese Mail, wenn du es besprechen willst.',
  },
}

interface ResultEmailParams {
  to: string
  name: string
  lang: Locale
  result: ScanResult
  tierLabel: string
  narrative: string
  weakName: string
  move: string
  serviceName: string
  resultsUrl: string
  bookingUrl: string
  respondentId: string
}

export async function sendWouterResultEmail(p: ResultEmailParams) {
  const s = STRINGS[p.lang]
  const firstName = p.name.trim().split(/\s+/)[0] || p.name
  const subject = (SUBJECT[p.lang] ?? SUBJECT.en)(p.tierLabel, p.result.pct)

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#111827">
    <div style="background:${NAVY};border-radius:14px;padding:28px 26px;color:#fff">
      <p style="margin:0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.55)">Growth Flywheel Scan</p>
      <p style="margin:10px 0 0;font-size:30px;font-weight:800;text-transform:capitalize">${p.tierLabel}</p>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,.75)">${p.narrative}</p>
      <p style="margin:18px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.55)">${s.overall}</p>
      <p style="margin:2px 0 0;font-size:40px;font-weight:800;color:${GOLD};line-height:1">${p.result.pct}<span style="font-size:18px">%</span></p>
    </div>
    <p style="font-size:15px;line-height:1.6;margin:24px 0 0">${s.hi(firstName)}</p>
    <p style="font-size:14px;line-height:1.65;color:#374151;margin:10px 0 0">
      <strong style="color:${GOLD}">${s.weakest}:</strong> ${p.weakName}
    </p>
    <div style="background:#F5F8F6;border-left:3px solid ${ACCENT};border-radius:8px;padding:16px 18px;margin:18px 0 0">
      <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#076B46">${s.move}</p>
      <p style="margin:6px 0 0;font-size:15px;line-height:1.6;color:#111827">${p.move}</p>
    </div>
    <p style="margin:24px 0 0">
      <a href="${p.bookingUrl}" style="display:inline-block;background:${ACCENT};color:#fff;font-weight:700;font-size:15px;padding:13px 26px;border-radius:6px;text-decoration:none">${s.cta} &rarr;</a>
    </p>
    <p style="margin:16px 0 0;font-size:13px"><a href="${p.resultsUrl}" style="color:#076B46">${s.view}</a></p>
    <p style="margin:24px 0 0;font-size:13px;color:#6B7280">${s.outro}</p>
  </div>`

  const { error } = await resend.emails.send({ from: FROM, to: p.to, subject, html })
  await logEmail({
    respondentId: p.respondentId,
    emailType: 'quiz_summary',
    subject,
    toEmail: p.to,
    status: error ? 'failed' : 'sent',
    errorMessage: error ? String(error) : undefined,
  })
  if (error) { console.error('[wouterblok result email]', error); throw error }
}

interface AdminEmailParams {
  name: string; email: string; company: string; roleLabel: string; stageLabel: string
  result: ScanResult; tierLabel: string; serviceName: string; resultsUrl: string
}

// Fire-and-forget — never throws so it cannot break the submit flow.
export async function sendWouterAdminEmail(p: AdminEmailParams) {
  const subject = `[Flywheel Scan] ${p.name} · ${p.company} · ${p.result.pct}% — ${p.tierLabel}`
  const row = (k: string, v: string, alt = false) =>
    `<tr${alt ? ' style="background:#f9f9f9"' : ''}><td style="padding:6px 12px;color:#555;width:150px">${k}</td><td style="padding:6px 12px;font-weight:600">${v}</td></tr>`
  const html = `
    <div style="font-family:sans-serif;max-width:600px;padding:24px">
      <h2 style="color:${NAVY}">Growth Flywheel Scan — New Submission</h2>
      <table style="border-collapse:collapse;width:100%">
        ${row('Name', p.name)}
        ${row('Email', `<a href="mailto:${p.email}">${p.email}</a>`, true)}
        ${row('Company', p.company)}
        ${row('Role', p.roleLabel, true)}
        ${row('Stage', p.stageLabel)}
        ${row('Score', `${p.result.pct}% — ${p.tierLabel}`, true)}
        ${row('Recommended', p.serviceName)}
      </table>
      <p style="margin-top:24px"><a href="${p.resultsUrl}" style="background:${NAVY};color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View Result &rarr;</a></p>
    </div>`
  try {
    await resend.emails.send({ from: FROM, to: ADMIN_EMAIL, subject, html })
    await logEmail({ emailType: 'admin_notification', subject, toEmail: ADMIN_EMAIL, status: 'sent' })
  } catch (err) {
    console.error('[wouterblok admin email]', err)
  }
}
