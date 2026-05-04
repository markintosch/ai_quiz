// FILE: src/app/api/maritime_scan/submit/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Submit endpoint for the Maritime Compliance Readiness Scan.
// Same pattern as /api/ai_benchmark/submit — rate-limited, GDPR-aware,
// stores into maritime_scan_responses with computed score + posture.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { scoreAssessment, type Answers } from '@/products/maritime_scan/scoring'
import { type Role } from '@/products/maritime_scan/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_ROLES: Role[] = ['crew_manning', 'compliance_dpa', 'fleet_ops', 'leadership']

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`maritime_scan_submit:${ip}`, 5, 10 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = await req.json() as {
      name?:             string
      email?:            string
      lang?:             string
      role?:             string
      vesselType?:       string
      fleetSize?:        string
      region?:           string
      flagCount?:        string
      marketingConsent?: boolean
      answers?:          Answers
    }

    const email = (body.email || '').trim().toLowerCase()
    if (!email || !email.includes('@') || email.length > 200) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const role = (body.role || '') as Role
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const answers = body.answers || {}
    if (typeof answers !== 'object' || Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid answers' }, { status: 400 })
    }

    const lang = body.lang === 'en' ? 'en' : 'nl'
    const { dimensionScores, totalScore, posture } = scoreAssessment(role, answers, lang)

    const userAgent = req.headers.get('user-agent')?.slice(0, 300) ?? null

    const { data, error } = await supabase
      .from('maritime_scan_responses')
      .insert({
        name:              (body.name || '').slice(0, 100) || null,
        email,
        lang,
        marketing_consent: !!body.marketingConsent,
        role,
        vessel_type:       (body.vesselType || '').slice(0, 30) || null,
        fleet_size:        (body.fleetSize  || '').slice(0, 30) || null,
        region:            (body.region     || '').slice(0, 30) || null,
        flag_count:        (body.flagCount  || '').slice(0, 30) || null,
        answers,
        dimension_scores:  dimensionScores,
        total_score:       totalScore,
        posture,
        ip,
        user_agent:        userAgent,
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('[maritime_scan/submit] insert error', error)
      return NextResponse.json({ error: 'Storage failed' }, { status: 500 })
    }

    return NextResponse.json({
      id:              data.id,
      totalScore,
      posture,
      dimensionScores,
    })
  } catch (err) {
    console.error('[maritime_scan/submit]', err)
    return NextResponse.json({ error: 'Submit failed' }, { status: 500 })
  }
}
