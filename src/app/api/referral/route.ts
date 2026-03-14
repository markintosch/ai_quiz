import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { ReferralInviteEmail } from '@/lib/email/templates/referralInvite'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Brand PWRD Media <results@brandpwrdmedia.com>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yourdomain.com'

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    inviteeName: string
    inviteeEmail: string
    referrerName: string
    referrerCompany: string
    referrerScore: number
    referrerLevel: string
    gdprConsent: boolean
  }

  if (!body.gdprConsent) {
    return NextResponse.json({ error: 'GDPR consent required.' }, { status: 400 })
  }

  const { inviteeName, inviteeEmail, referrerName, referrerCompany, referrerScore, referrerLevel } = body

  if (!inviteeName?.trim() || !inviteeEmail?.trim()) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const html = await render(
    ReferralInviteEmail({
      inviteeName,
      referrerName,
      referrerCompany,
      referrerScore,
      referrerLevel,
      quizUrl: `${BASE_URL}/quiz`,
    })
  )

  const { error } = await resend.emails.send({
    from: FROM,
    to: inviteeEmail,
    subject: `${referrerName} thinks you should know your AI Maturity Score`,
    html,
  })

  if (error) {
    console.error('Referral email error:', error)
    return NextResponse.json({ error: 'Failed to send invitation.' }, { status: 500 })
  }

  // NOTE: We intentionally do NOT store the invitee's email in the database.
  // It is used solely to send this one-time invitation (GDPR compliant).

  return NextResponse.json({ ok: true })
}
