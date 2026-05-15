// FILE: src/app/api/cyber-compass/submit/route.ts
// POST /api/cyber-compass/submit — HCSS Cyber Compass.

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { createServiceClient } from '@/lib/supabase/server'
import { scoreResponses, type ResponseMap, type ResponseValue } from '@/lib/cyber-compass/scoring'
import { generateCompassInsight } from '@/lib/cyber-compass/ai'
import type { Stage } from '@/lib/cyber-compass/questions'
import { pickLang, type Lang, BRAND } from '@/lib/cyber-compass/i18n'
import { CyberCompassResultsEmail } from '@/lib/email/templates/cyberCompassResults'
import { CyberCompassNotifyEmail }  from '@/lib/email/templates/cyberCompassNotify'

export const dynamic     = 'force-dynamic'
export const runtime     = 'nodejs'
export const maxDuration = 120

const BASE     = 'https://markdekock.com'
const FROM     = 'HCSS Cyber Compass <compass@brandpwrdmedia.com>'
const REPLY_TO = 'mark@brandpwrdmedia.com'
const NOTIFY_TO_DIEDERIK = process.env.HCSS_NOTIFY_EMAIL ?? 'mark@brandpwrdmedia.com'  // tot Diederik bevestigt
const resend   = new Resend(process.env.RESEND_API_KEY)

interface SubmitBody {
  stage:            Stage
  responses:        Record<string, ResponseValue>
  language?:        string
  email?:           string
  displayName?:     string
  organisationName?:string
  consent?:         boolean
  consentText?:     string
}

const VALID_STAGES = new Set(['1-10','11-50','51-250','251-1000','1000+'])

