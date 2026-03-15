// FILE: src/app/api/admin/companies/[id]/report/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { CompanyReportEmail } from '@/lib/email/templates/companyReport'
import { logEmail } from '@/lib/email/sender'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Brand PWRD Media <results@brandpwrdmedia.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'mark@brandpwrdmedia.com'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: { triggered: boolean; severity?: string; gap: number }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient()

  // Get company
  const { data: company, error: companyErr } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', params.id)
    .single() as unknown as { data: { id: string; name: string } | null; error: unknown }

  if (companyErr || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  // Get respondents for this company
  const { data: respondents } = await supabase
    .from('respondents')
    .select('id, name, email, job_title, created_at')
    .eq('company_id', params.id)
    .order('created_at', { ascending: false }) as unknown as {
      data: Array<{
        id: string
        name: string
        email: string
        job_title: string
        created_at: string
      }> | null
    }

  if (!respondents || respondents.length === 0) {
    return NextResponse.json({ error: 'No respondents for this company yet.' }, { status: 400 })
  }

  const respondentIds = respondents.map((r) => r.id)

  // Get their responses
  const { data: responses } = await supabase
    .from('responses')
    .select('respondent_id, scores, maturity_level, created_at')
    .in('respondent_id', respondentIds)
    .order('created_at', { ascending: false })

  // Latest response per respondent
  const responseMap = new Map<string, {
    scores: ScoresJsonb
    maturity_level: string
    created_at: string
  }>()
  for (const r of responses ?? []) {
    if (!responseMap.has(r.respondent_id)) {
      responseMap.set(r.respondent_id, {
        scores: r.scores as unknown as ScoresJsonb,
        maturity_level: r.maturity_level,
        created_at: r.created_at,
      })
    }
  }

  // Calculate avg score + dimension averages
  const scored = respondents.filter((r) => responseMap.has(r.id))
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((sum, r) => {
        return sum + (responseMap.get(r.id)?.scores.overall ?? 0)
      }, 0) / scored.length)
    : 0

  // Dimension averages
  const dimAccum = new Map<string, { total: number; count: number }>()
  for (const r of scored) {
    const resp = responseMap.get(r.id)
    if (!resp?.scores.dimensionScores) continue
    for (const ds of resp.scores.dimensionScores) {
      const existing = dimAccum.get(ds.label) ?? { total: 0, count: 0 }
      dimAccum.set(ds.label, { total: existing.total + ds.normalized, count: existing.count + 1 })
    }
  }
  const dimensionAverages = Array.from(dimAccum.entries()).map(([label, { total, count }]) => ({
    label,
    avg: Math.round(total / count),
  }))

  // Top 20 respondents for the email
  const topRespondents = respondents.slice(0, 20).map((r) => {
    const resp = responseMap.get(r.id)
    return {
      name: r.name,
      email: r.email,
      jobTitle: r.job_title,
      overallScore: resp?.scores.overall ?? 0,
      maturityLevel: resp?.maturity_level ?? '—',
      shadowAI: resp?.scores.shadowAI?.triggered ?? false,
      date: resp?.created_at
        ? new Date(resp.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—',
    }
  })

  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const html = await render(
    CompanyReportEmail({
      companyName: company.name,
      respondentCount: respondents.length,
      avgScore,
      dimensionAverages,
      topRespondents,
      reportDate,
    })
  )

  const reportSubject = `AI Maturity Report — ${company.name} · ${respondents.length} respondents · Avg ${avgScore}/100`

  const { error: emailErr } = await resend.emails.send({
    from:    FROM,
    to:      ADMIN_EMAIL,
    subject: reportSubject,
    html,
  })

  await logEmail({
    // Company report goes to admin — no individual respondent_id
    emailType:    'company_report',
    subject:      reportSubject,
    toEmail:      ADMIN_EMAIL,
    status:       emailErr ? 'failed' : 'sent',
    errorMessage: emailErr ? String(emailErr) : undefined,
  })

  if (emailErr) {
    console.error('Report email error:', emailErr)
    return NextResponse.json({ error: 'Failed to send report email.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, sentTo: ADMIN_EMAIL })
}
