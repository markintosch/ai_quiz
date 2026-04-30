import { Resend } from 'resend'
import { render } from '@react-email/render'
import { SummaryEmail } from './templates/summary'
import { AdminNotificationEmail } from './templates/adminNotification'
import { FollowUpEmail } from './templates/followUp'
import { createServiceClient } from '@/lib/supabase/server'
import type { QuizScore, QuizVersion } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Brand PWRD Media <results@brandpwrdmedia.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'mark@brandpwrdmedia.com'

// ── Email log helper ──────────────────────────────────────────────────────────
// Non-blocking: logs to email_log table after every send.
// Never throws — a logging failure must never break the email send.

export type EmailType =
  | 'quiz_summary'
  | 'quiz_followup'
  | 'admin_notification'
  | 'referral_invite'
  | 'company_report'
  | 'training_confirmation'
  | 'training_reminder'
  | 'training_followup'

export async function logEmail({
  respondentId,
  emailType,
  subject,
  toEmail,
  status,
  errorMessage,
}: {
  respondentId?: string
  emailType: EmailType
  subject: string
  toEmail: string
  status: 'sent' | 'failed'
  errorMessage?: string
}) {
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('email_log').insert({
      respondent_id: respondentId ?? null,
      email_type:    emailType,
      subject,
      to_email:      toEmail,
      status,
      error_message: errorMessage ?? null,
    })
  } catch (err) {
    // Log to console but never propagate — logging must be fire-and-forget
    console.error('[email_log] Failed to write log entry:', err)
  }
}

// ── sendSummaryEmail ──────────────────────────────────────────────────────────

type Locale = 'en' | 'nl' | 'fr'

const SUMMARY_SUBJECT: Record<Locale, (lite: boolean, score: QuizScore) => string> = {
  en: (lite, s) => lite
    ? `Your AI Maturity Score: ${s.overall}/100 — ${s.maturityLevel}`
    : `Your AI Maturity Assessment Results — ${s.maturityLevel} (${s.overall}/100)`,
  nl: (lite, s) => lite
    ? `Jouw AI-maturity score: ${s.overall}/100 — ${s.maturityLevel}`
    : `Je AI-maturity assessment resultaat — ${s.maturityLevel} (${s.overall}/100)`,
  fr: (lite, s) => lite
    ? `Votre score AI Maturity : ${s.overall}/100 — ${s.maturityLevel}`
    : `Vos résultats AI Maturity — ${s.maturityLevel} (${s.overall}/100)`,
}

const FOLLOWUP_SUBJECT: Record<Locale, (firstName: string, productName: string) => string> = {
  en: (n, p) => `Still thinking about your ${p} score? Here's your next step, ${n}.`,
  nl: (n, p) => `Nog aan het denken over je ${p}-score? Hier is je volgende stap, ${n}.`,
  fr: (n, p) => `Vous réfléchissez encore à votre score ${p} ? Voici votre prochaine étape, ${n}.`,
}

interface SendSummaryEmailParams {
  to: string
  name: string
  score: QuizScore
  resultsUrl: string
  respondentId: string
  isLite: boolean
  locale?: Locale
}

export async function sendSummaryEmail(params: SendSummaryEmailParams) {
  const { to, name, score, resultsUrl, respondentId, isLite, locale = 'en' } = params

  const html = await render(
    SummaryEmail({ name, score, resultsUrl, respondentId, isLite, locale })
  )

  const subjectFn = SUMMARY_SUBJECT[locale] ?? SUMMARY_SUBJECT.en
  const subject = subjectFn(isLite, score)

  const { error } = await resend.emails.send({ from: FROM, to, subject, html })

  await logEmail({
    respondentId,
    emailType:    'quiz_summary',
    subject,
    toEmail:      to,
    status:       error ? 'failed' : 'sent',
    errorMessage: error ? String(error) : undefined,
  })

  if (error) {
    console.error('Summary email send error:', error)
    throw error
  }
}

// ── sendLeadNotification ──────────────────────────────────────────────────────
// Sends lead data to a company's notify_email (e.g. TrueFullstaq sales inbox).
// Fire-and-forget — never throws so it cannot break the submit flow.

interface SendLeadNotificationParams {
  notifyEmail: string
  respondent: {
    name: string
    email: string
    jobTitle: string
    companyName: string
    industry?: string
    companySize?: string
  }
  score: QuizScore
  resultsUrl: string
  productName: string
}

