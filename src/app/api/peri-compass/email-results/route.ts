// FILE: src/app/api/peri-compass/email-results/route.ts
// POST /api/peri-compass/email-results
//
// Stuurt de Compass-resultaten alsnog per e-mail voor een bestaand assessment.
// Use case: gebruiker startte anoniem en wil achteraf toch de samenvatting in
// haar inbox.
//
// Body: { id: string, email: string, consent: boolean, consentText: string }
// Rate limit: 5 per IP per uur.
//
// Update: assessment.email + consent_at + consent_text + email_sent_at en
// upsert profile-rij (zelfde gedrag als wanneer ze direct e-mail hadden gegeven).

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { createServiceClient } from '@/lib/supabase/server'
import { CompassResultsEmail } from '@/lib/email/templates/compassResults'
import { pickLang, type Lang } from '@/lib/peri-compass/i18n'
import type { CompassScore, Band } from '@/lib/peri-compass/scoring'
import { dimensionLabel } from '@/lib/peri-compass/scoring'

export const dynamic     = 'force-dynamic'
export const runtime     = 'nodejs'

const BASE     = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'
const FROM     = 'Mark de Kock <compass@brandpwrdmedia.com>'
const REPLY_TO = 'mark@brandpwrdmedia.com'
const resend   = new Resend(process.env.RESEND_API_KEY)

const SUBJECT_BY_LANG: Record<Lang, (overall: number, band: string) => string> = {
  nl: (o, b) => `Je Peri-Compass — ${o}/100 (${b})`,
  en: (o, b) => `Your Peri-Compass — ${o}/100 (${b})`,
  fr: (o, b) => `Votre Peri-Compass — ${o}/100 (${b})`,
  de: (o, b) => `Dein Peri-Compass — ${o}/100 (${b})`,
}

interface Body {
  id:           string
  email:        string
  consent:      boolean
  consentText?: string
}

interface AssessmentRow {
  id:                       string
  email:                    string | null
  display_name:             string | null
  stage:                    string
  language:                 string
  score_overall:            number
  score_symptom_burden:     number
  score_sleep_recovery:     number
  score_energy_capacity:    number
  score_stress_context:     number
  score_lifestyle:          number
  score_self_awareness:     number
  band:                     Band | null
  ai_observation:           string | null
  ai_hypotheses:            string[]
  ai_micro_experiment:      string | null
  ai_micro_experiment_code: string | null
  ai_micro_experiment_source:     string | null
  ai_micro_experiment_source_url: string | null
  ai_recommended_tracking:  { symptoms?: string[]; fields?: string[] } | null
  goal_90d:                 string | null
}

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`pmcompass-email:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again in an hour.' }, { status: 429 })
  }

  let body: Body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }) }

  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  if (!body.email || !isValidEmail(body.email)) return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  if (!body.consent) return NextResponse.json({ error: 'consent required' }, { status: 400 })

  const email = body.email.trim().toLowerCase()
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'mail service not configured' }, { status: 500 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('perimenopause_compass_assessments')
    .select('*')
    .eq('id', body.id)
    .maybeSingle()
  if (error)  return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data)  return NextResponse.json({ error: 'not found' }, { status: 404 })

  const a    = data as unknown as AssessmentRow
  const lang = pickLang(a.language)

  // Reconstrueer een minimale CompassScore voor het email-template
  const dims = ([
    ['symptom_burden',  a.score_symptom_burden],
    ['sleep_recovery',  a.score_sleep_recovery],
    ['energy_capacity', a.score_energy_capacity],
    ['stress_context',  a.score_stress_context],
    ['lifestyle',       a.score_lifestyle],
    ['self_awareness',  a.score_self_awareness],
  ] as const).map(([d, s]) => ({
    dimension: d as 'symptom_burden'|'sleep_recovery'|'energy_capacity'|'stress_context'|'lifestyle'|'self_awareness',
    label:     dimensionLabel(d, lang),
    score:     s,
    weight:    0,
  }))
  const score: CompassScore = {
    overall:    a.score_overall,
    band:       (a.band ?? 'navigating') as Band,
    dimensions: dims,
    byDimension: {
      meta: 0,
      symptom_burden:  a.score_symptom_burden,
      sleep_recovery:  a.score_sleep_recovery,
      energy_capacity: a.score_energy_capacity,
      stress_context:  a.score_stress_context,
      lifestyle:       a.score_lifestyle,
      self_awareness:  a.score_self_awareness,
    },
  }

  const ai = {
    observation:         a.ai_observation     ?? '',
    hypotheses:          a.ai_hypotheses      ?? [],
    microExperiment:     a.ai_micro_experiment ?? '',
    experimentCode:      a.ai_micro_experiment_code      ?? undefined,
    experimentSource:    a.ai_micro_experiment_source    ?? undefined,
    experimentSourceUrl: a.ai_micro_experiment_source_url ?? undefined,
    recommendedTracking: {
      symptoms: a.ai_recommended_tracking?.symptoms ?? [],
      fields:   a.ai_recommended_tracking?.fields   ?? [],
    },
  }

  const resultsUrl   = `${BASE}/peri-compass/results/${a.id}?lang=${lang}`
  const cycleLogin   = `${BASE}/Cycle/login?email=${encodeURIComponent(email)}`

  try {
    const html = await render(
      CompassResultsEmail({
        firstName:     a.display_name,
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
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'send failed' }, { status: 500 })
  }

  // Koppel e-mail nu aan de assessment + consent + log mail-tijd
  await supabase
    .from('perimenopause_compass_assessments')
    .update({
      email,
      consent_at:    new Date().toISOString(),
      consent_text:  body.consentText?.slice(0, 1000) ?? null,
      email_sent_at: new Date().toISOString(),
    } as never)
    .eq('id', a.id)

  // Profile upsert zodat de Cycle-app personalisering ook werkt voor late-mail subscribers
  await supabase
    .from('perimenopause_compass_profiles')
    .upsert({
      email,
      latest_assessment_id: a.id,
      stage:                a.stage,
      recommended_symptoms: ai.recommendedTracking.symptoms ?? [],
      recommended_fields:   ai.recommendedTracking.fields   ?? [],
      goal_90d:             a.goal_90d,
      baseline_overall:     a.score_overall,
      baseline_taken_at:    new Date().toISOString(),
    } as never, { onConflict: 'email' })

  return NextResponse.json({ ok: true })
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254
}
