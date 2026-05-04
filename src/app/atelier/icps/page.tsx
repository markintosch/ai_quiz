// FILE: src/app/atelier/icps/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// ICP-groepen tab — clusters all atelier_icp_profiles by industry + role.
// Per cluster: count, example triggers + jobs + pains. Quick scan of which
// audience patterns we keep encountering across sessions.

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface IcpRow {
  id:           string
  session_id:   string
  industry:     string | null
  role:         string | null
  company_size: string | null
  triggers:     string[] | null
  jobs:         string[] | null
  pains:        string[] | null
}

interface SessionStub {
  id:         string
  brand_name: string | null
  created_at: string
}

interface IcpCluster {
  industry:     string
  count:        number
  roles:        Map<string, number>
  triggers:     Map<string, number>
  pains:        Map<string, number>
  exampleSessionIds: string[]
}

function topN(map: Map<string, number>, n: number): { label: string; count: number }[] {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }))
}

export default async function IcpsPage() {
  const sb = createServiceClient()

  const { data: icps } = await sb
    .from('atelier_icp_profiles')
    .select('id, session_id, industry, role, company_size, triggers, jobs, pains')
    .limit(2000) as { data: IcpRow[] | null }

  const rows = icps ?? []

  // Group by industry (case-insensitive). 'unspecified' bucket for nulls.
  const groups = new Map<string, IcpCluster>()
  for (const r of rows) {
    const industryKey = (r.industry?.trim() || 'Onbekende industry')
    const key = industryKey.toLowerCase()
    let cluster = groups.get(key)
    if (!cluster) {
      cluster = {
        industry: industryKey,
        count: 0,
        roles: new Map(),
        triggers: new Map(),
        pains: new Map(),
        exampleSessionIds: [],
      }
      groups.set(key, cluster)
    }
    cluster.count += 1
    if (r.role) cluster.roles.set(r.role, (cluster.roles.get(r.role) ?? 0) + 1)
    for (const t of r.triggers ?? []) cluster.triggers.set(t, (cluster.triggers.get(t) ?? 0) + 1)
    for (const p of r.pains    ?? []) cluster.pains.set(p,    (cluster.pains.get(p)    ?? 0) + 1)
    if (cluster.exampleSessionIds.length < 3) cluster.exampleSessionIds.push(r.session_id)
  }

  const clusters = Array.from(groups.values()).sort((a, b) => b.count - a.count)

  // Pull brand_name + date for the example sessions so we can label them
  const allExampleIds = clusters.flatMap(c => c.exampleSessionIds)
  const { data: sessionStubs } = allExampleIds.length > 0
    ? await sb.from('atelier_sessions').select('id, brand_name, created_at').in('id', allExampleIds) as { data: SessionStub[] | null }
    : { data: [] }
  const stubMap = new Map((sessionStubs ?? []).map(s => [s.id, s]))

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">ICP-groepen</h1>
          <p className="text-slate-600">
            Alle ICP-profielen uit eerdere sessies, geclusterd per industry. De top-triggers en top-pijnpunten geven je in één oogopslag de patronen.
          </p>
        </header>

        {clusters.length === 0 ? (
          <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center text-slate-500">
            Nog geen ICP-data — de ICP-module heeft nog niet gedraaid voor een sessie.
          </div>
        ) : (
          <div className="space-y-4">
            {clusters.map(c => {
              const topRoles    = topN(c.roles,    3)
              const topTriggers = topN(c.triggers, 4)
              const topPains    = topN(c.pains,    4)
              return (
                <div key={c.industry} className="rounded-2xl bg-white border border-stone-200 p-6">
                  <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                    <h2 className="text-xl font-bold text-brand-dark">{c.industry}</h2>
                    <span className="text-xs text-slate-500">
                      {c.count} {c.count === 1 ? 'sessie' : 'sessies'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-2">Top rollen</p>
                      <ul className="space-y-1">
                        {topRoles.length === 0 && <li className="text-slate-400 italic text-xs">geen</li>}
                        {topRoles.map(r => (
                          <li key={r.label} className="text-slate-700">{r.label} <span className="text-slate-400 text-xs">({r.count})</span></li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-2">Top triggers</p>
                      <ul className="space-y-1">
                        {topTriggers.length === 0 && <li className="text-slate-400 italic text-xs">geen</li>}
                        {topTriggers.map(t => (
                          <li key={t.label} className="text-slate-700">{t.label} <span className="text-slate-400 text-xs">({t.count})</span></li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-2">Top pijnpunten</p>
                      <ul className="space-y-1">
                        {topPains.length === 0 && <li className="text-slate-400 italic text-xs">geen</li>}
                        {topPains.map(p => (
                          <li key={p.label} className="text-slate-700">{p.label} <span className="text-slate-400 text-xs">({p.count})</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {c.exampleSessionIds.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-stone-100 text-xs text-slate-500">
                      Voorbeeld-sessies:&nbsp;
                      {c.exampleSessionIds.map(sid => {
                        const stub = stubMap.get(sid)
                        return (
                          <Link key={sid} href={`/atelier/session/${sid}`} className="text-brand-accent hover:underline mr-2">
                            {stub?.brand_name?.trim() || sid.slice(0, 8)} →
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
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
