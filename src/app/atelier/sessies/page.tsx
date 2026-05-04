// FILE: src/app/atelier/sessies/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Sessies tab — overview of past Atelier sessions. Latest first, basic filter.
// Server component; reads atelier_sessions + first 200 chars of brief for
// preview. Click row → /atelier/session/[id].

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface SessionListRow {
  id:                string
  status:            string
  brand_name:        string | null
  jtbd_summary:      string | null
  total_cost_cents:  number
  created_at:        string
  has_one_pager:     boolean
}

interface BriefStub {
  session_id: string
  raw_text:   string
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: '2-digit' }) +
       ' ' + d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

function fmtMoney(cents: number): string {
  return '€ ' + (cents / 100).toFixed(2)
}

function statusPill(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-900'
    case 'running':   return 'bg-amber-100 text-amber-900'
    case 'failed':    return 'bg-red-100 text-red-900'
    default:          return 'bg-stone-100 text-stone-700'
  }
}

export default async function SessiesPage() {
  const sb = createServiceClient()

  const { data: sessions } = await sb
    .from('atelier_sessions')
    .select('id, status, brand_name, jtbd_summary, total_cost_cents, created_at, has_one_pager')
    .order('created_at', { ascending: false })
    .limit(200) as { data: SessionListRow[] | null }

  const ids = (sessions ?? []).map(s => s.id)
  const { data: briefs } = ids.length > 0
    ? await sb.from('atelier_briefs').select('session_id, raw_text').in('session_id', ids) as { data: BriefStub[] | null }
    : { data: [] }
  const briefBySession = new Map((briefs ?? []).map(b => [b.session_id, b.raw_text]))

  const list = sessions ?? []

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Sessies</h1>
          <p className="text-slate-600">
            Alle Atelier-runs in omgekeerde volgorde. Klik een rij om de volledige sessie te openen.
          </p>
        </header>

        {list.length === 0 ? (
          <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center text-slate-500">
            Nog geen sessies. <Link href="/atelier/new" className="text-brand-accent font-semibold hover:underline">Start een eerste brief →</Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-left font-semibold px-4 py-3">Merk</th>
                  <th className="text-left font-semibold px-4 py-3">JTBD / brief</th>
                  <th className="text-right font-semibold px-4 py-3">Cost</th>
                  <th className="text-right font-semibold px-4 py-3">Datum</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {list.map(s => {
                  const briefSnippet = briefBySession.get(s.id)?.slice(0, 120) ?? ''
                  const display = s.jtbd_summary || briefSnippet || '—'
                  return (
                    <tr key={s.id} className="border-t border-stone-100 hover:bg-stone-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <span className={'text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ' + statusPill(s.status)}>
                          {s.status}
                        </span>
                        {s.has_one_pager && <span className="ml-1 text-xs text-green-700" title="Heeft one-pager">✓</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-dark whitespace-nowrap">
                        {s.brand_name || <span className="text-slate-400 italic">naamloos</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-md">
                        <p className="line-clamp-2 leading-snug">{display}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-slate-500 whitespace-nowrap">
                        {fmtMoney(s.total_cost_cents)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap">
                        {fmtDate(s.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/atelier/session/${s.id}`} className="text-brand-accent font-semibold text-xs hover:underline">
                          Open →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-4">
          Toont de laatste 200. {list.length} {list.length === 1 ? 'sessie' : 'sessies'} geladen.
        </p>
      </div>
    </div>
  )
}