export async function sendLeadNotification(params: SendLeadNotificationParams) {
  const { notifyEmail, respondent, score, resultsUrl, productName } = params
  const subject = `[New Lead] ${respondent.name} · ${respondent.companyName} · ${score.overall}/100 — ${score.maturityLevel}`

  const html = `
    <div style="font-family:sans-serif;max-width:600px;padding:24px">
      <h2 style="color:#354E5E">${productName} — New Submission</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:6px 12px;color:#555;width:140px">Name</td><td style="padding:6px 12px;font-weight:600">${respondent.name}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:6px 12px;color:#555">Email</td><td style="padding:6px 12px"><a href="mailto:${respondent.email}">${respondent.email}</a></td></tr>
        <tr><td style="padding:6px 12px;color:#555">Job Title</td><td style="padding:6px 12px">${respondent.jobTitle}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:6px 12px;color:#555">Company</td><td style="padding:6px 12px">${respondent.companyName}</td></tr>
        ${respondent.industry ? `<tr><td style="padding:6px 12px;color:#555">Industry</td><td style="padding:6px 12px">${respondent.industry}</td></tr>` : ''}
        ${respondent.companySize ? `<tr style="background:#f9f9f9"><td style="padding:6px 12px;color:#555">Company Size</td><td style="padding:6px 12px">${respondent.companySize}</td></tr>` : ''}
        <tr><td style="padding:6px 12px;color:#555">Score</td><td style="padding:6px 12px;font-weight:600;color:#E8611A">${score.overall}/100 — ${score.maturityLevel}</td></tr>
      </table>
      <p style="margin-top:24px">
        <a href="${resultsUrl}" style="background:#354E5E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View Full Results →</a>
      </p>
    </div>
  `

  try {
    await resend.emails.send({ from: FROM, to: notifyEmail, subject, html })
  } catch (err) {
    console.error('[sendLeadNotification] failed:', err)
    // Never rethrow — this is a secondary notification
  }
}

// ── sendAdminNotification ─────────────────────────────────────────────────────

interface SendAdminNotificationParams {
  respondent: {
    name: string
    email: string
    jobTitle: string
    companyName: string
    industry?: string
    companySize?: string
  }
  score: QuizScore
  version: QuizVersion
  resultsUrl: string
}

export async function sendAdminNotification(params: SendAdminNotificationParams) {
  const { respondent, score, version, resultsUrl } = params

  const html = await render(
    AdminNotificationEmail({ respondent, score, version, resultsUrl })
  )

  const shadowTag = score.shadowAI.triggered
    ? ` 🚨 Shadow AI (${score.shadowAI.severity})`
    : ''

  const subject = `[KB Quiz] ${version === 'lite' ? 'Lite' : 'Full'} — ${respondent.name} · ${respondent.companyName} · ${score.overall}/100${shadowTag}`

  const { error } = await resend.emails.send({
    from: FROM,
    to:   ADMIN_EMAIL,
    subject,
    html,
  })

  // Admin notification: no respondent_id (it's an internal email)
  await logEmail({
    emailType:    'admin_notification',
    subject,
    toEmail:      ADMIN_EMAIL,
    status:       error ? 'failed' : 'sent',
    errorMessage: error ? String(error) : undefined,
  })

  if (error) {
    console.error('Admin notification email send error:', error)
    throw error
  }
}

// ── sendFollowUpEmail ─────────────────────────────────────────────────────────
// Scheduled 48h after submit via Resend scheduledAt.
// Fire-and-forget — never throws, logs result.

interface SendFollowUpEmailParams {
  to: string
  name: string
  score: number
  maturityLevel: string
  resultsUrl: string
  nextStepsUrl: string
  respondentId: string
  productName?: string
  locale?: Locale
}

const FOLLOWUP_GENERIC: Record<Locale, string> = {
  en: 'AI Maturity Assessment',
  nl: 'AI-maturity assessment',
  fr: 'évaluation AI Maturity',
}

export async function sendFollowUpEmail(params: SendFollowUpEmailParams) {
  const { to, name, score, maturityLevel, resultsUrl, nextStepsUrl, respondentId, productName, locale = 'en' } = params
  const firstName = name.trim().split(/\s+/)[0]
  const product   = productName ?? FOLLOWUP_GENERIC[locale] ?? FOLLOWUP_GENERIC.en

  const html = await render(
    FollowUpEmail({ firstName, score, maturityLevel, resultsUrl, nextStepsUrl, productName: product, locale })
  )

  const subjectFn = FOLLOWUP_SUBJECT[locale] ?? FOLLOWUP_SUBJECT.en
  const subject = subjectFn(firstName, product)

  const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      scheduledAt,
    } as any)

    await logEmail({
      respondentId,
      emailType:    'quiz_followup',
      subject,
      toEmail:      to,
      status:       error ? 'failed' : 'sent',
      errorMessage: error ? String(error) : undefined,
    })

    if (error) console.error('[sendFollowUpEmail] send error:', error)
  } catch (err) {
    console.error('[sendFollowUpEmail] unexpected error:', err)
  }
}
