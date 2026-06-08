export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { sendWouterResultEmail, sendWouterAdminEmail } from '@/lib/email/wouterblok'
import {
  computeResult, reasoningFor, narrativeFor, moveFor, buildStoredScores,
  getContent, bookingHref, normaliseLocale,
  type RoleId, type StageId,
} from '@/products/wouterblok/data'
import type { Json } from '@/types/supabase'

const PRODUCT_KEY = 'wouterblok'

interface Body {
  answers: Record<string, number>
  role: RoleId
  stage: StageId
  lang?: string
  lead: { name: string; email: string; company: string; gdprConsent: boolean; marketingConsent?: boolean }
}

export async function POST(req: NextRequest) {
  let body: Body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const ip = getClientIp(req.headers)
  const rl = rateLimit(`wouterblok:${ip}`, 5, 10 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many submissions. Please wait a few minutes.' }, { status: 429 })
  }

  const { answers, role, stage, lead } = body
  const lang = normaliseLocale(body.lang)

  if (!answers || !role || !stage || !lead?.name || !lead?.email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!lead.gdprConsent) {
    return NextResponse.json({ error: 'GDPR consent required' }, { status: 400 })
  }
  // Light email sanity check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const content = getContent(lang)
  const roleLabel  = content.roles.find(r => r.id === role)?.label ?? role
  const stageLabel = content.stages.find(s => s.id === stage)?.label ?? stage

  const result    = computeResult(answers, role, stage)
  const tierLabel = content.tiers.find(t => t.key === result.tier)?.label ?? result.tier
  const service   = content.services.find(s => s.key === result.service)
  const scores    = buildStoredScores(result, role, stage, lang)
  const reasoning = reasoningFor(lang, result, role, stage)
  const narrative = narrativeFor(lang, result)
  const move      = moveFor(lang, result.weakestPillar)
  const weakName  = content.pillars.find(p => p.id === result.weakestPillar)?.name ?? result.weakestPillar
  const company   = lead.company?.trim() || '—'

  // ── Respondent upsert (retake logic by email) ──────────────
  let respondentId: string
  try {
    const { data: existing } = await supabase
      .from('respondents').select('id').ilike('email', lead.email.trim()).maybeSingle()

    const baseProfile = {
      name: lead.name.trim(),
      job_title: roleLabel,
      company_name: company,
      source: 'public' as const,
    }

    if (existing) {
      await supabase.from('respondents').update(baseProfile).eq('id', existing.id)
      respondentId = existing.id
    } else {
      // marketing_consent column exists (migration_phase2); fall back if not.
      const insert = async (withConsent: boolean) => supabase
        .from('respondents')
        .insert(withConsent
          ? { ...baseProfile, email: lead.email.trim(), gdpr_consent: true, marketing_consent: lead.marketingConsent ?? false }
          : { ...baseProfile, email: lead.email.trim(), gdpr_consent: true })
        .select('id').single()

      let { data, error } = await insert(true)
      if (error && (error.code === 'PGRST204' || /marketing_consent/.test(error.message ?? ''))) {
        ({ data, error } = await insert(false))
      }
      if (error || !data) throw error ?? new Error('respondent insert failed')
      respondentId = data.id
    }
  } catch (err) {
    console.error('[wouterblok submit] respondent error', err)
    return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 500 })
  }

  // ── Response insert (reuse responses table, product_key=wouterblok) ──
  let responseId: string
  try {
    const { data: last } = await supabase
      .from('responses').select('attempt_number')
      .eq('respondent_id', respondentId).order('attempt_number', { ascending: false }).limit(1).maybeSingle()
    const attemptNumber = ((last?.attempt_number as number | undefined) ?? 0) + 1

    const base = {
      respondent_id: respondentId,
      quiz_version: 'full' as const,
      attempt_number: attemptNumber,
      answers: answers as unknown as Json,
      scores: scores as unknown as Json,
      maturity_level: result.tier,
      shadow_ai_flag: false,
      recommendation_payload: [{ service: result.service, name: service?.name, reasoning, move }] as unknown as Json,
    }

    // product_key from migration_whitelabel; retry without it if the column is absent.
    let { data, error } = await supabase
      .from('responses').insert({ ...base, product_key: PRODUCT_KEY }).select('id').single()
    if (error && (error.code === 'PGRST204' || /product_key/.test(error.message ?? ''))) {
      ({ data, error } = await supabase.from('responses').insert(base).select('id').single())
    }
    if (error || !data) throw error ?? new Error('response insert failed')
    responseId = data.id
  } catch (err) {
    console.error('[wouterblok submit] response error', err)
    return NextResponse.json({ error: 'Could not save your result. Please try again.' }, { status: 500 })
  }

  // ── Session (best-effort) ──────────────────────────────────
  try {
    await supabase.from('sessions').insert({
      respondent_id: respondentId,
      quiz_version: 'full',
      session_status: 'completed',
      consent_timestamp: new Date().toISOString(),
      privacy_notice_version: '1.0',
    })
  } catch (err) { console.error('[wouterblok submit] session error', err) }

  // ── Emails ─────────────────────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(req.url).origin
  const resultsUrl = `${baseUrl}/wouterblok/results?id=${responseId}&lang=${lang}`
  const bookingUrl = bookingHref(result.service, lang)

  try {
    await sendWouterResultEmail({
      to: lead.email.trim(), name: lead.name.trim(), lang, result, tierLabel,
      narrative, weakName, move, serviceName: service?.name ?? '', resultsUrl, bookingUrl, respondentId,
    })
  } catch (err) { console.error('[wouterblok submit] result email failed', err) }

  // Admin notification is fire-and-forget.
  void sendWouterAdminEmail({
    name: lead.name.trim(), email: lead.email.trim(), company, roleLabel, stageLabel,
    result, tierLabel, serviceName: service?.name ?? '', resultsUrl,
  })

  return NextResponse.json({ responseId, lang }, { status: 201 })
}
