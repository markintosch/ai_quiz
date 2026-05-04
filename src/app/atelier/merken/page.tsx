// FILE: src/app/atelier/merken/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Merken tab — list of brands grouped from atelier_sessions.brand_name.
// Per brand: count of sessions, last activity, total cost, link to filtered
// session list (for now: link to /atelier/sessies; future: ?brand= filter).

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface SessionRow {
  brand_name:       string | null
  total_cost_cents: number
  created_at:       string
  status:           string
  id:               string
}

interface BrandStat {
  brand:            string
  sessions:         number
  totalCostCents:   number
  lastCreatedAt:    string
  completedRatio:   number  // 0..1
  exampleSessionId: string
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: '2-digit' })
}

function fmtMoney(cents: number): string {
  return '€ ' + (cents / 100).toFixed(2)
}

export default async function MerkenPage() {
  const sb = createServiceClient()

  const { data: sessions } = await sb
    .from('atelier_sessions')
    .select('id, brand_name, total_cost_cents, created_at, status')
    .not('brand_name', 'is', null)
    .order('created_at', { ascending: false })
    .limit(2000) as { data: SessionRow[] | null }

  const rows = sessions ?? []

  // Group by brand_name (case-insensitive, trimmed)
  const grouped = new Map<string, SessionRow[]>()
  for (const s of rows) {
    const key = (s.brand_name ?? '').trim()
    if (!key) continue
    const k = key.toLowerCase()
    const arr = grouped.get(k)
    if (arr) arr.push(s)
    else grouped.set(k, [s])
  }

  const brands: BrandStat[] = Array.from(grouped.entries()).map(([, group]) => {
    const total = group.reduce((acc, g) => acc + g.total_cost_cents, 0)
    const completed = group.filter(g => g.status === 'completed').length
    return {
      brand:            group[0].brand_name?.trim() ?? '',
      sessions:         group.length,
      totalCostCents:   total,
      lastCreatedAt:    group[0].created_at,
      completedRatio:   group.length > 0 ? completed / group.length : 0,
      exampleSessionId: group[0].id,
    }
  }).sort((a, b) => new Date(b.lastCreatedAt).getTime() - new Date(a.lastCreatedAt).getTime())

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Merken</h1>
          <p className="text-slate-600">
            Merken die we eerder in Atelier hebben behandeld. Klik om de meest recente sessie te openen.
          </p>
        </header>

        {brands.length === 0 ? (
          <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center text-slate-500">
            Nog geen merken — sessies zonder brand_name komen hier niet voor.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map(b => (
              <Link
                key={b.brand}
                href={`/atelier/session/${b.exampleSessionId}`}
                className="block rounded-2xl bg-white border border-stone-200 p-5 hover:border-brand-accent hover:shadow-sm transition-all"
              >
                <p className="text-lg font-bold text-brand-dark mb-1">{b.brand}</p>
                <p className="text-xs text-slate-500 mb-3">Laatste activiteit · {fmtDate(b.lastCreatedAt)}</p>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-stone-50 py-2">
                    <p className="font-bold text-brand-dark text-base">{b.sessions}</p>
                    <p className="text-slate-500">{b.sessions === 1 ? 'sessie' : 'sessies'}</p>
                  </div>
                  <div className="rounded-lg bg-stone-50 py-2">
                    <p className="font-bold text-brand-dark text-base">{Math.round(b.completedRatio * 100)}%</p>
                    <p className="text-slate-500">geslaagd</p>
                  </div>
                  <div className="rounded-lg bg-stone-50 py-2">
                    <p className="font-bold text-brand-dark text-base">{fmtMoney(b.totalCostCents)}</p>
                    <p className="text-slate-500">cost</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500 mt-4">
          {brands.length} {brands.length === 1 ? 'merk' : 'merken'} · gebaseerd op de laatste 2.000 sessies met brand_name.
        </p>
      </div>
    </div>
  )
}
