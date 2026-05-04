// FILE: src/app/atelier/session/[id]/page.tsx
// Session view — shows the full bundle: JTBD, references, two-track audience,
// directional routes, final one-pager. Each block surfaces provenance.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import QaChat from '@/components/atelier/QaChat'
import SessionAutoRefresh from '@/components/atelier/SessionAutoRefresh'
import RefreshDataBanner from '@/components/atelier/RefreshDataBanner'

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
  data_fetched_at: string | null;
}
interface AudienceSignalRow {
  id: string; track: string; claim: string; evidence: string | null;
  source_label: string; source_url: string | null; confidence: string;
  data_fetched_at: string | null;
}
interface DirectionRow {
  id: string; position: number; tension: string; route: string; rationale: string | null;
}
interface OutputRow { id: string; format: string; language: string; body_md: string }
interface ModuleRunRow {
  module: string; status: string; model: string | null; latency_ms: number | null;
  cost_cents: number | null; error_message: string | null;
}
interface IcpRow {
  industry: string | null; role: string | null; company_size: string | null;
  triggers: string[] | null; jobs: string[] | null; pains: string[] | null;
  buying_committee: Array<{ role: string; influence: string; motivation?: string }> | null;
  rationale: string | null;
}
interface AngleRow {
  lens: string; headline: string; body_md: string;
  evidence: Array<{ claim: string; source_label: string; source_url?: string | null }> | null;
}
interface LiveSignalRow {
  title: string; snippet: string | null; source_url: string | null;
  source_label: string | null; relevance_score: number | null; retrieved_via: string;
  data_fetched_at: string | null;
}
interface QaTurnRow { question: string; answer: string; created_at: string }

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

  const [briefRes, refsRes, signalsRes, dirsRes, outRes, runsRes, icpRes, anglesRes, liveRes, qaRes] = await Promise.all([
    sb.from('atelier_briefs').select('raw_text, brand_context').eq('session_id', id).maybeSingle(),
    sb.from('atelier_references').select('id, title, description, source_kind, source_label, source_url, relevance_score, taste_note, data_fetched_at').eq('session_id', id).order('position'),
    sb.from('atelier_audience_signals').select('id, track, claim, evidence, source_label, source_url, confidence, data_fetched_at').eq('session_id', id),
    sb.from('atelier_directions').select('id, position, tension, route, rationale').eq('session_id', id).order('position'),
    sb.from('atelier_outputs').select('id, format, language, body_md').eq('session_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    sb.from('atelier_module_runs').select('module, status, model, latency_ms, cost_cents, error_message').eq('session_id', id).order('started_at'),
    sb.from('atelier_icp_profiles').select('industry, role, company_size, triggers, jobs, pains, buying_committee, rationale').eq('session_id', id).maybeSingle(),
    sb.from('atelier_angles').select('lens, headline, body_md, evidence').eq('session_id', id),
    sb.from('atelier_live_signals').select('title, snippet, source_url, source_label, relevance_score, retrieved_via, data_fetched_at').eq('session_id', id),
    sb.from('atelier_qa_turns').select('question, answer, created_at').eq('session_id', id).order('created_at'),
  ])

  const brief         = briefRes.data as BriefRow | null
  const references   = (refsRes.data    ?? []) as ReferenceRow[]
  const signals      = (signalsRes.data ?? []) as AudienceSignalRow[]
  const directions   = (dirsRes.data    ?? []) as DirectionRow[]
  const onePager     = outRes.data as OutputRow | null
  const moduleRuns   = (runsRes.data ?? []) as ModuleRunRow[]
  const icp          = icpRes.data as IcpRow | null
  const angles       = (anglesRes.data ?? []) as AngleRow[]
  const liveSignals  = (liveRes.data   ?? []) as LiveSignalRow[]
  const qaTurns      = (qaRes.data     ?? []) as QaTurnRow[]

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

  // Find the oldest data fetched moment across all external-source rows for
  // the refresh banner. References + audience + live signals all carry it.
  const allFetched = [
    ...references.map(r => r.data_fetched_at),
    ...signals.map(s => s.data_fetched_at),
    ...liveSignals.map(l => l.data_fetched_at),
  ].filter((t): t is string => !!t)
  const oldestFetchedAt = allFetched.length > 0
    ? allFetched.sort()[0]
    : null

  function fetchedLabel(iso: string | null): string {
    if (!iso) return ''
    const ageMs = Date.now() - new Date(iso).getTime()
    const ageHours = ageMs / (1000 * 60 * 60)
    if (ageHours < 1) return 'opgehaald < 1 u geleden'
    if (ageHours < 24) return `opgehaald ${Math.round(ageHours)} u geleden`
    const days = Math.round(ageHours / 24)
    return `opgehaald ${days} dag${days === 1 ? '' : 'en'} geleden`
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <Link href="/atelier" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-accent mb-6">
          ← Atelier
        </Link>

        {/* Auto-refresh while orchestrator runs in background */}
        {(session.status === 'running' || session.status === 'open') && (
          <SessionAutoRefresh runsCount={moduleRuns.length} />
        )}

        {/* Refresh-data banner — alleen voor completed sessies met externe bronnen */}
        {session.status === 'completed' && oldestFetchedAt && (
          <RefreshDataBanner sessionId={id} oldestFetchedAt={oldestFetchedAt} />
        )}

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
                    {r.data_fetched_at && (
                      <>
                        <span className="mx-2">·</span>
                        <span>{fetchedLabel(r.data_fetched_at)}</span>
                      </>
                    )}
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
                          · {s.source_url
                              ? <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">{s.source_label} ↗</a>
                              : s.source_label}
                          {s.data_fetched_at && (
                            <span className="block text-[11px] text-slate-400 mt-0.5">{fetchedLabel(s.data_fetched_at)}</span>
                          )}
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
                          · {s.source_url
                              ? <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">{s.source_label} ↗</a>
                              : s.source_label}
                          {s.data_fetched_at && (
                            <span className="block text-[11px] text-slate-400 mt-0.5">{fetchedLabel(s.data_fetched_at)}</span>
                          )}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ICP block */}
        {icp && (
          <section className="mb-10">
            <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase mb-4">Ideal Customer Profile</h2>
            <div className="rounded-2xl bg-white border border-slate-200 p-6">
              <div className="grid sm:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Industry</p>
                  <p className="font-semibold text-brand-dark">{icp.industry || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Rol</p>
                  <p className="font-semibold text-brand-dark">{icp.role || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Bedrijfsgrootte</p>
                  <p className="font-semibold text-brand-dark">{icp.company_size || '—'}</p>
                </div>
              </div>

              {icp.triggers && icp.triggers.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Triggers</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {icp.triggers.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}

              {icp.jobs && icp.jobs.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Jobs</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {icp.jobs.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}

              {icp.pains && icp.pains.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Pains</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {icp.pains.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}

              {icp.buying_committee && icp.buying_committee.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Buying committee</p>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {icp.buying_committee.map((m, i) => (
                      <li key={i}>
                        <strong className="text-brand-dark">{m.role}</strong>
                        <span className="text-xs text-slate-500 ml-2">[{m.influence}]</span>
                        {m.motivation && <span className="text-slate-600"> — {m.motivation}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {icp.rationale && (
                <p className="text-xs text-slate-500 italic border-t border-slate-200 pt-3 mt-3">{icp.rationale}</p>
              )}
            </div>
          </section>
        )}

        {/* Angles — 3 lenses */}
        {angles.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase mb-4">Andere invalshoeken</h2>
            <div className="space-y-4">
              {angles.map(a => {
                const lensLabel: Record<string, string> = {
                  brand_archetype:  'Brand archetype',
                  competitor:       'Concurrentie & whitespace',
                  cultural_moment:  'Cultureel moment',
                }
                return (
                  <div key={a.lens} className="rounded-2xl bg-white border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full">
                        {lensLabel[a.lens] ?? a.lens}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-brand-dark mb-3 leading-snug">{a.headline}</h3>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {a.body_md}
                    </div>
                    {a.evidence && a.evidence.length > 0 && (
                      <ul className="mt-4 pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-500">
                        {a.evidence.map((e, i) => (
                          <li key={i}>
                            <span className="text-slate-700">{e.claim}</span>
                            <span className="text-slate-400"> — {e.source_label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Live signals */}
        {liveSignals.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase mb-4">
              Live signalen
              <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-slate-500">
                {liveSignals.every(s => s.retrieved_via === 'inferred_fallback')
                  ? '(web-search niet beschikbaar — alleen inferred)'
                  : '(web-search)'}
              </span>
            </h2>
            <ul className="space-y-3">
              {liveSignals.map((s, i) => (
                <li key={i} className="rounded-2xl bg-white border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-brand-dark">{s.title}</h3>
                    {s.relevance_score != null && (
                      <span className="text-xs font-mono text-slate-500 shrink-0">
                        {(Number(s.relevance_score) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  {s.snippet && <p className="text-sm text-slate-700 mb-2">{s.snippet}</p>}
                  <p className="text-xs text-slate-500">
                    {s.source_url ? (
                      <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">
                        {s.source_label} ↗
                      </a>
                    ) : s.source_label}
                    <span className="mx-2">·</span>
                    <span className={`font-mono ${s.retrieved_via === 'inferred_fallback' ? 'text-amber-700' : ''}`}>
                      {s.retrieved_via}
                    </span>
                    {s.data_fetched_at && (
                      <>
                        <span className="mx-2">·</span>
                        <span>{fetchedLabel(s.data_fetched_at)}</span>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
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

        {/* Q&A chat — only show when session has at least JTBD ready */}
        {session.status === 'completed' && (
          <QaChat sessionId={id} initialHistory={qaTurns.map(t => ({ question: t.question, answer: t.answer, created_at: t.created_at }))} />
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
