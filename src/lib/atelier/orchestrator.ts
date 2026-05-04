// FILE: src/lib/atelier/orchestrator.ts
// Single entry point: brief in → full session out.
// Runs Module 1, then 2 + 3 in parallel, then 4, then 5. Persists at every
// step so a partial failure leaves something readable in the DB.

import { runBriefJtbd } from './modules/brief-jtbd'
import { runReferenceRetrieval } from './modules/reference'
import { runAudienceEvidence } from './modules/audience'
import { runTensionSynthesis } from './modules/tension'
import { runOutputPackaging } from './modules/output'
import { runIcpProfile } from './modules/icp'
import { runAllAngles } from './modules/angles'
import { runLiveSignals } from './modules/live-signal'
import { enrichWithCbs } from './sources/cbs'
import { serverSupabase } from './run-logger'
import type {
  Angle,
  AudiencePicture,
  AudienceSignal,
  IcpProfile,
  LiveSignal,
  Reference,
  SessionBundle,
} from './schemas'

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

  // ── Modules 2 + 3 + ICP + Angles + Live signal + CBS in parallel ───────
  // All depend only on JTBD (and optionally brand context). Run in parallel,
  // collect successes, log failures via runModule's own catch path.
  const settled = await Promise.allSettled([
    runReferenceRetrieval(input.sessionId, jtbd),                 // 0: references
    runAudienceEvidence(input.sessionId, jtbd, input.brandContext), // 1: audience
    runIcpProfile(input.sessionId, jtbd, input.brandContext),     // 2: icp
    runAllAngles(input.sessionId, jtbd, input.brandContext),      // 3: angles
    runLiveSignals({ sessionId: input.sessionId, jtbd }),         // 4: live signals
    enrichWithCbs({                                               // 5: CBS Ground Truth
      sessionId: input.sessionId,
      jtbdDutch: jtbd.jtbd_dutch,
      briefSummary: jtbd.brief_summary,
    }),
  ])

  const references: Reference[] = settled[0].status === 'fulfilled' ? settled[0].value : []
  const audience: AudiencePicture = settled[1].status === 'fulfilled' ? settled[1].value : {
    audience_summary: '',
    signals: [],
    weak_claims: [],
  }
  const icp: IcpProfile | undefined = settled[2].status === 'fulfilled' ? settled[2].value : undefined
  const angles: Angle[] = settled[3].status === 'fulfilled' ? settled[3].value : []
  const liveSignals: LiveSignal[] = settled[4].status === 'fulfilled' ? settled[4].value : []
  const cbsResult = settled[5].status === 'fulfilled' ? settled[5].value : { signals: [] as AudienceSignal[], fetched_at: new Date().toISOString() }
  const cbsSignals: AudienceSignal[] = cbsResult.signals
  const cbsFetchedAt: string = cbsResult.fetched_at

  // Merge CBS-strong-evidence signals into the audience picture (Ground track)
  if (cbsSignals.length > 0) {
    audience.signals = [
      ...cbsSignals,
      ...audience.signals,
    ]
  }

  // Persist references — for archive items the "fetch" is constant (it's
  // a static seed corpus); for live_source / inferred we use 'now'.
  const nowIso = new Date().toISOString()
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
        data_fetched_at: nowIso,
      }))
    )
  }

  // Persist audience signals
  // CBS-derived signals carry a _fetched_at; module-3 LLM signals get
  // 'now' as their fetch time (model knowledge is current at this moment).
  if (audience.signals.length > 0) {
    const nowIso = new Date().toISOString()
    const cbsClaimSet = new Set(cbsSignals.map(c => c.claim))
    await sb.from('atelier_audience_signals').insert(
      audience.signals.map(s => ({
        session_id:      input.sessionId,
        track:           s.track,
        claim:           s.claim,
        evidence:        s.evidence ?? null,
        source_label:    s.source_label,
        source_url:      s.source_url ?? null,
        confidence:      s.confidence,
        contradicts:     s.contradicts ?? [],
        data_fetched_at: cbsClaimSet.has(s.claim) ? cbsFetchedAt : nowIso,
      }))
    )
  }

  // Persist ICP
  if (icp) {
    await sb.from('atelier_icp_profiles').insert({
      session_id:       input.sessionId,
      business_type:    icp.business_type,
      industry:         icp.industry,
      role:             icp.role,
      company_size:     icp.company_size,
      triggers:         icp.triggers,
      jobs:             icp.jobs,
      pains:            icp.pains,
      buying_committee: icp.buying_committee,
      rationale:        icp.rationale,
    })
  }

  // Persist angles
  if (angles.length > 0) {
    await sb.from('atelier_angles').insert(
      angles.map(a => ({
        session_id: input.sessionId,
        lens:       a.lens,
        headline:   a.headline,
        body_md:    a.body_md,
        evidence:   a.evidence,
      }))
    )
  }

  // Persist live signals — fetched_at = right now (web_search just ran)
  if (liveSignals.length > 0) {
    await sb.from('atelier_live_signals').insert(
      liveSignals.map(s => ({
        session_id:      input.sessionId,
        title:           s.title,
        snippet:         s.snippet,
        source_url:      s.source_url ?? null,
        source_label:    s.source_label,
        relevance_score: s.relevance_score,
        retrieved_via:   s.retrieved_via,
        data_fetched_at: nowIso,
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
    icp,
    angles,
    liveSignals,
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
