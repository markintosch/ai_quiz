// FILE: src/app/atelier/icps/[id]/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// ICP detail page. Top: ICP card with all typed columns. Bottom: chat
// refinement panel — questions update the row in place.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import IcpRefineChat from '@/components/atelier/IcpRefineChat'

export const dynamic = 'force-dynamic'

interface IcpRow {
  id:                 string
  session_id:         string | null
  request_keywords:   string | null
  business_type:      string | null
  industry:           string | null
  role:               string | null
  company_size:       string | null
  triggers:           string[] | null
  jobs:               string[] | null
  pains:              string[] | null
  buying_committee:   Array<{ role: string; influence: string; motivation?: string }> | null
  rationale:          string | null
  is_starter:         boolean | null
  archetype_label:    string | null
  refinement_history: Array<{ question: string; answer: string; refined_at: string }> | null
  created_at:         string
}

const INFLUENCE_TONE: Record<string, string> = {
  decision_maker: 'bg-rose-100 text-rose-900',
  champion:       'bg-amber-100 text-amber-900',
  evaluator:      'bg-sky-100 text-sky-900',
  gatekeeper:     'bg-slate-100 text-slate-700',
  end_user:       'bg-emerald-100 text-emerald-900',
}

function originLine(r: IcpRow): string {
  if (r.is_starter)       return r.archetype_label ? `Starter · ${r.archetype_label}` : 'Starter ICP'
  if (r.request_keywords) return `Aanvraag · keywords: "${r.request_keywords}"`
  if (r.session_id)       return `Sessie-ICP · session ${r.session_id.slice(0, 8)}`
  return                         'ICP zonder duidelijke herkomst'
}

export default async function IcpDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()

  const { data: icp } = await sb
    .from('atelier_icp_profiles')
    .select('id, session_id, request_keywords, business_type, industry, role, company_size, triggers, jobs, pains, buying_committee, rationale, is_starter, archetype_label, refinement_history, created_at')
    .eq('id', id)
    .maybeSingle() as { data: IcpRow | null }

  if (!icp) notFound()

  const triggers   = icp.triggers ?? []
  const jobs       = icp.jobs ?? []
  const pains      = icp.pains ?? []
  const committee  = icp.buying_committee ?? []
  const history    = icp.refinement_history ?? []

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <Link href="/atelier/icps" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-accent">
          ← Alle ICPs
        </Link>

        {/* Header card */}
        <header className="rounded-2xl bg-white border border-stone-200 p-6">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">{originLine(icp)}</p>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            {icp.role || <em className="text-slate-400">Rol n.t.b.</em>}
          </h1>
          <div className="flex flex-wrap gap-2 text-xs">
            {icp.business_type && (
              <span className="font-bold uppercase tracking-widest bg-stone-100 text-stone-700 px-2 py-1 rounded">
                {icp.business_type}
              </span>
            )}
            {icp.industry && (
              <span className="bg-amber-50 border border-amber-200 text-amber-900 px-2 py-1 rounded">
                {icp.industry}
              </span>
            )}
            {icp.company_size && (
              <span className="bg-sky-50 border border-sky-200 text-sky-900 px-2 py-1 rounded">
                {icp.company_size}
              </span>
            )}
          </div>
          {icp.rationale && (
            <p className="mt-4 text-sm text-slate-700 leading-relaxed italic">
              {icp.rationale}
            </p>
          )}
          {history.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              {history.length} {history.length === 1 ? 'refinement' : 'refinements'} toegepast
            </p>
          )}
        </header>

        {/* Triggers / jobs / pains */}
        <section className="rounded-2xl bg-white border border-stone-200 p-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Triggers</h3>
              {triggers.length === 0 ? (
                <p className="text-slate-400 italic text-xs">geen</p>
              ) : (
                <ul className="space-y-1.5 list-disc pl-5 text-slate-700">
                  {triggers.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Jobs-to-be-done</h3>
              {jobs.length === 0 ? (
                <p className="text-slate-400 italic text-xs">geen</p>
              ) : (
                <ul className="space-y-1.5 list-disc pl-5 text-slate-700">
                  {jobs.map((j, i) => <li key={i}>{j}</li>)}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Pijnpunten</h3>
              {pains.length === 0 ? (
                <p className="text-slate-400 italic text-xs">geen</p>
              ) : (
                <ul className="space-y-1.5 list-disc pl-5 text-slate-700">
                  {pains.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Buying committee */}
        {committee.length > 0 && (
          <section className="rounded-2xl bg-white border border-stone-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Buying committee</h3>
            <ul className="space-y-2 text-sm">
              {committee.map((m, i) => {
                const tone = INFLUENCE_TONE[m.influence] ?? 'bg-stone-100 text-stone-700'
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded whitespace-nowrap ${tone}`}>
                      {m.influence.replace('_', ' ')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-dark">{m.role}</p>
                      {m.motivation && <p className="text-slate-600 text-xs mt-0.5">{m.motivation}</p>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Refinement chat */}
        <IcpRefineChat icpId={icp.id} initialHistory={history} />
      </div>
    </div>
  )
}
