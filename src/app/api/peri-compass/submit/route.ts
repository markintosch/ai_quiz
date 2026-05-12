// FILE: src/app/api/peri-compass/submit/route.ts
// POST /api/peri-compass/submit — meertalig (NL/EN/FR/DE).
//
// Body accepteert nu `language` veld; valt terug naar 'nl'. Wordt opgeslagen in
// perimenopause_compass_assessments.language en gebruikt om Claude in de juiste
// taal te laten antwoorden + de Resend-mail in de juiste taal te sturen.

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { createServiceClient } from '@/lib/supabase/server'
import { scoreResponses, type ResponseMap, type ResponseValue } from '@/lib/peri-compass/scoring'
import { generateCompassInsight } from '@/lib/peri-compass/ai'
import { RAW_QUESTIONS, type Stage } from '@/lib/peri-compass/questions'
import { CompassResultsEmail } from '@/lib/email/templates/compassResults'
import { pickLang, type Lang } from '@/lib/peri-compass/i18n'

export const dynamic     = 'force-dynamic'
export const runtime     = 'nodejs'
export const maxDuration = 120

const BASE     = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'
const FROM     = 'Mark de Kock <compass@brandpwrdmedia.com>'
const REPLY_TO = 'mark@brandpwrdmedia.com'
const resend   = new Resend(process.env.RESEND_API_KEY)

interface SubmitBody {
  stage:        Stage
  responses:    Record<string, ResponseValue>
  language?:    string                  // 'nl' | 'en' | 'fr' | 'de'
  email?:       string
  displayName?: string
  consent?:     boolean
  consentText?: string
}

const VALID_STAGES = new Set([
  'regular_cycle','irregular_cycle','perimenopause_diagnosed','postmenopause','unknown',
])

