// FILE: src/app/atelier/icps/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// ICP-groepen tab — input form (request a new ICP) + clusters of all existing
// ICPs grouped by industry. Each ICP within a cluster is individually
// clickable (→ /atelier/icps/[id] for chat-refinement).

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import IcpRequestForm from '@/components/atelier/IcpRequestForm'

export const dynamic = 'force-dynamic'

interface IcpRow {
  id:               string
  session_id:       string | null
  request_keywords: string | null
  business_type:    string | null
  industry:         string | null
  role:             string | null
  company_size:     string | null
  triggers:         string[] | null
  jobs:             string[] | null
  pains:            string[] | null
  is_starter:       boolean | null
  archetype_label:  string | null
  created_at:       string
}

interface SessionStub { id: string; brand_name: string | null }

interface IcpCluster {
  industry: string
  rows:     IcpRow[]
}

function topUnique(arrs: (string[] | null | undefined)[], limit: number): string[] {
  const counts = new Map<string, number>()
  for (const arr of arrs) {
    for (const v of arr ?? []) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([v]) => v)
}

function originLabel(r: IcpRow): { label: string; tone: string } {
  if (r.is_starter)        return { label: 'Starter',  tone: 'bg-purple-100 text-purple-900' }
  if (r.request_keywords)  return { label: 'Aanvraag', tone: 'bg-emerald-100 text-emerald-900' }
  if (r.session_id)        return { label: 'Sessie',   tone: 'bg-sky-100 text-sky-900' }
  return                          { label: 'Onbekend', tone: 'bg-stone-100 text-stone-700' }
}

export default async function IcpsPage() {
  const sb = createServiceClient()

  const { data: icps } = await sb
    .from('atelier_icp_profiles')
    .select('id, session_id, request_keywords, business_type, industry, role, company_size, triggers, jobs, pains, is_starter, archetype_label, created_at')
    .order('created_at', { ascending: false })
    .limit(2000) as { data: IcpRow[] | null }

  const rows = icps ?? []

  // Group by industry (case-insensitive). 'Onbekend' for nulls.
  const groups = new Map<string, IcpCluster>()
  for (const r of rows) {
    const industry = (r.industry?.trim() || 'Onbekende industry')
    const key = industry.toLowerCase()
    let cluster = groups.get(key)
    if (!cluster) {
      cluster = { industry, rows: [] }
      groups.set(key, cluster)
    }
    cluster.rows.push(r)
  }
  const clusters = Array.from(groups.values()).sort((a, b) => b.rows.length - a.rows.length)

  // Pull brand_name for any session_ids
  const sessionIds = rows.map(r => r.session_id).filter((id): id is string => !!id)
  const { data: sessions } = sessionIds.length > 0
    ? await sb.from('atelier_sessions').select('id, brand_name').in('id', sessionIds) as { data: SessionStub[] | null }
    : { data: [] }
  const brandBySession = new Map((sessions ?? []).map(s => [s.id, s.brand_name]))

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">ICP-groepen</h1>
          <p className="text-slate-600">
            Genereer een nieuwe ICP via keywords en verfijn 'm in een chat. Onderaan: alle ICPs uit eerdere sessies + aanvragen + starter-ICPs, gegroepeerd per industry.
          </p>
        </header>

        {/* Input form */}
        <div className="mb-10">
          <IcpRequestForm />
        </div>

        {/* Clusters */}
        {clusters.length === 0 ? (
          <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center text-slate-500">
            Nog geen ICPs. Vraag er hierboven één aan.
          </div>
        ) : (
          <div className="space-y-4">
            {clusters.map(c => {
              const topRoles    = topUnique(c.rows.map(r => r.role ? [r.role] : []), 3)
              const topTriggers = topUnique(c.rows.map(r => r.triggers), 4)
              const topPains    = topUnique(c.rows.map(r => r.pains), 4)
              return (
                <section key={c.industry} className="rounded-2xl bg-white border border-stone-200 p-6">
                  <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
                    <h2 className="text-xl font-bold text-brand-dark">{c.industry}</h2>
                    <span className="text-xs text-slate-500">
                      {c.rows.length} {c.rows.length === 1 ? 'ICP' : 'ICPs'}
                    </span>
                  </div>

                  {/* Quick patterns row */}
                  <div className="grid md:grid-cols-3 gap-4 text-sm mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-1">Top rollen</p>
                      <p className="text-slate-700">{topRoles.join(' · ') || <em className="text-slate-400">geen</em>}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-1">Top triggers</p>
                      <p className="text-slate-700">{topTriggers.join(' · ') || <em className="text-slate-400">geen</em>}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-1">Top pijnpunten</p>
                      <p className="text-slate-700">{topPains.join(' · ') || <em className="text-slate-400">geen</em>}</p>
                    </div>
                  </div>

                  {/* Individual ICP rows */}
                  <div className="border-t border-stone-100 pt-4 space-y-2">
                    {c.rows.map(r => {
                      const origin = originLabel(r)
                      const brand  = r.session_id ? brandBySession.get(r.session_id) : null
                      const subtitle = r.request_keywords
                        ? `Keywords: "${r.request_keywords}"`
                        : r.archetype_label
                          ? r.archetype_label
                          : brand
                            ? `Sessie · ${brand}`
                            : 'Sessie'
                      return (
                        <Link
                          key={r.id}
                          href={`/atelier/icps/${r.id}`}
                          className="block rounded-lg px-4 py-3 hover:bg-stone-50 border border-stone-100 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-brand-dark">
                                  {r.role || <em className="text-slate-400">rol n.t.b.</em>}
                                </span>
                                {r.business_type && (
                                  <span className="text-[10px] font-bold uppercase tracking-widest bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                                    {r.business_type}
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${origin.tone}`}>
                                  {origin.label}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
                            </div>
                            <span className="text-xs text-brand-accent font-semibold whitespace-nowrap">
                              Open →
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        <p className="text-xs text-slate-500 mt-6">
          {clusters.length} {clusters.length === 1 ? 'cluster' : 'clusters'} · {rows.length} ICP-profielen geladen (max 2.000).
        </p>
      </div>
    </div>
  )
}
