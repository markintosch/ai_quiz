import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { createServiceClient } from '@/lib/supabase/server'
import type { Json } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek.' }, { status: 400 })
  }

  const { themeId, entityId, scores, email, marketingConsent } = body as Record<string, unknown>

  if (typeof themeId !== 'string' || themeId.trim() === '') {
    return NextResponse.json({ error: 'themeId ontbreekt.' }, { status: 400 })
  }
  if (typeof entityId !== 'string' || entityId.trim() === '') {
    return NextResponse.json({ error: 'entityId ontbreekt.' }, { status: 400 })
  }

  // Rate limit per IP + entity
  const rlKey = `pulse:submit:${ip}:${entityId}`
  const rl = rateLimit(rlKey, 2, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Je hebt dit al beoordeeld. Probeer het later opnieuw.' },
      { status: 429 },
    )
  }

  if (typeof scores !== 'object' || scores === null || Array.isArray(scores)) {
    return NextResponse.json({ error: 'Scores ontbreken.' }, { status: 400 })
  }

  const scoresObj = scores as Record<string, unknown>
  for (const [key, val] of Object.entries(scoresObj)) {
    if (typeof val !== 'number' || val < 1 || val > 5 || !Number.isInteger(val)) {
      return NextResponse.json(
        { error: `Score voor "${key}" moet een geheel getal zijn tussen 1 en 5.` },
        { status: 400 },
      )
    }
  }

  const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

  const supabase = createServiceClient()

  // Check for existing response (soft revision)
  const { data: existing } = await supabase
    .from('pulse_responses_v2')
    .select('id')
    .eq('ip_hash', ipHash)
    .eq('entity_id', entityId.trim())
    .maybeSingle()

  const { data, error } = await supabase
    .from('pulse_responses_v2')
    .insert({
      theme_id: themeId.trim(),
      entity_id: entityId.trim(),
      scores: scoresObj as Json,
      ip_hash: ipHash,
      revision_of: existing?.id ?? null,
    })
    .select('respondent_num')
    .single()

  if (error || !data) {
    console.error('[pulse/submit] DB error:', error)
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het opnieuw.' }, { status: 500 })
  }

  // Store lead if email provided
  if (typeof email === 'string' && email.trim() !== '') {
    await supabase.from('pulse_leads').insert({
      email: email.trim(),
      theme_id: themeId.trim(),
      consent_marketing: marketingConsent === true,
      consent_results: true,
    })
  }

  // Get total count for this entity
  const { count } = await supabase
    .from('pulse_responses_v2')
    .select('id', { count: 'exact', head: true })
    .eq('entity_id', entityId.trim())

  return NextResponse.json({
    respondentNum: data.respondent_num,
    totalResponses: count ?? 1,
  })
}
