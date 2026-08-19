'use client'

// ─── Tier 5: claims and positioning tracker ──────────────────────────────────
// Every messaging-house claim as a row, with competitor wording in their own
// language, a contested status, a trend arrow and the whitespace view.

import type { SignalDataset, ContestedStatus } from '@/products/moba_signal/types'
import { CONTESTED_LABELS } from '@/products/moba_signal/types'
import { entityById, entityLabel, fmtDate, relTime } from '@/products/moba_signal/selectors'

const STATUS_CLS: Record<ContestedStatus, string> = {
  uncontested: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  adjacent:    'bg-amber-50 text-amber-700 border-amber-200',
  contested:   'bg-red-50 text-red-700 border-red-200',
  conceded:    'bg-gray-100 text-gray-500 border-gray-200',
}

function Trend({ t }: { t: -1 | 0 | 1 }) {
  if (t === -1) return <span className="text-red-500" title="Eroding over the last two quarters">↘</span>
  if (t === 1)  return <span className="text-emerald-500" title="Strengthening over the last two quarters">↗</span>
  return <span className="text-gray-300" title="Stable over the last two quarters">→</span>
}

const SUMMARY_COLORS: Record<ContestedStatus, string> = {
  uncontested: '#0ca30c',
  adjacent:    '#fab219',
  contested:   '#d03b3b',
  conceded:    '#898781',
}
const STATUS_ORDER: ContestedStatus[] = ['contested', 'conceded', 'adjacent', 'uncontested']

export function Claims({ data }: { data: SignalDataset }) {
  const houseStale = data.context.find(c => c.id === 'ctx-01' && c.reviewBy < data.asOf)
  const counts = STATUS_ORDER
    .map(st => ({ st, n: data.claims.filter(c => c.status === st).length }))
    .filter(x => x.n > 0)
  const total = data.claims.length
  return (
    <div>
      {/* Contest pressure at a glance: one stacked bar, worst first */}
      <div className="mb-4">
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {counts.map(x => (
            <div key={x.st} title={`${CONTESTED_LABELS[x.st]}: ${x.n} of ${total}`}
              style={{ width: `${(x.n / total) * 100}%`, backgroundColor: SUMMARY_COLORS[x.st] }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
          {counts.map(x => (
            <span key={x.st} className="inline-flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SUMMARY_COLORS[x.st] }} />
              {CONTESTED_LABELS[x.st]} · {x.n}
            </span>
          ))}
        </div>
      </div>
      {houseStale && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          The messaging house passed its review date ({fmtDate(houseStale.reviewBy)}). Rows below are provisional
          until the house is final. A stale house silently corrupts every claim assessment.
        </div>
      )}
      <div className="space-y-3">
        {data.claims.map(c => (
          <div key={c.id} className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wide text-gray-400">{c.pillar}</span>
                <h4 className="text-sm font-semibold text-gray-800">{c.claim}</h4>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Trend t={c.trend} />
                <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${STATUS_CLS[c.status]}`}>
                  {CONTESTED_LABELS[c.status]}
                </span>
              </div>
            </div>
            {c.competitorClaims.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {c.competitorClaims.map((cc, i) => {
                  const e = entityById(data, cc.entityId)
                  return (
                    <li key={i} className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{e ? entityLabel(e) : cc.entityId}:</span>{' '}
                      <a href={cc.sourceUrl} target="_blank" rel="noopener noreferrer" className="italic hover:underline">
                        &ldquo;{cc.wording}&rdquo;
                      </a>
                      {cc.translation && <span className="text-gray-400"> ({cc.sourceLanguage}: &ldquo;{cc.translation}&rdquo;)</span>}
                      <span className="text-gray-300" title={fmtDate(cc.lastSeen)}> · last seen {relTime(cc.lastSeen, data.asOf)}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Whitespace */}
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-6 mb-2">
        Whitespace: territory nobody occupies
      </h4>
      <div className="grid sm:grid-cols-2 gap-3">
        {data.whitespace.map(w => (
          <div key={w.id} className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-4">
            <h5 className="text-sm font-semibold text-gray-700">{w.territory}</h5>
            <p className="text-xs text-gray-500 mt-1">{w.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
