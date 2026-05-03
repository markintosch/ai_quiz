// FILE: src/app/admin/atelier/sources/page.tsx
// Sources registry — laat zien waar Atelier zijn inzichten uit haalt en
// laat Mark nieuwe bronnen toevoegen (referenties / Street feeds / Ground
// research / web providers).

import { createServiceClient } from '@/lib/supabase/server'
import AddSourceForm from '@/components/admin/AddSourceForm'
import SourceRowActions from '@/components/admin/SourceRowActions'

export const dynamic = 'force-dynamic'

interface SourceRow {
  id:          string
  category:    'reference' | 'street_signal' | 'ground_truth' | 'web' | 'inferred'
  name:        string
  description: string | null
  url:         string | null
  metadata:    Record<string, unknown> | null
  active:      boolean
  added_by:    string | null
  notes:       string | null
  created_at:  string
}

interface ReferenceProvenanceRow { source_kind: string }
interface LiveSignalProvenanceRow { retrieved_via: string }

const CATEGORY_META: Record<SourceRow['category'], { label: string; description: string; color: string; bg: string }> = {
  reference: {
    label: 'Reference archive',
    description: 'Curated creative references (cases, campaigns, craft work). Module 2 trekt hieruit + Claude kiest met taste-note.',
    color: 'text-amber-900', bg: 'bg-amber-50 border-amber-200',
  },
  street_signal: {
    label: 'Street Signal',
    description: 'Live, observeerbare feeds — social listening, brand-mention, gedrag-data. Voedt Module 3 (audience) Street-track.',
    color: 'text-rose-900', bg: 'bg-rose-50 border-rose-200',
  },
  ground_truth: {
    label: 'Ground Truth',
    description: 'Onderzoek, segmentaties, surveys, harde data. Voedt Module 3 Ground-track.',
    color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200',
  },
  web: {
    label: 'Web search',
    description: 'Live web-search providers. Module live_signal probeert deze; valt terug op inferred als niet beschikbaar.',
    color: 'text-purple-900', bg: 'bg-purple-50 border-purple-200',
  },
  inferred: {
    label: 'Inferred (model knowledge)',
    description: 'Claude-knowledge fallback. Altijd aanwezig als laatste optie; UI markeert deze altijd duidelijk als "inferred".',
    color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200',
  },
}

