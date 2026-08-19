'use client'

// ─── Tier 10: method and source health ────────────────────────────────────────
// Which sources are live, when each last returned data, and the known blind
// spots. Non-negotiable: a dashboard that hides its gaps trains people to
// over-trust it. A silent gap reads as calm, which is the most dangerous
// failure mode this product has.

import type { SignalDataset } from '@/products/moba_signal/types'
import { fmtDate, sourceStatusMeta } from '@/products/moba_signal/selectors'

export function SourceHealth({ data }: { data: SignalDataset }) {
  const sources = [...data.sources].sort((a, b) => {
    const order = { failed: 0, stale: 1, proposed: 2, ok: 3 }
    return order[a.status] - order[b.status]
  })
  const staleContext = data.context.filter(c => c.reviewBy < data.asOf)

  return (
    <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-6 items-start">
      {/* Sources */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Sources</h4>
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white">
          {sources.map(s => {
            const meta = sourceStatusMeta(s)
            return (
              <div key={s.id} className="px-4 py-2.5 flex items-start gap-3">
                <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-semibold mt-0.5 ${meta.cls}`}>
                  {meta.label}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-sm text-gray-700 truncate">
                    {s.name}
                    {s.language && <span className="text-gray-400"> · {s.language}</span>}
                  </span>
                  <span className="block text-[11px] text-gray-400">
                    last item {s.lastItem ? fmtDate(s.lastItem) : 'never'} · {s.itemsLast30d} items/30d · {s.scoredItemsLast90d} scored/90d
                  </span>
                  {s.failureReason && <span className="block text-[11px] text-red-600 mt-0.5">{s.failureReason}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Context corpus */}
      <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Context corpus</h4>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white">
            {data.context.map(c => {
              const stale = c.reviewBy < data.asOf
              return (
                <div key={c.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-700">{c.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${
                      stale ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {stale ? 'review overdue' : `review ${fmtDate(c.reviewBy)}`}
                    </span>
                  </div>
                  <span className="block text-[11px] text-gray-400">Owner: {c.owner} · loaded {fmtDate(c.loadedOn)}</span>
                  {c.note && <span className="block text-[11px] text-gray-500 mt-0.5">{c.note}</span>}
                </div>
              )
            })}
          </div>
          {staleContext.length > 0 && (
            <p className="text-[11px] text-amber-700 mt-2">
              {staleContext.length} context item{staleContext.length > 1 ? 's' : ''} past review date. Context is the
              lens the agent reads everything through; a stale lens corrupts silently.
            </p>
          )}
      </div>

      {/* Method and blind spots */}
      <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Method and known blind spots</h4>
          <ul className="text-xs text-gray-500 space-y-1.5 rounded-xl border border-gray-100 bg-white p-4">
            <li>Public sources only. No authenticated access, no circumvention, no misrepresentation.</li>
            <li>Every assertion carries a source, confidence and timestamps. Inferences are labelled.</li>
            <li>The agent ranks, it does not declare: no Critical item publishes without a human.</li>
            <li>Blind spot: private deals with no press coverage. Field contributions are the only channel for these.</li>
            <li>Blind spot: Japanese-language sources are stale this week (NABEL site, Kyowa scraper failed).</li>
            <li>Blind spot: Americas history not yet backfilled. That research phase is in progress.</li>
          </ul>
      </div>
    </div>
  )
}
