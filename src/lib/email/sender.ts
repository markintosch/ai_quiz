import { Resend } from 'resend'
import { render } from '@react-email/render'
import { SummaryEmail } from './templates/summary'
import { AdminNotificationEmail } from './templates/adminNotification'
import type { QuizScore, QuizVersion } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Brand PWRD Media <results@brandpwrdmedia.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'mark@brandpwrdmedia.com'

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

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('Summary email send error:', error)
    throw error
  }
}

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
    to: ADMIN_EMAIL,
    subject,
    html,
  })

  if (error) {
    console.error('Admin notification email send error:', error)
    throw error
  }
}
