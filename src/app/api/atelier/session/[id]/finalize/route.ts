export const dynamic = 'force-dynamic'
export const maxDuration = 300  // 5 min budget all to itself

// FILE: src/app/api/atelier/session/[id]/finalize/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Module 5 — output packaging — runs here, NOT inside the orchestrator.
// Why: keeps the orchestrator under the Vercel maxDuration ceiling. This
// endpoint loads the completed bundle from the DB and runs runOutputPackaging
// in its own function invocation with its own 5-min budget.
//
// Trigger: called by the session page (auto on first visit when has_one_pager
// is false) or by an explicit "Genereer one-pager" button.
//
// Idempotent-ish: if has_one_pager is already true, returns 200 with the
// existing output_id. If currently running (we don't have a lock; we just
// rely on it being cheap to recompute), it'll write a second output row —
// the session page reads the latest, so duplicates are harmless.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { waitUntil } from '@vercel/functions'
import { runOutputPackaging } from '@/lib/atelier/modules/output'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import type {
  SessionBundle, JtbdParse, Reference, AudiencePicture, Direction, IcpProfile, Angle, LiveSignal,
} from '@/lib/atelier/schemas'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`atelier-finalize:${ip}`, 30, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel finalize-calls deze uur.' }, { status: 429 })
  }

  const { id: sessionId } = await params

  // Load session
  const { data: session } = await sb
    .from('atelier_sessions')
    .select('id, status, language, has_one_pager, jtbd_summary, total_cost_cents')
    .eq('id', sessionId)
    .maybeSingle() as { data: { id: string; status: string; language: string; has_one_pager: boolean; jtbd_summary: string | null; total_cost_cents: number } | null }

  if (!session) return NextResponse.json({ error: 'Sessie niet gevonden.' }, { status: 404 })
  if (session.status !== 'completed') {
    return NextResponse.json({ error: `Sessie is ${session.status} — wacht tot completed.` }, { status: 409 })
  }
  if (session.has_one_pager) {
    return NextResponse.json({ status: 'already_finalized' }, { status: 200 })
  }

  // Load brief + jtbd + parallel-batch outputs from the DB so we can pass
  // a complete SessionBundle to runOutputPackaging.
  const [briefRes, jtbdRowRes, refsRes, signalsRes, dirsRes, icpRes, anglesRes, liveRes] = await Promise.all([
    sb.from('atelier_briefs').select('raw_text, brand_context').eq('session_id', sessionId).maybeSingle(),
    sb.from('atelier_module_runs').select('output_payload').eq('session_id', sessionId).eq('module', 'brief_jtbd').eq('status', 'ok').order('started_at', { ascending: false }).limit(1).maybeSingle(),
    sb.from('atelier_references').select('title, description, source_kind, source_label, source_url, relevance_score, taste_note').eq('session_id', sessionId).order('position'),
    sb.from('atelier_audience_signals').select('track, claim, evidence, source_label, source_url, confidence, contradicts').eq('session_id', sessionId),
    sb.from('atelier_directions').select('position, tension, route, rationale').eq('session_id', sessionId).order('position'),
    sb.from('atelier_icp_profiles').select('business_type, industry, role, company_size, triggers, jobs, pains, buying_committee, rationale').eq('session_id', sessionId).maybeSingle(),
    sb.from('atelier_angles').select('lens, headline, body_md, evidence').eq('session_id', sessionId),
    sb.from('atelier_live_signals').select('title, snippet, source_url, source_label, relevance_score, retrieved_via').eq('session_id', sessionId),
  ])

  const brief    = briefRes.data    as { raw_text: string; brand_context: string | null } | null
  const jtbdRow  = jtbdRowRes.data  as { output_payload: JtbdParse } | null
  const jtbd     = jtbdRow?.output_payload ?? null
  if (!brief || !jtbd) {
    return NextResponse.json({ error: 'Brief of JTBD ontbreekt — kan geen one-pager maken.' }, { status: 400 })
  }

  const references  = (refsRes.data    ?? []) as Reference[]
  const signals     = (signalsRes.data ?? []) as AudiencePicture['signals']
  const directions  = (dirsRes.data    ?? []) as Direction[]
  const icp         = icpRes.data as IcpProfile | null
  const angles      = (anglesRes.data  ?? []) as Angle[]
  const liveSignals = (liveRes.data    ?? []) as LiveSignal[]

  const audience: AudiencePicture = {
    audience_summary: '',  // not persisted separately; the bundle uses signals + summary, summary lives in the brief row context
    signals,
    weak_claims: [],       // weak_claims are runtime-only QA hints; the one-pager doesn't need them
  }

  const bundle: SessionBundle = {
    brief: {
      raw_text:      brief.raw_text,
      brand_context: brief.brand_context ?? undefined,
      language:      session.language as 'nl' | 'en' | 'fr',
    },
    jtbd,
    references,
    audience,
    directions,
    icp:        icp ?? undefined,
    angles,
    liveSignals,
  }

  // Run Module 5 in the background; respond immediately so the client can
  // start polling the session page (which already auto-refreshes).
  waitUntil((async () => {
    try {
      const onePager = await runOutputPackaging(sessionId, bundle)

      const { data: outRow } = await sb.from('atelier_outputs')
        .insert({
          session_id:     sessionId,
          format:         onePager.format,
          language:       onePager.language,
          body_md:        onePager.body_md,
          provenance_map: onePager.provenance_map,
        })
        .select('id')
        .single()

      // Re-compute total cost (output module added some).
      const { data: runs } = await sb.from('atelier_module_runs')
        .select('cost_cents')
        .eq('session_id', sessionId)
      const totalCostCents = (runs ?? []).reduce(
        (acc: number, r: { cost_cents: number | null }) => acc + (Number(r.cost_cents) || 0),
        0,
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (sb.from('atelier_sessions') as any)
        .update({
          has_one_pager:    true,
          total_cost_cents: totalCostCents,
          updated_at:       new Date().toISOString(),
        })
        .eq('id', sessionId)

      console.log('[atelier/finalize] done', { sessionId, outputId: (outRow as { id: string } | null)?.id })
    } catch (err) {
      console.error('[atelier/finalize] failed', err)
      // We deliberately do NOT mark the session as failed — the structured
      // bundle is intact. The session page just won't show a one-pager
      // until next attempt.
    }
  })())

  return NextResponse.json({ status: 'finalizing' }, { status: 202 })
}
