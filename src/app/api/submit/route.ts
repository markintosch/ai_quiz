export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateScore } from '@/lib/scoring/engine'
import { getProductConfig } from '@/products'
import { sendSummaryEmail, sendAdminNotification, sendLeadNotification, sendFollowUpEmail } from '@/lib/email/sender'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import type { SubmitQuizPayload, SubmitQuizResponse } from '@/types'

export async function POST(req: NextRequest) {
  let body: SubmitQuizPayload

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── Rate limiting ──────────────────────────────────────────
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`submit:${ip}`, 5, 10 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many submissions. Please wait a few minutes.' }, { status: 429 })
  }

  const { version, answers, lead, companySlug, cohortId, waveId, locale = 'en', productKey = 'ai_maturity',
          refSource, utmSource, utmMedium, utmCampaign, parentResponseId } = body
  // Extract optional fitness-specific lead fields
  const { phone, callMeBack } = lead as { phone?: string; callMeBack?: boolean }

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
    let companyNotifyEmail: string | null = null
    if (companySlug) {
      const { data: company } = await supabase
        .from('companies')
        .select('id, notify_email')
        .eq('slug', companySlug)
        .eq('active', true)
        .single() as { data: { id: string; notify_email: string | null } | null; error: unknown }
      companyId = company?.id ?? null
      companyNotifyEmail = company?.notify_email ?? null
    }

    // ── Upsert respondent (retake logic) ──────────────────────
    const { data: existing } = await supabase
      .from('respondents')
      .select('id')
      .ilike('email', lead.email.trim())
      .maybeSingle() as { data: { id: string } | null; error: unknown }

    let respondentId: string

    if (existing) {
      // Returning respondent — update their profile and reuse their id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('respondents') as any)
        .update({
          name:         lead.name,
          job_title:    lead.jobTitle,
          company_name: lead.companyName,
          industry:     lead.industry ?? null,
          company_size: lead.companySize ?? null,
          company_id:   companyId,
          source:       companySlug ?? 'public',
          phone:        phone ?? null,
          call_me_back: callMeBack ?? false,
        })
        .eq('id', existing.id)

      respondentId = existing.id
    } else {
      // New respondent — insert
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
          source:            companySlug ?? 'public',
          gdpr_consent:      lead.gdprConsent,
          marketing_consent: lead.marketingConsent ?? false,
          unsubscribed:      false,
          phone:             phone ?? null,
          call_me_back:      callMeBack ?? false,
        })
        .select('id')
        .single()

      if (respondentError || !respondent) {
        console.error('Respondent insert error:', respondentError)
        return NextResponse.json({ error: 'Failed to save respondent' }, { status: 500 })
      }

      respondentId = respondent.id
    }

    // ── Determine attempt number ───────────────────────────────
    const { data: lastAttempt } = await supabase
      .from('responses')
      .select('attempt_number')
      .eq('respondent_id', respondentId)
      .order('attempt_number', { ascending: false })
      .limit(1)
      .maybeSingle() as { data: { attempt_number: number } | null; error: unknown }

    const attemptNumber = (lastAttempt?.attempt_number ?? 0) + 1

    // ── Score ──────────────────────────────────────────────────
    const productConfig = getProductConfig(productKey)
    const quizScore = calculateScore(answers, version, productConfig)
    const flagResults: Record<string, unknown> = { shadow_ai: quizScore.shadowAI }
    const recommendations = productConfig.generateRecommendations(
      quizScore.dimensionScores,
      flagResults
    )

    // ── Insert response ────────────────────────────────────────
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({
        respondent_id:         respondentId,
        quiz_version:          version,
        attempt_number:        attemptNumber,
        answers:               answers as unknown as import('@/types/supabase').Json,
        scores:                quizScore as unknown as import('@/types/supabase').Json,
        maturity_level:        quizScore.maturityLevel,
        shadow_ai_flag:        quizScore.shadowAI.triggered,
        shadow_ai_severity:    quizScore.shadowAI.severity ?? null,
        recommendation_payload: recommendations as unknown as import('@/types/supabase').Json,
        product_key:           productConfig.key,
        ref_source:            refSource   ?? null,
        utm_source:            utmSource   ?? null,
        utm_medium:            utmMedium   ?? null,
        utm_campaign:          utmCampaign ?? null,
        // Lite→Full continuation: link upgraded response back to its parent
        ...(parentResponseId ? { parent_response_id: parentResponseId } : {}),
      })
      .select('id')
      .single()

    if (responseError || !response) {
      console.error('Response insert error:', responseError)
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
    }

    // ── Link to cohort wave (if applicable) ───────────────────
    if (cohortId && waveId) {
      await supabase.from('cohort_responses').insert({
        cohort_id:   cohortId,
        wave_id:     waveId,
        response_id: response.id,
      })
      // Best-effort: also stamp respondent.cohort_id for backward compat
      await supabase.from('respondents').update({ cohort_id: cohortId }).eq('id', respondentId)
    }

    // ── Create session ─────────────────────────────────────────
    await supabase.from('sessions').insert({
      respondent_id:         respondentId,
      quiz_version:          version,
      session_status:        'completed',
      consent_timestamp:     new Date().toISOString(),
      privacy_notice_version: '1.0',
    })

    // ── Emails (non-blocking — log errors but don't fail) ──────
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
    const resultsUrl = `${baseUrl}/${locale}/results/${response.id}`

    // Normalise locale to one of the supported email locales.
    const emailLocale: 'en' | 'nl' | 'fr' =
      locale === 'nl' ? 'nl' : locale === 'fr' ? 'fr' : 'en'

    await Promise.allSettled([
      sendSummaryEmail({
        to:          lead.email,
        name:        lead.name,
        score:       quizScore,
        resultsUrl,
        respondentId,
        isLite:      version === 'lite',
        locale:      emailLocale,
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
      // 48h follow-up email — only for marketing_consent or B2B company source
      ...(lead.marketingConsent || companySlug ? [sendFollowUpEmail({
        to:           lead.email,
        name:         lead.name,
        score:        quizScore.overall,
        maturityLevel: quizScore.maturityLevel,
        resultsUrl,
        nextStepsUrl: `${baseUrl}/${locale}/next-steps?r=${response.id}`,
        respondentId,
        productName:  productConfig.name,
        locale:       emailLocale,
      })] : []),
      // Company lead notification — only fires when notify_email is set on the company
      ...(companyNotifyEmail ? [sendLeadNotification({
        notifyEmail: companyNotifyEmail,
        respondent: {
          name: lead.name,
          email: lead.email,
          jobTitle: lead.jobTitle,
          companyName: lead.companyName,
          industry: lead.industry,
          companySize: lead.companySize,
        },
        score: quizScore,
        resultsUrl,
        productName: getProductConfig(productKey).name,
      })] : []),
    ])

    const result: SubmitQuizResponse = {
      respondentId,
      responseId:   response.id,
      resultsUrl:   `/results/${response.id}`,
    }

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    console.error('Submit route unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
