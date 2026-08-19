'use client'

// FILE: src/app/admin/moba-signal/page.tsx
// ─── Moba Signal — collection console ─────────────────────────────────────────
// The human half of the pipeline: run collectors per source, review what the
// agents propose, decide curator proposals. Everything approved here appears
// on /moba/signal; everything rejected stays stored as learning-loop data.

import { useCallback, useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

interface State {
  sources: Row[]
  pending: Row[]
  recent: Row[]
  runs: Row[]
  proposals: Row[]
  entities: Row[]
}

const SCORE_HINT = 'proximity · materiality · credibility'

function fmtTs(v?: string | null): string {
  if (!v) return '—'
  return new Date(v).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function MobaSignalAdmin() {
  const [state, setState] = useState<State | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [entityPick, setEntityPick] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/moba-signal')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setState(json)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function runSource(sourceId: string) {
    setBusy(`run:${sourceId}`)
    setNotice(null)
    try {
      const res = await fetch('/api/admin/moba-signal/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId }),
      })
      const json = await res.json()
      setNotice(res.ok
        ? `${sourceId}: ${json.pagesFetched} pages, ${json.itemsFound} items found, ${json.itemsNew} new`
        : `${sourceId} failed: ${json.error ?? res.status}`)
    } catch (e) {
      setNotice(`${sourceId} failed: ${e instanceof Error ? e.message : e}`)
    }
    setBusy(null)
    load()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function review(body: Record<string, any>, key: string) {
    setBusy(key)
    try {
      const res = await fetch('/api/admin/moba-signal/review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) setNotice(json.error ?? `HTTP ${res.status}`)
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e))
    }
    setBusy(null)
    load()
  }

  if (error) {
    return (
      <main className="p-8 max-w-3xl">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Moba Signal — collection</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </main>
    )
  }
  if (!state) return <main className="p-8 text-sm text-gray-400">Loading…</main>

  return (
    <main className="p-6 lg:p-8 max-w-6xl space-y-8">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Moba Signal — collection console</h1>
          <p className="text-xs text-gray-500 mt-1">
            Agents collect and propose; nothing reaches <a className="underline" href="/moba/signal" target="_blank">/moba/signal</a> until approved here.
          </p>
        </div>
        {notice && <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700">{notice}</span>}
      </header>

      {/* ── Sources ── */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-2">Sources</h2>
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {state.sources.map(s => (
            <div key={s.id} className="px-4 py-2.5 flex flex-wrap items-center gap-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                s.status === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : s.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {s.status}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-sm text-gray-800">{s.name}</span>
                <span className="block text-[11px] text-gray-400">
                  {s.url} · last run {fmtTs(s.last_run_at)}
                  {s.failure_reason && <span className="text-red-600"> · {s.failure_reason}</span>}
                </span>
              </div>
              <button
                onClick={() => runSource(s.id)}
                disabled={busy !== null}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-40"
              >
                {busy === `run:${s.id}` ? 'Running…' : 'Run now'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Review queue ── */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-2">
          Review queue · {state.pending.length} proposed
        </h2>
        {state.pending.length === 0 && (
          <p className="text-sm text-gray-400">Nothing waiting. Run a source above to collect.</p>
        )}
        <div className="space-y-3">
          {state.pending.map(item => {
            const picked = entityPick[item.id] ?? item.entity_id ?? ''
            return (
              <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  <span className="text-[11px] text-gray-400">
                    {item.event_date} · {item.type} · {item.region} · {item.category} ·{' '}
                    <span title={SCORE_HINT}>{item.proximity}/{item.materiality}/{item.credibility}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.summary}</p>
                {(item.quotes ?? []).map((q: string, i: number) => (
                  <p key={i} className="text-xs text-gray-500 italic mt-1">&ldquo;{q}&rdquo;</p>
                ))}
                <p className="text-[11px] text-gray-400 mt-1">
                  <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="underline break-all">{item.source_url}</a>
                  {item.inference && <span className="ml-2 text-purple-600">inference</span>}
                  {item.entity_guess && <span className="ml-2 text-amber-700">unlinked: &ldquo;{item.entity_guess}&rdquo;</span>}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <select
                    value={picked}
                    onChange={e => setEntityPick(p => ({ ...p, [item.id]: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                  >
                    <option value="">— link entity —</option>
                    {state.entities.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name}{e.ownership_kind === 'moba' ? ' (part of Moba)' : e.parent_name ? ` (part of ${e.parent_name})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => review({ itemId: item.id, action: 'approve', entityId: picked || undefined }, `ap:${item.id}`)}
                    disabled={busy !== null || !picked}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand text-white disabled:opacity-40"
                  >
                    {busy === `ap:${item.id}` ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => review({ itemId: item.id, action: 'reject' }, `rj:${item.id}`)}
                    disabled={busy !== null}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Curator proposals ── */}
      {state.proposals.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-2">Curator proposals · {state.proposals.length}</h2>
          <div className="space-y-2">
            {state.proposals.map(p => (
              <div key={p.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <span className="block text-sm text-gray-800">{p.title}</span>
                  <span className="block text-[11px] text-gray-400">{p.rationale}</span>
                </div>
                <button onClick={() => review({ proposalId: p.id, action: 'accept-proposal' }, `pa:${p.id}`)} disabled={busy !== null}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand text-white disabled:opacity-40">Accept</button>
                <button onClick={() => review({ proposalId: p.id, action: 'reject-proposal' }, `pr:${p.id}`)} disabled={busy !== null}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40">Reject</button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Accepting an entity proposal does not create the entity yet: add it to moba_signal_entities with its
            ownership relation, then re-run the source. Automating that step is the next iteration.
          </p>
        </section>
      )}

      {/* ── Recent runs and decisions ── */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">Recent runs</h2>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 text-xs">
            {state.runs.length === 0 && <p className="px-4 py-3 text-gray-400">No runs yet.</p>}
            {state.runs.map(r => (
              <div key={r.id} className="px-4 py-2 flex items-center gap-2">
                <span className={r.ok === false ? 'text-red-600' : r.ok ? 'text-emerald-600' : 'text-gray-400'}>
                  {r.ok === false ? '✕' : r.ok ? '✓' : '…'}
                </span>
                <span className="text-gray-700">{r.source_id}</span>
                <span className="text-gray-400 ml-auto">
                  {fmtTs(r.started_at)} · {r.pages_fetched}p · {r.items_found} found · {r.items_new} new
                  {r.error && <span className="text-red-600"> · {r.error}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">Recent decisions</h2>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 text-xs">
            {state.recent.length === 0 && <p className="px-4 py-3 text-gray-400">No decisions yet.</p>}
            {state.recent.map(r => (
              <div key={r.id} className="px-4 py-2 flex items-center gap-2">
                <span className={r.review_status === 'approved' ? 'text-emerald-600' : 'text-red-500'}>
                  {r.review_status === 'approved' ? '✓' : '✕'}
                </span>
                <span className="text-gray-700 truncate">{r.title}</span>
                <span className="text-gray-400 ml-auto shrink-0">{r.event_date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
