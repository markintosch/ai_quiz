export const dynamic = 'force-dynamic'
export const maxDuration = 60

// FILE: src/app/api/atelier/session/[id]/ask/route.ts
// POST — ask a follow-up question about a specific session.
// Loads the session bundle from atelier_* tables, runs the Q&A module,
// persists the turn, returns the answer.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runQa } from '@/lib/atelier/modules/qa'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import type {
  Angle,
  AudiencePicture,
  AudienceSignal,
  Direction,
  IcpProfile,
  JtbdParse,
  LiveSignal,
  Reference,
} from '@/lib/atelier/schemas'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface AskBody { question: string }

interface ReferenceRow {
  title: string; description: string; source_kind: string;
  source_label: string; source_url: string | null;
  relevance_score: number; taste_note: string;
}
interface SignalRow {
  track: string; claim: string; evidence: string | null;
  source_label: string; source_url: string | null;
  confidence: string; contradicts: string[] | null;
}
interface DirectionRow {
  position: number; tension: string; route: string; rationale: string | null;
}
interface IcpRow {
  industry: string | null; role: string | null; company_size: string | null;
  triggers: unknown; jobs: unknown; pains: unknown; buying_committee: unknown;
  rationale: string | null;
  business_type: string | null;
}
interface AngleRow {
  lens: string; headline: string; body_md: string; evidence: unknown;
}
interface LiveSignalRow {
  title: string; snippet: string | null; source_url: string | null;
  source_label: string | null; relevance_score: number | null; retrieved_via: string;
}
interface QaTurnRow { question: string; answer: string }

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`atelier-ask:${ip}`, 30, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel vragen. Probeer later opnieuw.' }, { status: 429 })
  }

  let body: AskBody
  try {
    body = (await req.json()) as AskBody
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 })
  }

  if (!body.question || body.question.trim().length < 2) {
    return NextResponse.json({ error: 'Vraag is te kort.' }, { status: 400 })
  }

  // Load session + all bundle parts in parallel
  const [sessionRes, jtbdRunRes, refsRes, signalsRes, dirsRes, icpRes, anglesRes, liveRes, historyRes] = await Promise.all([
    sb.from('atelier_sessions').select('id, status').eq('id', sessionId).single(),
    sb.from('atelier_module_runs').select('output_payload').eq('session_id', sessionId).eq('module', 'brief_jtbd').eq('status', 'ok').order('started_at', { ascending: false }).limit(1).maybeSingle(),
    sb.from('atelier_references').select('title, description, source_kind, source_label, source_url, relevance_score, taste_note').eq('session_id', sessionId).order('position'),
    sb.from('atelier_audience_signals').select('track, claim, evidence, source_label, source_url, confidence, contradicts').eq('session_id', sessionId),
    sb.from('atelier_directions').select('position, tension, route, rationale').eq('session_id', sessionId).order('position'),
    sb.from('atelier_icp_profiles').select('industry, role, company_size, triggers, jobs, pains, buying_committee, rationale, business_type').eq('session_id', sessionId).maybeSingle(),
    sb.from('atelier_angles').select('lens, headline, body_md, evidence').eq('session_id', sessionId),
    sb.from('atelier_live_signals').select('title, snippet, source_url, source_label, relevance_score, retrieved_via').eq('session_id', sessionId),
    sb.from('atelier_qa_turns').select('question, answer').eq('session_id', sessionId).order('created_at').limit(20),
  ])

  if (sessionRes.error || !sessionRes.data) {
    return NextResponse.json({ error: 'Sessie niet gevonden.' }, { status: 404 })
  }

  const jtbd = (jtbdRunRes.data?.output_payload ?? null) as JtbdParse | null
  if (!jtbd) {
    return NextResponse.json({ error: 'Sessie heeft nog geen JTBD — orchestrator draait nog.' }, { status: 400 })
  }

  const references: Reference[] = (refsRes.data ?? []).map((r: ReferenceRow) => ({
    title: r.title,
    description: r.description,
    source_kind: r.source_kind as Reference['source_kind'],
    source_label: r.source_label,
    source_url: r.source_url ?? null,
    relevance_score: r.relevance_score,
    taste_note: r.taste_note,
  }))

  const signals: AudienceSignal[] = (signalsRes.data ?? []).map((s: SignalRow) => ({
    track: s.track as AudienceSignal['track'],
    claim: s.claim,
    evidence: s.evidence ?? undefined,
    source_label: s.source_label,
    source_url: s.source_url ?? null,
    confidence: s.confidence as AudienceSignal['confidence'],
    contradicts: s.contradicts ?? [],
  }))

  const audience: AudiencePicture = {
    audience_summary: '',
    signals,
    weak_claims: [],
  }

  const directions: Direction[] = (dirsRes.data ?? []).map((d: DirectionRow) => ({
    position: d.position,
    tension: d.tension,
    route: d.route,
    rationale: d.rationale ?? '',
    evidence_refs: [],
    audience_refs: [],
  }))

  const icpRow = icpRes.data as IcpRow | null
  const icp: IcpProfile | undefined = icpRow ? {
    business_type: (icpRow.business_type as IcpProfile['business_type']) ?? 'b2b',
    industry: icpRow.industry ?? '',
    role: icpRow.role ?? '',
    company_size: icpRow.company_size ?? '',
    triggers: (icpRow.triggers as string[]) ?? [],
    jobs: (icpRow.jobs as string[]) ?? [],
    pains: (icpRow.pains as string[]) ?? [],
    buying_committee: (icpRow.buying_committee as IcpProfile['buying_committee']) ?? [],
    rationale: icpRow.rationale ?? '',
  } : undefined

  const angles: Angle[] = (anglesRes.data ?? []).map((a: AngleRow) => ({
    lens: a.lens as Angle['lens'],
    headline: a.headline,
    body_md: a.body_md,
    evidence: (a.evidence as Angle['evidence']) ?? [],
  }))

  const liveSignals: LiveSignal[] = (liveRes.data ?? []).map((s: LiveSignalRow) => ({
    title: s.title,
    snippet: s.snippet ?? '',
    source_url: s.source_url ?? null,
    source_label: s.source_label ?? '',
    relevance_score: Number(s.relevance_score) || 0,
    retrieved_via: s.retrieved_via as LiveSignal['retrieved_via'],
  }))

  const history = (historyRes.data ?? []).map((h: QaTurnRow) => ({ question: h.question, answer: h.answer }))

  try {
    const result = await runQa({
      sessionId,
      question: body.question.trim(),
      bundle: { jtbd, references, audience, directions, icp, angles, liveSignals },
      history,
    })

    // Persist turn
    await sb.from('atelier_qa_turns').insert({
      session_id:    sessionId,
      question:      body.question.trim(),
      answer:        result.answer,
      model:         result.model,
      prompt_tokens: result.promptTokens,
      output_tokens: result.outputTokens,
      cost_cents:    result.costCents,
    })

    return NextResponse.json({ answer: result.answer })
  } catch (err) {
    console.error('[atelier/ask]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Q&A mislukt.' }, { status: 500 })
  }
}