export default async function AdminAtelierSourcesPage() {
  const sb = createServiceClient()

  const [sourcesRes, refsProvRes, liveProvRes, audienceProvRes] = await Promise.all([
    sb.from('atelier_sources')
      .select('id, category, name, description, url, metadata, active, added_by, notes, created_at')
      .order('category')
      .order('created_at', { ascending: false }),
    sb.from('atelier_references').select('source_kind'),
    sb.from('atelier_live_signals').select('retrieved_via'),
    sb.from('atelier_audience_signals').select('confidence'),
  ])

  const sources = (sourcesRes.data ?? []) as SourceRow[]
  const refsProv = (refsProvRes.data ?? []) as ReferenceProvenanceRow[]
  const liveProv = (liveProvRes.data ?? []) as LiveSignalProvenanceRow[]
  const audienceProv = (audienceProvRes.data ?? []) as { confidence: string }[]

  // Provenance breakdown: hoeveel keer heeft elke bron-categorie zichzelf
  // bewezen in écht gegenereerde output?
  const refsBy: Record<string, number> = {}
  for (const r of refsProv) refsBy[r.source_kind] = (refsBy[r.source_kind] ?? 0) + 1
  const liveBy: Record<string, number> = {}
  for (const r of liveProv) liveBy[r.retrieved_via] = (liveBy[r.retrieved_via] ?? 0) + 1
  const audienceBy: Record<string, number> = {}
  for (const r of audienceProv) audienceBy[r.confidence] = (audienceBy[r.confidence] ?? 0) + 1

  const grouped: Record<SourceRow['category'], SourceRow[]> = {
    reference: [], street_signal: [], ground_truth: [], web: [], inferred: [],
  }
  for (const s of sources) grouped[s.category].push(s)

  const categories: SourceRow['category'][] = ['reference', 'street_signal', 'ground_truth', 'web', 'inferred']

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark">Atelier — sources registry</h1>
        <p className="text-sm text-gray-600 mt-1">
          Waar haalt Atelier zijn inzichten uit. Per categorie geregistreerde bronnen + provenance-breakdown van wat er
          écht in resultaten landt. Bronnen toevoegen kan onderaan elke categorie.
        </p>
      </div>

      {/* ── Provenance overview (real usage, not registry) ── */}
      <section className="mb-10 grid md:grid-cols-3 gap-4">
        <ProvenanceCard
          title="Referenties"
          subtitle="Per source_kind (Module 2 output)"
          buckets={refsBy}
          color="amber"
        />
        <ProvenanceCard
          title="Audience signals"
          subtitle="Per confidence-niveau (Module 3 output)"
          buckets={audienceBy}
          color="rose"
        />
        <ProvenanceCard
          title="Live signals"
          subtitle="Per retrieved_via (Module live_signal)"
          buckets={liveBy}
          color="purple"
        />
      </section>

      {/* ── Add source form (top-level, voor alle categorieën) ── */}
      <section className="mb-10">
        <AddSourceForm />
      </section>

      {/* ── Sources per categorie ── */}
      <section className="space-y-6">
        {categories.map(cat => {
          const meta = CATEGORY_META[cat]
          const items = grouped[cat]
          return (
            <div key={cat} className={`rounded-2xl border ${meta.bg} overflow-hidden`}>
              <header className="px-5 py-3 border-b border-gray-200/60">
                <h2 className={`font-semibold ${meta.color}`}>
                  {meta.label}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    {items.length} {items.length === 1 ? 'bron' : 'bronnen'}
                  </span>
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">{meta.description}</p>
              </header>

              {items.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-gray-500 italic">
                    Nog geen bronnen in deze categorie — voeg er hierboven één toe.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200/60">
                  {items.map(s => {
                    const isSystem = s.added_by === 'system'
                    return (
                      <li key={s.id} className="px-5 py-3 grid lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-brand-dark">{s.name}</span>
                            {isSystem && <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">system</span>}
                            {!s.active && <span className="text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-800 px-1.5 py-0.5 rounded">inactive</span>}
                          </div>
                          {s.description && <p className="text-xs text-gray-600 mt-1">{s.description}</p>}
                          {s.url && (
                            <a href={s.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-brand-accent hover:underline mt-1 inline-block">
                              {s.url} ↗
                            </a>
                          )}
                        </div>
                        <div className="lg:col-span-5 text-xs text-gray-700 space-y-1">
                          {s.metadata && Object.keys(s.metadata).length > 0 && (
                            <div className="text-[11px] font-mono text-gray-500">
                              {Object.entries(s.metadata).map(([k, v]) => (
                                <div key={k}>
                                  <span className="text-gray-400">{k}:</span> {String(v)}
                                </div>
                              ))}
                            </div>
                          )}
                          {s.notes && (
                            <p className="text-xs italic text-gray-600">📝 {s.notes}</p>
                          )}
                          <p className="text-[11px] text-gray-400 pt-1">
                            toegevoegd door {s.added_by ?? '—'} · {new Date(s.created_at).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                        <div className="lg:col-span-2">
                          <SourceRowActions sourceId={s.id} active={s.active} isSystem={isSystem} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}

function ProvenanceCard({ title, subtitle, buckets, color }: {
  title: string; subtitle: string;
  buckets: Record<string, number>;
  color: 'amber' | 'rose' | 'purple'
}) {
  const items = Object.entries(buckets).sort((a, b) => b[1] - a[1])
  const total = items.reduce((a, [, v]) => a + v, 0)
  const accent: Record<string, string> = {
    amber:  'bg-amber-500',
    rose:   'bg-rose-500',
    purple: 'bg-purple-500',
  }
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700">{title}</h3>
      <p className="text-[11px] text-gray-500 mb-3">{subtitle}</p>
      {items.length === 0 ? (
        <p className="text-xs text-gray-500 italic">Nog niets geregistreerd.</p>
      ) : (
        <ul className="space-y-2">
          {items.map(([k, v]) => {
            const pct = total > 0 ? Math.round((v / total) * 100) : 0
            return (
              <li key={k}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-gray-700">{k}</span>
                  <span className="text-xs text-gray-500 font-mono shrink-0">{v} · {pct}%</span>
                </div>
                <div className="h-1.5 mt-1 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full ${accent[color]}`} style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
