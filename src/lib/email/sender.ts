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
