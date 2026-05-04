export const dynamic = 'force-dynamic'
export const maxDuration = 180

// FILE: src/app/api/atelier/session/[id]/refresh/route.ts
// POST — refresh ONLY the data-driven modules for a session (audience,
// live_signal, CBS). Reference module re-runs too because it cycles
// through the corpus. Tension/output stay as-is unless explicitly re-run.
//
// Use case: session is some days old, user wants live signals + audience
// data refreshed without redoing the full pipeline.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { waitUntil } from '@vercel/functions'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { runAudienceEvidence } from '@/lib/atelier/modules/audience'
import { runLiveSignals } from '@/lib/atelier/modules/live-signal'
import { enrichWithCbs } from '@/lib/atelier/sources/cbs'
import type { JtbdParse } from '@/lib/atelier/schemas'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`atelier-refresh:${ip}`, 10, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel refreshes deze uur.' }, { status: 429 })
  }

  const { id: sessionId } = await params

  // Load JTBD from latest brief_jtbd run
  const { data: jtbdRow } = await sb
    .from('atelier_module_runs')
    .select('output_payload')
    .eq('session_id', sessionId)
    .eq('module', 'brief_jtbd')
    .eq('status', 'ok')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const jtbd = jtbdRow?.output_payload as JtbdParse | null
  if (!jtbd) {
    return NextResponse.json({ error: 'Sessie heeft nog geen JTBD — kan niet refreshen.' }, { status: 400 })
  }

  const { data: brief } = await sb
    .from('atelier_briefs')
    .select('brand_context')
    .eq('session_id', sessionId)
    .maybeSingle()

  const brandContext = (brief as { brand_context: string | null } | null)?.brand_context ?? undefined

  // Mark session as running for the auto-refresh banner
  await sb.from('atelier_sessions')
    .update({ status: 'running', updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  // Kick off refresh in background. Delete old data-driven rows first so the
  // session shows the freshly fetched data; older audience signals from the
  // initial run get replaced.
  waitUntil((async () => {
    try {
      await Promise.all([
        sb.from('atelier_audience_signals').delete().eq('session_id', sessionId),
        sb.from('atelier_live_signals').delete().eq('session_id', sessionId),
      ])

      const [audienceRes, liveRes, cbsRes] = await Promise.allSettled([
        runAudienceEvidence(sessionId, jtbd, brandContext),
        runLiveSignals({ sessionId, jtbd }),
        enrichWithCbs({
          sessionId,
          jtbdDutch: jtbd.jtbd_dutch,
          briefSummary: jtbd.brief_summary,
        }),
      ])

      const nowIso = new Date().toISOString()

      // Persist audience (LLM-derived) + CBS (pre-shaped) signals
      const audienceSignals = audienceRes.status === 'fulfilled' ? audienceRes.value.signals : []
      const cbsResult = cbsRes.status === 'fulfilled' ? cbsRes.value : { signals: [], fetched_at: nowIso }

      const allSignals = [
        ...cbsResult.signals,
        ...audienceSignals,
      ]
      const cbsClaimSet = new Set(cbsResult.signals.map(c => c.claim))
      const cbsFetchedAt = cbsResult.fetched_at

      if (allSignals.length > 0) {
        await sb.from('atelier_audience_signals').insert(
          allSignals.map(s => ({
            session_id:      sessionId,
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

      const liveSignals = liveRes.status === 'fulfilled' ? liveRes.value : []
      if (liveSignals.length > 0) {
        await sb.from('atelier_live_signals').insert(
          liveSignals.map(s => ({
            session_id:      sessionId,
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

      await sb.from('atelier_sessions')
        .update({ status: 'completed', updated_at: nowIso })
        .eq('id', sessionId)
    } catch (err) {
      console.error('[atelier/refresh]', err)
      await sb.from('atelier_sessions')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', sessionId)
    }
  })())

  return NextResponse.json({ status: 'refreshing' }, { status: 202 })
}