const SUBJECT_BY_LANG: Record<Lang, (overall: number, band: string) => string> = {
  nl: (o, b) => `Je HCSS Cyber Compass — ${o}/100 (${b})`,
  en: (o, b) => `Your HCSS Cyber Compass — ${o}/100 (${b})`,
}

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`cybercompass:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel pogingen. Probeer het over een uur opnieuw.' }, { status: 429 })
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

  const lang             = pickLang(body.language)
  const email            = body.email?.trim().toLowerCase() || null
  const displayName      = body.displayName?.trim()         || null
  const organisationName = body.organisationName?.trim()    || null

  if (email && !body.consent) {
    return NextResponse.json({ error: 'consent required when providing email' }, { status: 400 })
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  const responses: ResponseMap = body.responses
  const score = scoreResponses(responses, body.stage, lang)

  const sector = responses['sector']?.kind === 'single' ? (responses['sector'] as { kind: 'single'; value: string }).value : undefined
  const role   = responses['role']?.kind   === 'single' ? (responses['role']   as { kind: 'single'; value: string }).value : undefined
  const topConcernResp = responses['top_concern']
  const topConcern     = topConcernResp?.kind === 'text' ? topConcernResp.value.slice(0, 600) : undefined

  // NIS2 + ISO afgeleid uit antwoorden
  const nis2Resp = responses['nis2_status']
  let nis2_in_scope: boolean | null = null
  if (nis2Resp?.kind === 'single') {
    const v = (nis2Resp as { kind: 'single'; value: string }).value
    if (v === 'compliant' || v === 'in_progress' || v === 'in_scope_undone') nis2_in_scope = true
    else if (v === 'not_in_scope') nis2_in_scope = false
  }
  const isoResp = responses['iso27001_status']
  const iso27001_status = isoResp?.kind === 'single' ? (isoResp as { kind: 'single'; value: string }).value : null

  // Claude
  const ai = await generateCompassInsight({
    organisationName: organisationName ?? undefined,
    organisationSize: body.stage,
    sector, role,
    score, topConcern,
    lang,
  })

  const supabase = createServiceClient()

  const corePayload = {
    email,
    display_name:           displayName,
    organisation_name:      organisationName,
    organisation_size:      body.stage,
    sector:                 sector ?? null,
    role:                   role ?? null,
    language:               lang,
    score_overall:          score.overall,
    score_iam:              score.byDimension.iam,
    score_awareness:        score.byDimension.awareness,
    score_data:             score.byDimension.data,
    score_endpoint:         score.byDimension.endpoint,
    score_backup:           score.byDimension.backup,
    score_compliance:       score.byDimension.compliance,
    score_supply_chain:     score.byDimension.supply_chain,
    band:                   score.band,
    nis2_in_scope,
    iso27001_status,
    top_concern:            topConcern ?? null,
    ai_observation:         ai.observation,
    ai_risk_observations:   ai.riskObservations,
    ai_quick_wins:          ai.quickWins,
    ai_specialist_topic:    ai.specialistTopic,
    ai_specialist_reason:   ai.specialistReason,
    ai_recommended_actions: ai.quickWins.map((q) => q.code),
    consent_at:             email ? new Date().toISOString() : null,
    consent_text:           body.consentText?.slice(0, 1000) ?? null,
    source_ip:              ip,
    source_path:            '/HCSS',
  }

  const { data: assessment, error: aerr } = await supabase
    .from('cyber_compass_assessments')
    .insert(corePayload as never)
    .select('id')
    .single()
  if (aerr || !assessment) {
    console.error('[cyber-compass/submit] insert failed', aerr)
    return NextResponse.json({ error: aerr?.message ?? 'opslaan mislukt' }, { status: 500 })
  }
  const assessmentId = (assessment as { id: string }).id

  // Save raw responses
  const rows = Object.entries(responses)
    .filter((entry): entry is [string, ResponseValue] => entry[1] !== undefined)
    .map(([code, val]) => ({
      assessment_id: assessmentId,
      question_code: code,
      value_number:  val.kind === 'likert' ? val.value : null,
      value_text:    val.kind === 'text'   || val.kind === 'single' ? (typeof val.value === 'string' ? val.value : null) : null,
      value_array:   val.kind === 'multi'  ? val.value : null,
    }))
  if (rows.length > 0) {
    await supabase.from('cyber_compass_responses').insert(rows as never)
  }

  // Profile upsert
  if (email) {
    await supabase
      .from('cyber_compass_profiles')
      .upsert({
        email,
        latest_assessment_id: assessmentId,
        organisation_name:    organisationName,
        organisation_size:    body.stage,
        baseline_overall:     score.overall,
        baseline_taken_at:    new Date().toISOString(),
        recommended_actions:  ai.quickWins.map((q) => q.code),
      } as never, { onConflict: 'email' })
  }

  // Email naar respondent (als email gegeven)
  if (email && process.env.RESEND_API_KEY) {
    const resultsUrl = `${BASE}/HCSS/results/${assessmentId}${lang === 'nl' ? '' : '?lang=' + lang}`
    try {
      const html = await render(
        CyberCompassResultsEmail({
          firstName: displayName ?? null,
          score, ai, resultsUrl, lang,
          calendlyUrl: BRAND.calendlyUrl,
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
        .from('cyber_compass_assessments')
        .update({ email_sent_at: new Date().toISOString() } as never)
        .eq('id', assessmentId)
    } catch (err) {
      console.warn('[cyber-compass/submit] respondent email failed', err)
    }

    // Notify Diederik (lead alert)
    try {
      const adminUrl = `${BASE}/admin/cyber-compass`
      const notifyHtml = await render(
        CyberCompassNotifyEmail({
          respondentName:  displayName ?? '(geen naam)',
          respondentEmail: email,
          organisation:    organisationName ?? '(niet opgegeven)',
          orgSize:         body.stage,
          sector:          sector ?? null,
          score,
          topConcern:      topConcern ?? null,
          adminUrl,
          resultsUrl,
        }),
      )
      await resend.emails.send({
        from:     FROM,
        to:       NOTIFY_TO_DIEDERIK,
        subject:  `Nieuwe Cyber Compass lead: ${organisationName ?? email} — ${score.overall}/100 (${score.band})`,
        html:     notifyHtml,
        reply_to: REPLY_TO,
      })
    } catch (err) {
      console.warn('[cyber-compass/submit] notify Diederik failed', err)
    }
  }

  return NextResponse.json({ id: assessmentId, score, ai })
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254
}
