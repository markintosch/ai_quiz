'use client'

// ─── V2 marketing modules: the positioning battlefield and SOV interpretation ─
// The battlefield turns the claims tracker into the map the review asked for:
// Moba territory, competitive pressure, recommendation. The whitespace rows
// are the investment call, not a footnote. The SOV card leads with the "so
// what" sentence instead of asking the reader to interpret a chart.

import type { SignalDataset } from '@/products/moba_signal/types'
import { battlefield, PRESSURE_META, sovInsight } from '@/products/moba_signal/v2'

export function Battlefield({ data }: { data: SignalDataset }) {
  const { rows, whitespace } = battlefield(data)
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[560px]">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200">
              <th className="py-2 pr-3">Moba territory</th>
              <th className="py-2 pr-3">Competitive pressure</th>
              <th className="py-2 pr-3">Who presses</th>
              <th className="py-2">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(row => {
              const meta = PRESSURE_META[row.pressure]
              return (
                <tr key={row.pillar} className="align-top">
                  <td className="py-2.5 pr-3">
                    <span className="text-sm font-semibold text-gray-900">{row.pillar}</span>
                    <span className="block text-[11px] text-gray-400 mt-0.5">
                      {row.claims.length} claim{row.claims.length > 1 ? 's' : ''} in the messaging house
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-semibold ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-gray-500">
                    {row.contenders.length > 0 ? row.contenders.join(', ') : 'Nobody, yet'}
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[13px] ${row.invest ? 'font-semibold text-emerald-700' : 'text-gray-700'}`}>
                      {row.recommendation}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {whitespace.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-2">
            Whitespace: language nobody owns yet
          </p>
          <ul className="space-y-2">
            {whitespace.map(w => (
              <li key={w.id}>
                <span className="text-sm font-semibold text-gray-900">{w.territory}</span>
                <span className="block text-xs text-gray-600 mt-0.5">{w.rationale}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-[11px] text-gray-400">
        Built from the claims tracker: every row traces to competitor wording with a source and date.
      </p>
    </div>
  )
}

export function SovInsightCard({ data }: { data: SignalDataset }) {
  const insight = sovInsight(data)
  if (!insight) return null
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">What the share-of-voice data says</p>
      {insight.lines.map((line, i) => (
        <p key={i} className={i === 0 ? 'text-[15px] font-medium text-gray-900 leading-snug' : 'text-[13px] text-gray-600 mt-1.5'}>
          {line}
        </p>
      ))}
      {insight.action && (
        <p className="text-xs font-semibold text-brand mt-2.5">{insight.action}</p>
      )}
    </div>
  )
}
