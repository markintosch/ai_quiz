export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateScore } from '@/lib/scoring/engine'
import { getProductConfig } from '@/products'
import { MOBA_QUESTIONS } from '@/products/moba_marketing/questions'
import { MOBA_PRIORITY_OPTIONS, MOBA_PRIORITY_TOTAL, MOBA_OPEN_QUESTIONS, MOBA_ROLE_CODES } from '@/products/moba_marketing/config'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import type { AnswerMap } from '@/types'

const OPEN_MAX = 2000 // char cap per open answer

// POST /api/moba/submit — anonymous MOBA marketing survey submission.
// No PII: we store answers, computed dimension scores, priorities, open text
// and an optional segment. Nothing that identifies a person.
export async function POST(req: NextRequest) {
  // ── Rate limiting (unauthenticated route) ──────────────────
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`moba-submit:${ip}`, 5, 10 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel inzendingen. Wacht een paar minuten.' }, { status: 429 })
  }

  let body: {
    submitToken?: string
    answers?: Record<string, number>
    priorities?: Record<string, number>
    openAnswers?: Record<string, string>
    segment?: number | null
    role?: { selected?: string[]; other?: string }
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 })
  }

  const { submitToken, answers, priorities, openAnswers, segment, role } = body

  if (!submitToken || typeof submitToken !== 'string') {
    return NextResponse.json({ error: 'Ongeldige link' }, { status: 400 })
  }
  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'Antwoorden ontbreken' }, { status: 400 })
  }

  // ── Validate the 18 likert answers ─────────────────────────
  const codes = MOBA_QUESTIONS.map(q => q.code)
  const cleanAnswers: AnswerMap = {}
  for (const code of codes) {
    const v = answers[code]
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 1 || v > 5) {
      return NextResponse.json({ error: `Vraag ${code} is niet (geldig) beantwoord` }, { status: 400 })
    }
    cleanAnswers[code] = v
  }

  // ── Validate priorities: 10 points across the 6 dimensions ─
  const dimKeys = MOBA_PRIORITY_OPTIONS.map(o => o.key)
  const cleanPriorities: Record<string, number> = {}
  let prioritySum = 0
  for (const key of dimKeys) {
    const raw = priorities?.[key]
    const v = typeof raw === 'number' && Number.isFinite(raw) ? Math.max(0, Math.round(raw)) : 0
    cleanPriorities[key] = v
    prioritySum += v
  }
  if (prioritySum !== MOBA_PRIORITY_TOTAL) {
    return NextResponse.json(
      { error: `Verdeel precies ${MOBA_PRIORITY_TOTAL} punten (nu ${prioritySum})` },
      { status: 400 }
    )
  }

  // ── Sanitise open answers (optional) ───────────────────────
  const cleanOpen: Record<string, string> = {}
  for (const { key } of MOBA_OPEN_QUESTIONS) {
    const raw = openAnswers?.[key]
    if (typeof raw === 'string' && raw.trim()) {
      cleanOpen[key] = raw.trim().slice(0, OPEN_MAX)
    }
  }

  // ── Segment (optional, 1–5) ────────────────────────────────
  let cleanSegment: number | null = null
  if (segment != null) {
    const s = Number(segment)
    if (Number.isFinite(s) && s >= 1 && s <= 5) cleanSegment = Math.round(s)
  }

  // ── Rol-van-marketing (optional): multi-select + free text ─
  const validCodes = MOBA_ROLE_CODES as readonly string[]
  const roleSelected = Array.isArray(role?.selected)
    ? [...new Set(role!.selected.filter(c => typeof c === 'string' && validCodes.includes(c)))]
    : []
  const roleOther = typeof role?.other === 'string' ? role.other.trim().slice(0, OPEN_MAX) : ''
  const cleanRole = { selected: roleSelected, other: roleOther }

  const supabase = createServiceClient()

  // ── Resolve team by submit token ───────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: team } = await (supabase.from('moba_teams') as any)
    .select('id, active')
    .eq('submit_token', submitToken)
    .maybeSingle()

  if (!team || team.active === false) {
    return NextResponse.json({ error: 'Deze survey is niet (meer) beschikbaar.' }, { status: 404 })
  }

  // ── Score per dimension (reuse the standard engine) ────────
  const productConfig = getProductConfig('moba_marketing')
  const quizScore = calculateScore(cleanAnswers, 'full', productConfig)
  const dimensionScores: Record<string, number> = {}
  for (const ds of quizScore.dimensionScores) {
    dimensionScores[ds.dimension] = ds.normalized
  }

  // ── Insert the anonymous submission ────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await (supabase.from('moba_submissions') as any).insert({
    team_id:          team.id,
    answers:          cleanAnswers,
    dimension_scores: dimensionScores,
    priorities:       cleanPriorities,
    open_answers:     cleanOpen,
    segment:          cleanSegment,
    role_answers:     cleanRole,
  })

  if (insertError) {
    console.error('MOBA submission insert error:', insertError)
    return NextResponse.json({ error: 'Opslaan mislukt. Probeer het opnieuw.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
