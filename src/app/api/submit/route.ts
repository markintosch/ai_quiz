import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateScore } from '@/lib/scoring/engine'
import { generateRecommendations } from '@/lib/scoring/recommendations'
import { sendSummaryEmail, sendAdminNotification } from '@/lib/email/sender'
import type { SubmitQuizPayload, SubmitQuizResponse } from '@/types'

export async function POST(req: NextRequest) {
  let body: SubmitQuizPayload

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { version, answers, lead, companySlug, cohortId } = body

  // ── Basic validation ──────────────────────────────────────
  if (!version || !answers || !lead) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!lead.gdprConsent) {
    return NextResponse.json({ error: 'GDPR consent required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    // ── Resolve company (if slug provided) ───────────────────
    let companyId: string | null = null
    if (companySlug) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', companySlug)
        .eq('active', true)
        .single() as { data: { id: string } | null; error: unknown }
      companyId = (company as { id: string } | null)?.id ?? null
    }

    // ── Insert respondent ─────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: respondent, error: respondentError } = await (supabase.from('respondents') as any)
      .insert({
        cohort_id:         cohortId ?? null,
        company_id:        companyId,
        name:              lead.name,
        email:             lead.email,
        job_title:         lead.jobTitle,
        company_name:      lead.companyName,
        industry:          lead.industry ?? null,
        company_size:      lead.companySize ?? null,
        source:            companySlug ? 'company_slug' : 'public',
        gdpr_consent:      lead.gdprConsent,
        marketing_consent: lead.marketingConsent ?? false,
        unsubscribed:      false,
      })
      .select('id')
      .single()

    if (respondentError || !respondent) {
      console.error('Respondent insert error:', respondentError)
      return NextResponse.json({ error: 'Failed to save respondent' }, { status: 500 })
    }

    // ── Score ──────────────────────────────────────────────────
    const quizScore = calculateScore(answers, version)
    const recommendations = generateRecommendations(
      quizScore.dimensionScores,
      quizScore.shadowAI
    )

    // ── Insert response ────────────────────────────────────────
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({
        respondent_id:         respondent.id,
        quiz_version:          version,
        attempt_number:        1,
        answers:               answers as unknown as import('@/types/supabase').Json,
        scores:                quizScore as unknown as import('@/types/supabase').Json,
        maturity_level:        quizScore.maturityLevel,
        shadow_ai_flag:        quizScore.shadowAI.triggered,
        shadow_ai_severity:    quizScore.shadowAI.severity ?? null,
        recommendation_payload: recommendations as unknown as import('@/types/supabase').Json,
      })
      .select('id')
      .single()

    if (responseError || !response) {
      console.error('Response insert error:', responseError)
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
    }

    // ── Create session ─────────────────────────────────────────
    await supabase.from('sessions').insert({
      respondent_id:         respondent.id,
      quiz_version:          version,
      session_status:        'completed',
      consent_timestamp:     new Date().toISOString(),
      privacy_notice_version: '1.0',
    })

    // ── Emails (non-blocking — log errors but don't fail) ──────
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
    const resultsUrl = `${baseUrl}/results/${response.id}`

    await Promise.allSettled([
      sendSummaryEmail({
        to:          lead.email,
        name:        lead.name,
        score:       quizScore,
        resultsUrl,
        respondentId: respondent.id,
        isLite:      version === 'lite',
      }),
      sendAdminNotification({
        respondent: {
          name: lead.name,
          email: lead.email,
          jobTitle: lead.jobTitle,
          companyName: lead.companyName,
          industry: lead.industry,
          companySize: lead.companySize,
        },
        score: quizScore,
        version,
        resultsUrl,
      }),
    ])

    const result: SubmitQuizResponse = {
      respondentId: respondent.id,
      responseId:   response.id,
      resultsUrl:   `/results/${response.id}`,
    }

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    console.error('Submit route unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
