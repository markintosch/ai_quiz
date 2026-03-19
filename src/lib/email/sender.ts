import { Resend } from 'resend'
import { render } from '@react-email/render'
import { SummaryEmail } from './templates/summary'
import { AdminNotificationEmail } from './templates/adminNotification'
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

interface SendSummaryEmailParams {
  to: string
  name: string
  score: QuizScore
  resultsUrl: string
  respondentId: string
  isLite: boolean
}

export async function sendSummaryEmail(params: SendSummaryEmailParams) {
  const { to, name, score, resultsUrl, respondentId, isLite } = params

  const html = await render(
    SummaryEmail({ name, score, resultsUrl, respondentId, isLite })
  )

  const subject = isLite
    ? `Your AI Maturity Score: ${score.overall}/100 — ${score.maturityLevel}`
    : `Your AI Maturity Assessment Results — ${score.maturityLevel} (${score.overall}/100)`

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
