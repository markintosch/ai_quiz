// FILE: src/app/admin/atelier/page.tsx
// Atelier ops dashboard — sessies, kosten, module-stats, Q&A volume.
// Gebruikt service-role client; geen extra auth nodig (admin layout beschermt).

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface SessionRow {
  id:               string
  status:           string
  brand_name:       string | null
  owner_email:      string | null
  jtbd_summary:     string | null
  total_cost_cents: number
  has_one_pager:    boolean
  created_at:       string
}

interface RunRow {
  module:        string
  status:        string
  cost_cents:    number | null
  latency_ms:    number | null
  prompt_tokens: number | null
  output_tokens: number | null
  started_at:    string
}

interface QaRow {
  cost_cents: number | null
  created_at: string
}

const MODULE_LABEL: Record<string, string> = {
  brief_jtbd:      'Brief & JTBD',
  reference:       'References',
  audience:        'Audience',
  tension:         'Tension',
  output:          'Output',
  icp:             'ICP',
  brand_archetype: 'Lens · archetype',
  competitor:      'Lens · competitor',
  cultural_moment: 'Lens · culture',
  live_signal:     'Live signal',
  qa:              'Q&A',
}

export default async function AdminAtelierPage() {
  const sb = createServiceClient()

  const [sessionsRes, runsRes, qaRes] = await Promise.all([
    sb.from('atelier_sessions')
      .select('id, status, brand_name, owner_email, jtbd_summary, total_cost_cents, has_one_pager, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    sb.from('atelier_module_runs')
      .select('module, status, cost_cents, latency_ms, prompt_tokens, output_tokens, started_at')
      .order('started_at', { ascending: false })
      .limit(2000),
    sb.from('atelier_qa_turns')
      .select('cost_cents, created_at')
      .order('created_at', { ascending: false })
      .limit(2000),
  ])

  const sessions = (sessionsRes.data ?? []) as SessionRow[]
  const runs     = (runsRes.data     ?? []) as RunRow[]
  const qaTurns  = (qaRes.data       ?? []) as QaRow[]

  // ── Aggregations ────────────────────────────────────────────────────────
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOf7d    = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const sessionsThisMonth = sessions.filter(s => new Date(s.created_at) >= startOfMonth)
  const sessionsToday     = sessions.filter(s => new Date(s.created_at) >= startOfToday)
  const sessionsLast7d    = sessions.filter(s => new Date(s.created_at) >= startOf7d)
  const completedSessions = sessions.filter(s => s.status === 'completed')
  const failedSessions    = sessions.filter(s => s.status === 'failed')

  const runsThisMonth = runs.filter(r => new Date(r.started_at) >= startOfMonth)
  const qaThisMonth   = qaTurns.filter(t => new Date(t.created_at) >= startOfMonth)

  const totalCostThisMonth = (runsThisMonth.reduce((a, r) => a + (Number(r.cost_cents) || 0), 0)
    + qaThisMonth.reduce((a, t) => a + (Number(t.cost_cents) || 0), 0)) / 100  // EUR cents → EUR
  const avgCostPerSession = completedSessions.length > 0
    ? completedSessions.reduce((a, s) => a + (Number(s.total_cost_cents) || 0), 0) / completedSessions.length / 100
    : 0

  // Module-level stats
  const moduleStats: Record<string, { total: number; ok: number; failed: number; avgLatency: number; totalCost: number }> = {}
  for (const r of runs) {
    if (!moduleStats[r.module]) moduleStats[r.module] = { total: 0, ok: 0, failed: 0, avgLatency: 0, totalCost: 0 }
    const m = moduleStats[r.module]
    m.total++
    if (r.status === 'ok')     m.ok++
    if (r.status === 'failed') m.failed++
    m.avgLatency += r.latency_ms ?? 0
    m.totalCost  += Number(r.cost_cents) || 0
  }
  for (const k of Object.keys(moduleStats)) {
    const m = moduleStats[k]
    m.avgLatency = m.total > 0 ? Math.round(m.avgLatency / m.total) : 0
  }
  const orderedModules = Object.keys(moduleStats).sort((a, b) => moduleStats[b].total - moduleStats[a].total)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark">Atelier — operations</h1>
        <p className="text-sm text-gray-600 mt-1">
          Live overzicht van sessies en kosten op{' '}
          <Link href="/atelier" target="_blank" className="text-brand-accent underline">/atelier</Link>.
          Cijfers komen direct uit <code>atelier_*</code> tabellen.
        </p>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <KPI label="Sessies totaal" value={sessions.length.toString()} />
        <KPI label="Deze maand" value={sessionsThisMonth.length.toString()}
             sub={`${sessionsToday.length} vandaag · ${sessionsLast7d.length} afgelopen 7d`} />
        <KPI label="Voltooid · gefaald"
             value={`${completedSessions.length} · ${failedSessions.length}`}
             sub={completedSessions.length > 0 ? `${Math.round(failedSessions.length / sessions.length * 100)}% fail rate` : ''} />
        <KPI label="Q&A volgvragen" value={qaTurns.length.toString()}
             sub={`${qaThisMonth.length} deze maand`} />
      </div>

      {/* ── Cost block ── */}
      <section className="rounded-2xl bg-amber-50 border border-amber-200 p-6 mb-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-3">Spend (Anthropic)</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-600">Deze maand totaal</p>
            <p className="text-2xl font-bold text-brand-dark mt-1">€{totalCostThisMonth.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">module-runs + Q&A samen</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-600">Gemiddelde per voltooide sessie</p>
            <p className="text-2xl font-bold text-brand-dark mt-1">€{avgCostPerSession.toFixed(3)}</p>
            <p className="text-xs text-gray-500 mt-1">all-in voor de 5 modules + extras</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-600">Laatste 7 dagen</p>
            <p className="text-2xl font-bold text-brand-dark mt-1">{sessionsLast7d.length}</p>
            <p className="text-xs text-gray-500 mt-1">sessies gestart</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 italic mt-4">
          NB: kosten zijn schattingen op basis van publieke Sonnet/Haiku pricing. Werkelijk bedrag op{' '}
          <a href="https://console.anthropic.com/settings/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-accent">
            console.anthropic.com → Billing
          </a>. Spending-cap zetten kan via Settings → Limits.
        </p>
      </section>

      {/* ── Module stats ── */}
      <section className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Module statistieken</h2>
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="text-left py-2 px-4">Module</th>
                <th className="text-right py-2 px-4">Runs</th>
                <th className="text-right py-2 px-4">OK</th>
                <th className="text-right py-2 px-4">Failed</th>
                <th className="text-right py-2 px-4">Avg latency</th>
                <th className="text-right py-2 px-4">Totaal cost</th>
              </tr>
            </thead>
            <tbody>
              {orderedModules.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-gray-500">Nog geen runs.</td></tr>
              ) : orderedModules.map(m => (
                <tr key={m} className="border-t border-gray-100">
                  <td className="py-2 px-4 font-medium text-brand-dark">{MODULE_LABEL[m] ?? m}</td>
                  <td className="py-2 px-4 text-right">{moduleStats[m].total}</td>
                  <td className="py-2 px-4 text-right text-green-700">{moduleStats[m].ok}</td>
                  <td className={`py-2 px-4 text-right ${moduleStats[m].failed > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                    {moduleStats[m].failed}
                  </td>
                  <td className="py-2 px-4 text-right text-gray-600">{moduleStats[m].avgLatency}ms</td>
                  <td className="py-2 px-4 text-right text-gray-600 font-mono">€{(moduleStats[m].totalCost / 100).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Recent sessions ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Recente sessies</h2>
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="text-left py-2 px-4">Wanneer</th>
                <th className="text-left py-2 px-4">Brand · email</th>
                <th className="text-left py-2 px-4">JTBD</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-right py-2 px-4">Cost</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nog geen sessies.</td></tr>
              ) : sessions.slice(0, 30).map(s => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="py-2 px-4 text-xs text-gray-600 whitespace-nowrap">
                    {new Date(s.created_at).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-2 px-4 text-xs text-gray-700">
                    <div className="font-medium">{s.brand_name ?? '—'}</div>
                    <div className="text-gray-500">{s.owner_email ?? ''}</div>
                  </td>
                  <td className="py-2 px-4 text-xs text-gray-700 max-w-xs truncate">{s.jtbd_summary ?? '—'}</td>
                  <td className="py-2 px-4">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      s.status === 'completed' ? 'bg-green-100 text-green-900' :
                      s.status === 'running'   ? 'bg-amber-100 text-amber-900' :
                      s.status === 'failed'    ? 'bg-red-100 text-red-900' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-xs text-gray-600">
                    €{(Number(s.total_cost_cents) / 100).toFixed(3)}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <Link href={`/atelier/session/${s.id}`} target="_blank" className="text-xs text-brand-accent hover:underline">
                      Open ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sessions.length > 30 && (
          <p className="text-xs text-gray-500 mt-2">Top 30 getoond — totaal {sessions.length} sessies in de laatste 200.</p>
        )}
      </section>
    </div>
  )
}

function KPI({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5">
      <p className="text-xs uppercase tracking-wide text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-brand-dark mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}
