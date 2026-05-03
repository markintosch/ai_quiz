// FILE: src/app/admin/atelier/icps/page.tsx
// ICP knowledge base — alle gegenereerde ICPs in één overzicht, gegroepeerd
// op brand_name, met aggregaties (top industries / rollen / triggers / pains)
// en validation-tagging.

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import IcpRowActions from '@/components/admin/IcpRowActions'

export const dynamic = 'force-dynamic'

interface IcpRow {
  id:                string
  session_id:        string
  industry:          string | null
  role:              string | null
  company_size:      string | null
  triggers:          string[] | null
  jobs:              string[] | null
  pains:             string[] | null
  buying_committee:  Array<{ role: string; influence: string }> | null
  rationale:         string | null
  validation_status: 'pending' | 'validated' | 'dismissed' | 'superseded'
  validation_note:   string | null
  validated_at:      string | null
  superseded_by_id:  string | null
  created_at:        string
}

interface SessionRow {
  id:           string
  brand_name:   string | null
  jtbd_summary: string | null
  status:       string
  created_at:   string
}

export default async function AdminAtelierIcpsPage() {
  const sb = createServiceClient()

  const [icpsRes, sessionsRes] = await Promise.all([
    sb.from('atelier_icp_profiles')
      .select('id, session_id, industry, role, company_size, triggers, jobs, pains, buying_committee, rationale, validation_status, validation_note, validated_at, superseded_by_id, created_at')
      .order('created_at', { ascending: false }),
    sb.from('atelier_sessions')
      .select('id, brand_name, jtbd_summary, status, created_at'),
  ])

  const icps     = (icpsRes.data     ?? []) as IcpRow[]
  const sessions = (sessionsRes.data ?? []) as SessionRow[]
  const sessionById = new Map(sessions.map(s => [s.id, s]))

  // ── Aggregations ────────────────────────────────────────────────────────
  const industryFreq = new Map<string, number>()
  const roleFreq     = new Map<string, number>()
  const sizeFreq     = new Map<string, number>()
  const triggerFreq  = new Map<string, number>()
  const painFreq     = new Map<string, number>()
  const committeeFreq = new Map<string, number>()

  for (const icp of icps) {
    if (icp.industry)     industryFreq.set(icp.industry, (industryFreq.get(icp.industry) ?? 0) + 1)
    if (icp.role)         roleFreq.set(icp.role, (roleFreq.get(icp.role) ?? 0) + 1)
    if (icp.company_size) sizeFreq.set(icp.company_size, (sizeFreq.get(icp.company_size) ?? 0) + 1)
    for (const t of icp.triggers ?? []) triggerFreq.set(t, (triggerFreq.get(t) ?? 0) + 1)
    for (const p of icp.pains ?? [])    painFreq.set(p, (painFreq.get(p) ?? 0) + 1)
    for (const m of icp.buying_committee ?? []) {
      committeeFreq.set(m.role, (committeeFreq.get(m.role) ?? 0) + 1)
    }
  }

  function topN(map: Map<string, number>, n = 5) {
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
  }

  const totalIcps = icps.length
  const validatedCount = icps.filter(i => i.validation_status === 'validated').length
  const dismissedCount = icps.filter(i => i.validation_status === 'dismissed').length

  // ── Group by brand_name (or fallback to "(geen brand)") ─────────────────
  const groupedByBrand = new Map<string, IcpRow[]>()
  for (const icp of icps) {
    const session = sessionById.get(icp.session_id)
    const key = session?.brand_name?.trim() || '(geen brand)'
    if (!groupedByBrand.has(key)) groupedByBrand.set(key, [])
    groupedByBrand.get(key)!.push(icp)
  }
  // Sort: brands with multiple ICPs first, then alphabetical
  const brands = Array.from(groupedByBrand.entries())
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark">Atelier — ICP knowledge base</h1>
        <p className="text-sm text-gray-600 mt-1">
          Alle ICPs uit alle Atelier-sessies. Gegroepeerd per brand, met aggregaties + validation tracking.
        </p>
      </div>

      {/* ── Top KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KpiSmall label="ICPs totaal" value={totalIcps.toString()} />
        <KpiSmall label="Brands" value={brands.length.toString()} />
        <KpiSmall label="Validated" value={validatedCount.toString()} color="green" />
        <KpiSmall label="Dismissed" value={dismissedCount.toString()} color="red" />
      </div>

      {/* ── Aggregations grid ── */}
      <section className="mb-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FreqCard title="Top industries" items={topN(industryFreq, 6)} total={totalIcps} />
        <FreqCard title="Top rollen (primair)" items={topN(roleFreq, 6)} total={totalIcps} />
        <FreqCard title="Bedrijfsgrootte" items={topN(sizeFreq, 6)} total={totalIcps} />
        <FreqCard title="Recurring triggers" items={topN(triggerFreq, 8)} total={totalIcps} />
        <FreqCard title="Recurring pains" items={topN(painFreq, 8)} total={totalIcps} />
        <FreqCard title="Buying-committee rollen" items={topN(committeeFreq, 8)} total={totalIcps} />
      </section>

      {/* ── Brands grouped ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">
          ICPs per brand · {brands.length} brands · {totalIcps} ICPs
        </h2>

        {brands.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 border border-gray-200 px-6 py-12 text-center">
            <p className="text-sm text-gray-600">Nog geen ICPs gegenereerd.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {brands.map(([brand, brandIcps]) => {
              // For supersede picker — siblings from same brand, EXCEPT this one
              const siblingsByIcpId = new Map<string, Array<{ id: string; created_at: string; industry: string | null; role: string | null }>>()
              for (const icp of brandIcps) {
                siblingsByIcpId.set(
                  icp.id,
                  brandIcps
                    .filter(o => o.id !== icp.id)
                    .map(o => ({ id: o.id, created_at: o.created_at, industry: o.industry, role: o.role }))
                )
              }

              return (
                <div key={brand} className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
                  <header className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-brand-dark">
                      {brand}
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        {brandIcps.length} {brandIcps.length === 1 ? 'ICP' : 'ICPs'}
                      </span>
                    </h3>
                    {brandIcps.length > 1 && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                        Evolution chain
                      </span>
                    )}
                  </header>

                  <ul className="divide-y divide-gray-100">
                    {brandIcps.map(icp => {
                      const session = sessionById.get(icp.session_id)
                      const supersededByLabel = icp.superseded_by_id
                        ? brandIcps.find(o => o.id === icp.superseded_by_id)
                        : null
                      return (
                        <li key={icp.id} className="px-5 py-4">
                          <div className="grid lg:grid-cols-12 gap-3 items-start">
                            <div className="lg:col-span-3">
                              <p className="text-xs text-gray-500 mb-1">
                                {new Date(icp.created_at).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}
                              </p>
                              <p className="text-sm font-semibold text-brand-dark">{icp.industry ?? '—'}</p>
                              <p className="text-xs text-gray-600">{icp.role ?? '—'}</p>
                              <p className="text-xs text-gray-500">{icp.company_size ?? '—'}</p>

                              <div className="mt-2 flex flex-wrap gap-1">
                                <StatusBadge status={icp.validation_status} />
                              </div>
                            </div>

                            <div className="lg:col-span-5 text-xs text-gray-700 space-y-2">
                              {icp.triggers && icp.triggers.length > 0 && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Triggers</p>
                                  <p className="text-gray-700">{icp.triggers.slice(0, 3).join(' · ')}{icp.triggers.length > 3 ? ' …' : ''}</p>
                                </div>
                              )}
                              {icp.pains && icp.pains.length > 0 && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Pains</p>
                                  <p className="text-gray-700">{icp.pains.slice(0, 3).join(' · ')}{icp.pains.length > 3 ? ' …' : ''}</p>
                                </div>
                              )}
                              {icp.validation_note && (
                                <div className="pt-2 border-t border-gray-100">
                                  <p className="text-[10px] uppercase tracking-wide text-amber-700 font-semibold">Validation note</p>
                                  <p className="text-gray-700 italic">{icp.validation_note}</p>
                                </div>
                              )}
                              {supersededByLabel && (
                                <div className="text-[11px] text-blue-700">
                                  → vervangen door ICP van {new Date(supersededByLabel.created_at).toLocaleDateString('nl-NL')}
                                </div>
                              )}
                              {session && (
                                <Link href={`/atelier/session/${icp.session_id}`} target="_blank"
                                  className="inline-block text-xs text-brand-accent hover:underline mt-1">
                                  Open sessie ↗
                                </Link>
                              )}
                            </div>

                            <div className="lg:col-span-4">
                              <IcpRowActions
                                icpId={icp.id}
                                current={icp.validation_status}
                                brandSiblings={siblingsByIcpId.get(icp.id) ?? []}
                              />
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function KpiSmall({ label, value, color }: { label: string; value: string; color?: 'green' | 'red' }) {
  const cls = color === 'green' ? 'text-green-700' : color === 'red' ? 'text-red-700' : 'text-brand-dark'
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-3">
      <p className="text-xs uppercase tracking-wide text-gray-600">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${cls}`}>{value}</p>
    </div>
  )
}

function FreqCard({ title, items, total }: { title: string; items: Array<[string, number]>; total: number }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-500">—</p>
      ) : (
        <ul className="space-y-2">
          {items.map(([label, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <li key={label} className="text-sm">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-gray-800 truncate">{label}</span>
                  <span className="text-xs text-gray-500 font-mono shrink-0">{count} · {pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-brand-accent" style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: 'pending' | 'validated' | 'dismissed' | 'superseded' }) {
  const palette: Record<string, string> = {
    pending:    'bg-gray-100 text-gray-700',
    validated:  'bg-green-100 text-green-900',
    dismissed:  'bg-red-100 text-red-900',
    superseded: 'bg-blue-100 text-blue-900',
  }
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${palette[status]}`}>
      {status}
    </span>
  )
}
