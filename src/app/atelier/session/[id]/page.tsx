// FILE: src/app/atelier/session/[id]/page.tsx
// Session view — shows the full bundle: JTBD, references, two-track audience,
// directional routes, final one-pager. Each block surfaces provenance.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

interface SessionRow {
  id:            string
  status:       string
  language:     string
  brand_name:   string | null
  jtbd_summary: string | null
  has_one_pager: boolean
  total_cost_cents: number
  created_at:   string
}

interface BriefRow { raw_text: string; brand_context: string | null }
interface ReferenceRow {
  id: string; title: string; description: string; source_kind: string;
  source_label: string; source_url: string | null; relevance_score: number; taste_note: string;
}
interface AudienceSignalRow {
  id: string; track: string; claim: string; evidence: string | null;
  source_label: string; source_url: string | null; confidence: string;
}
interface DirectionRow {
  id: string; position: number; tension: string; route: string; rationale: string | null;
}
interface OutputRow { id: string; format: string; language: string; body_md: string }
interface ModuleRunRow {
  module: string; status: string; model: string | null; latency_ms: number | null;
  cost_cents: number | null; error_message: string | null;
}

interface JtbdRunOutput {
  jtbd_dutch?: string
  jtbd?: string
  brief_summary?: string
  hidden_assumptions?: { text: string; confidence: string; evidence?: string }[]
  missing_pieces?: string[]
}

