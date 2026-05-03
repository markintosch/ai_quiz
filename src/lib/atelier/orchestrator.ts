// FILE: src/lib/atelier/orchestrator.ts
// Single entry point: brief in → full session out.
// Runs Module 1, then 2 + 3 in parallel, then 4, then 5. Persists at every
// step so a partial failure leaves something readable in the DB.

import { runBriefJtbd } from './modules/brief-jtbd'
import { runReferenceRetrieval } from './modules/reference'
import { runAudienceEvidence } from './modules/audience'
import { runTensionSynthesis } from './modules/tension'
import { runOutputPackaging } from './modules/output'
import { serverSupabase } from './run-logger'
import type { SessionBundle } from './schemas'

export interface OrchestrateInput {
  sessionId:    string
  rawBrief:     string
  brandContext?: string
  language:     'nl' | 'en' | 'fr'
}

export interface OrchestrateResult {
  sessionId: string
  bundle:    SessionBundle
  outputId:  string
}

export async function orchestrateSession(input: OrchestrateInput): Promise<OrchestrateResult> {
  const sb = serverSupabase()

  // Mark running
  await sb.from('atelier_sessions')
    .update({ status: 'running', updated_at: new Date().toISOString() })
    .eq('id', input.sessionId)

  // ── Module 1 ──────────────────────────────────────────────────────────
  const jtbd = await runBriefJtbd(input.sessionId, {
    rawBrief:     input.rawBrief,
    brandContext: input.brandContext,
    language:     input.language,
  })
  await sb.from('atelier_sessions')
    .update({ jtbd_summary: jtbd.brief_summary, updated_at: new Date().toISOString() })
    .eq('id', input.sessionId)

  // ── Modules 2 + 3 in parallel ─────────────────────────────────────────
  const [references, audience] = await Promise.all([
    runReferenceRetrieval(input.sessionId, jtbd),
    runAudienceEvidence(input.sessionId, jtbd, input.brandContext),
  ])

  // Persist references
  if (references.length > 0) {
    await sb.from('atelier_references').insert(
      references.map((r, i) => ({
        session_id:      input.sessionId,
        title:           r.title,
        description:     r.description,
        source_kind:     r.source_kind,
        source_label:    r.source_label,
        source_url:      r.source_url ?? null,
        relevance_score: r.relevance_score,
        taste_note:      r.taste_note,
        position:        i,
      }))
    )
  }

  // Persist audience signals
  if (audience.signals.length > 0) {
    await sb.from('atelier_audience_signals').insert(
      audience.signals.map(s => ({
        session_id:   input.sessionId,
        track:        s.track,
        claim:        s.claim,
        evidence:     s.evidence ?? null,
        source_label: s.source_label,
        source_url:   s.source_url ?? null,
        confidence:   s.confidence,
        contradicts:  s.contradicts ?? [],
      }))
    )
  }

  // ── Module 4 ──────────────────────────────────────────────────────────
  const directions = await runTensionSynthesis(input.sessionId, { jtbd, references, audience })

  // Persist directions
  if (directions.length > 0) {
    await sb.from('atelier_directions').insert(
      directions.map(d => ({
        session_id:    input.sessionId,
        position:      d.position,
        tension:       d.tension,
        route:         d.route,
        rationale:     d.rationale,
        evidence_refs: [],   // names → ids resolution skipped for now (provenance lives in bundle)
        audience_refs: [],
      }))
    )
  }

  // ── Module 5 ──────────────────────────────────────────────────────────
  const bundle: SessionBundle = {
    brief: {
      raw_text:      input.rawBrief,
      brand_context: input.brandContext,
      language:      input.language,
    },
    jtbd,
    references,
    audience,
    directions,
  }

  const onePager = await runOutputPackaging(input.sessionId, bundle)

  // Persist output
  const { data: outRow } = await sb.from('atelier_outputs')
    .insert({
      session_id:     input.sessionId,
      format:         onePager.format,
      language:       onePager.language,
      body_md:        onePager.body_md,
      provenance_map: onePager.provenance_map,
    })
    .select('id')
    .single()

  // Compute total cost from module_runs and write back to session
  const { data: runs } = await sb.from('atelier_module_runs')
    .select('cost_cents')
    .eq('session_id', input.sessionId)
  const totalCostCents = (runs ?? []).reduce(
    (acc: number, r: { cost_cents: number | null }) => acc + (Number(r.cost_cents) || 0),
    0,
  )

  await sb.from('atelier_sessions')
    .update({
      status:          'completed',
      has_one_pager:   true,
      total_cost_cents: totalCostCents,
      updated_at:      new Date().toISOString(),
    })
    .eq('id', input.sessionId)

  return { sessionId: input.sessionId, bundle, outputId: (outRow as { id: string }).id }
}