const SUBJECT_BY_LANG: Record<Lang, (overall: number, band: string) => string> = {
  nl: (o, b) => `Je Peri-Compass — ${o}/100 (${b})`,
  en: (o, b) => `Your Peri-Compass — ${o}/100 (${b})`,
  fr: (o, b) => `Votre Peri-Compass — ${o}/100 (${b})`,
  de: (o, b) => `Dein Peri-Compass — ${o}/100 (${b})`,
}

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`pmcompass:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again in an hour.' }, { status: 429 })
  }

  let body: SubmitBody
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }) }

  if (!VALID_STAGES.has(body.stage)) {
    return NextResponse.json({ error: 'invalid stage' }, { status: 400 })
  }
  if (!body.responses || typeof body.responses !== 'object') {
    return NextResponse.json({ error: 'responses required' }, { status: 400 })
  }

  const lang        = pickLang(body.language)
  const email       = body.email?.trim().toLowerCase() || null
  const displayName = body.displayName?.trim()         || null

  if (email && !body.consent)  return NextResponse.json({ error: 'consent required when providing email' }, { status: 400 })
  if (email && !isValidEmail(email)) return NextResponse.json({ error: 'invalid email' }, { status: 400 })

  const responses: ResponseMap = body.responses
  const score = scoreResponses(responses, body.stage, lang)

  // Symptomen-labels in de gekozen taal voor Claude (en email)
  const symptomsCode = body.stage === 'regular_cycle' ? 'symptoms.regular' : 'symptoms.peri'
  const symptomQ     = RAW_QUESTIONS.find((q) => q.code === symptomsCode)
  const symptomsResp = responses[symptomsCode]
  const symptomsList: string[] = (symptomsResp?.kind === 'multi' && symptomQ)
    ? symptomsResp.value.map((v) => symptomQ.options?.find((o) => o.value === v)?.labels[lang] ?? v)
    : []

  const stressList: string[] = responses['stress_source']?.kind === 'multi'
    ? (responses['stress_source'] as { kind: 'multi'; value: string[] }).value
    : []

  const ageBand   = responses['age_band']?.kind === 'single'   ? (responses['age_band'] as { kind: 'single'; value: string }).value : undefined
  const hrtStatus = responses['hrt_status']?.kind === 'single' ? (responses['hrt_status'] as { kind: 'single'; value: string }).value : undefined
  const topConcernResp = responses['top_concern']
  const topConcern     = topConcernResp?.kind === 'text' ? topConcernResp.value.slice(0, 600) : undefined
  const goal90dResp    = responses['goal_90d']
  const goal90d        = goal90dResp?.kind === 'text' ? goal90dResp.value.slice(0, 600) : undefined

  const ai = await generateCompassInsight({
    stage:         body.stage,
    ageBand,
    hrtStatus,
    score,
    symptomsList,
    topConcern,
    goal90d,
    stressSources: stressList,
    lang,
  })

  const supabase = createServiceClient()

  const { data: assessment, error: aerr } = await supabase
    .from('perimenopause_compass_assessments')
    .insert({
      email,
      display_name:           displayName,
      stage:                  body.stage,
      age_band:               ageBand ?? null,
      hrt_status:             hrtStatus ?? null,
      language:               lang,
      score_overall:          score.overall,
      score_symptom_burden:   score.byDimension.symptom_burden,
      score_sleep_recovery:   score.byDimension.sleep_recovery,
      score_energy_capacity:  score.byDimension.energy_capacity,
      score_stress_context:   score.byDimension.stress_context,
      score_lifestyle:        score.byDimension.lifestyle,
      score_self_awareness:   score.byDimension.self_awareness,
      band:                   score.band,
      goal_90d:               goal90d ?? null,
      ai_observation:         ai.observation,
      ai_hypotheses:          ai.hypotheses,
      ai_micro_experiment:    ai.microExperiment,
      ai_recommended_tracking: ai.recommendedTracking,
      consent_at:             email ? new Date().toISOString() : null,
      consent_text:           body.consentText?.slice(0, 1000) ?? null,
      source_ip:              ip,
      source_path:            '/peri-compass',
    } as never)
    .select('id')
    .single()
  if (aerr || !assessment) {
    return NextResponse.json({ error: aerr?.message ?? 'opslaan mislukt' }, { status: 500 })
  }
  const assessmentId = (assessment as { id: string }).id

  const rows = Object.entries(responses)
    .filter((entry): entry is [string, ResponseValue] => entry[1] !== undefined)
    .map(([code, val]) => ({
      assessment_id: assessmentId,
      question_code: code,
      value_number:  val.kind === 'likert' || val.kind === 'number' ? val.value : null,
      value_text:    val.kind === 'text'   || val.kind === 'single' ? (typeof val.value === 'string' ? val.value : null) : null,
      value_array:   val.kind === 'multi'  ? val.value : null,
    }))
  if (rows.length > 0) {
    await supabase.from('perimenopause_compass_responses').insert(rows as never)
  }

  if (email) {
    await supabase
      .from('perimenopause_compass_profiles')
      .upsert({
        email,
        latest_assessment_id: assessmentId,
        stage:                body.stage,
        recommended_symptoms: ai.recommendedTracking.symptoms,
        recommended_fields:   ai.recommendedTracking.fields,
        goal_90d:             goal90d ?? null,
        baseline_overall:     score.overall,
        baseline_taken_at:    new Date().toISOString(),
      } as never, { onConflict: 'email' })
  }

  if (email && process.env.RESEND_API_KEY) {
    const resultsUrl = `${BASE}/peri-compass/results/${assessmentId}?lang=${lang}`
    const cycleLogin = `${BASE}/Cycle/login?email=${encodeURIComponent(email)}`
    try {
      const html = await render(
        CompassResultsEmail({
          firstName:    displayName ?? null,
          score,
          ai,
          resultsUrl,
          cycleLoginUrl: cycleLogin,
          lang,
        }),
      )
      await resend.emails.send({
        from:     FROM,
        to:       email,
        subject:  SUBJECT_BY_LANG[lang](score.overall, score.band),
        html,
        reply_to: REPLY_TO,
      })
      await supabase
        .from('perimenopause_compass_assessments')
        .update({ email_sent_at: new Date().toISOString() } as never)
        .eq('id', assessmentId)
    } catch {
      // log later
    }
  }

  return NextResponse.json({ id: assessmentId, score, ai })
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254
}