export default async function AtelierSessionPage({ params }: PageProps) {
  const { id } = await params
  const sb = createServiceClient()

  const { data: session } = await sb
    .from('atelier_sessions')
    .select('id, status, language, brand_name, jtbd_summary, has_one_pager, total_cost_cents, created_at')
    .eq('id', id)
    .single() as { data: SessionRow | null }
  if (!session) notFound()

  const [briefRes, refsRes, signalsRes, dirsRes, outRes, runsRes] = await Promise.all([
    sb.from('atelier_briefs').select('raw_text, brand_context').eq('session_id', id).maybeSingle(),
    sb.from('atelier_references').select('id, title, description, source_kind, source_label, source_url, relevance_score, taste_note').eq('session_id', id).order('position'),
    sb.from('atelier_audience_signals').select('id, track, claim, evidence, source_label, source_url, confidence').eq('session_id', id),
    sb.from('atelier_directions').select('id, position, tension, route, rationale').eq('session_id', id).order('position'),
    sb.from('atelier_outputs').select('id, format, language, body_md').eq('session_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    sb.from('atelier_module_runs').select('module, status, model, latency_ms, cost_cents, error_message').eq('session_id', id).order('started_at'),
  ])

  const brief         = briefRes.data as BriefRow | null
  const references   = (refsRes.data    ?? []) as ReferenceRow[]
  const signals      = (signalsRes.data ?? []) as AudienceSignalRow[]
  const directions   = (dirsRes.data    ?? []) as DirectionRow[]
  const onePager     = outRes.data as OutputRow | null
  const moduleRuns   = (runsRes.data ?? []) as ModuleRunRow[]

  // Pull the JTBD from the latest brief_jtbd run (it was persisted there)
  const jtbdRun = moduleRuns.find(r => r.module === 'brief_jtbd' && r.status === 'ok')

  let jtbd: JtbdRunOutput | null = null
  if (jtbdRun) {
    const { data: jtbdRow } = await sb
      .from('atelier_module_runs')
      .select('output_payload')
      .eq('module', 'brief_jtbd')
      .eq('session_id', id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()
    jtbd = (jtbdRow as { output_payload: JtbdRunOutput } | null)?.output_payload ?? null
  }

  const street = signals.filter(s => s.track === 'street')
  const ground = signals.filter(s => s.track === 'ground')

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <Link href="/atelier" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-accent mb-6">
          ← Atelier
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
              session.status === 'completed' ? 'bg-green-100 text-green-900' :
              session.status === 'running' ? 'bg-amber-100 text-amber-900' :
              session.status === 'failed' ? 'bg-red-100 text-red-900' :
              'bg-slate-100 text-slate-800'
            }`}>{session.status}</span>
            {session.brand_name && <span className="text-sm text-slate-600">{session.brand_name}</span>}
            <span className="text-xs text-slate-500 ml-auto">
              €{(session.total_cost_cents / 100).toFixed(3)} · {moduleRuns.length} runs
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark leading-tight">
            {session.jtbd_summary ?? 'Atelier sessie'}
          </h1>
        </header>

        {/* JTBD block */}
        {jtbd && (
          <section className="mb-10 rounded-2xl bg-white border border-slate-200 p-6">
            <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase mb-3">Job-to-be-done</h2>
            <p className="text-lg text-brand-dark font-semibold mb-4">{jtbd.jtbd_dutch ?? jtbd.jtbd}</p>

            {jtbd.hidden_assumptions && jtbd.hidden_assumptions.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Verborgen aannames</p>
                <ul className="space-y-2 text-sm">
                  {jtbd.hidden_assumptions.map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <span className={`shrink-0 text-xs font-bold uppercase px-1.5 py-0.5 rounded ${
                        a.confidence === 'high' ? 'bg-red-100 text-red-800' :
                        a.confidence === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>{a.confidence}</span>
                      <span className="text-slate-700">{a.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {jtbd.missing_pieces && jtbd.missing_pieces.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Wat ontbreekt in de brief</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                  {jtbd.missing_pieces.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* References block */}
        {references.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase mb-4">Referenties</h2>
            <div className="space-y-3">
              {references.map(r => (
                <div key={r.id} className="rounded-2xl bg-white border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-brand-dark">{r.title}</h3>
                    <span className="text-xs font-mono text-slate-500 shrink-0">{(r.relevance_score * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-sm text-slate-700 italic mb-2">{r.taste_note}</p>
                  <p className="text-xs text-slate-500">
                    {r.source_url ? <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">{r.source_label} ↗</a> : r.source_label}
                    <span className="mx-2">·</span>
                    <span className="font-mono">{r.source_kind}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Audience block — two tracks */}
        {(street.length > 0 || ground.length > 0) && (
          <section className="mb-10">
            <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase mb-4">Audience picture</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-brand-dark mb-3">Street Signal</h3>
                {street.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Geen.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {street.map(s => (
                      <li key={s.id}>
                        <p className="text-slate-800">{s.claim}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className={`font-mono mr-2 ${s.confidence === 'inferred' ? 'text-amber-700' : ''}`}>{s.confidence}</span>
                          · {s.source_label}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-brand-dark mb-3">Ground Truth</h3>
                {ground.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Geen.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {ground.map(s => (
                      <li key={s.id}>
                        <p className="text-slate-800">{s.claim}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className={`font-mono mr-2 ${s.confidence === 'inferred' ? 'text-amber-700' : ''}`}>{s.confidence}</span>
                          · {s.source_label}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Directions */}
        {directions.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase mb-4">Directional routes</h2>
            <div className="space-y-4">
              {directions.map(d => (
                <div key={d.id} className="rounded-2xl bg-brand-dark text-white p-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">Route {d.position}</div>
                  <p className="text-sm text-white/70 mb-2"><strong>Tension:</strong> {d.tension}</p>
                  <p className="text-lg font-semibold mb-3 text-white">{d.route}</p>
                  {d.rationale && <p className="text-sm text-white/80">{d.rationale}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* One-pager */}
        {onePager && (
          <section className="mb-10">
            <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase mb-4">One-pager (markdown)</h2>
            <div className="rounded-2xl bg-stone-100 border border-slate-200 p-6 font-mono text-sm whitespace-pre-wrap text-slate-800">
              {onePager.body_md}
            </div>
          </section>
        )}

        {/* Brief + module runs (debug) */}
        {brief && (
          <details className="mb-6">
            <summary className="cursor-pointer text-xs font-semibold text-slate-600 uppercase tracking-wider">Originele brief</summary>
            <div className="mt-3 rounded-xl bg-white border border-slate-200 p-4 text-xs font-mono whitespace-pre-wrap text-slate-700">
              {brief.raw_text}
              {brief.brand_context && (
                <>
                  <hr className="my-3 border-slate-200" />
                  <strong>Brand context:</strong>
                  {'\n'}{brief.brand_context}
                </>
              )}
            </div>
          </details>
        )}

        <details>
          <summary className="cursor-pointer text-xs font-semibold text-slate-600 uppercase tracking-wider">Module runs · debug</summary>
          <table className="mt-3 w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1 px-2">Module</th>
                <th className="py-1 px-2">Status</th>
                <th className="py-1 px-2">Model</th>
                <th className="py-1 px-2">Latency</th>
                <th className="py-1 px-2">Cost</th>
                <th className="py-1 px-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {moduleRuns.map((r, i) => (
                <tr key={i} className="border-t border-slate-200">
                  <td className="py-1 px-2 font-mono">{r.module}</td>
                  <td className={`py-1 px-2 font-mono ${r.status === 'failed' ? 'text-red-700' : ''}`}>{r.status}</td>
                  <td className="py-1 px-2 text-slate-600">{r.model ?? '—'}</td>
                  <td className="py-1 px-2 text-slate-600">{r.latency_ms ? `${r.latency_ms}ms` : '—'}</td>
                  <td className="py-1 px-2 text-slate-600">{r.cost_cents != null ? `€${(r.cost_cents/100).toFixed(4)}` : '—'}</td>
                  <td className="py-1 px-2 text-red-700 truncate max-w-xs">{r.error_message ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>

      </div>
    </div>
  )
}
