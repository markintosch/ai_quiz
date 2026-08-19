'use client'

// ─── Tier 4: head to head ─────────────────────────────────────────────────────
// Per competitor a card on a fixed axis set. Every cell carries a confidence
// level and a last-verified date. Axes evolve: agent-proposed axes appear
// greyed until the analyst approves them.

import { useState } from 'react'
import type { SignalDataset } from '@/products/moba_signal/types'
import { entityById, entityLabel, fmtDate } from '@/products/moba_signal/selectors'
import { EdgeStrip } from './viz'

function ConfidenceDots({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex gap-0.5" title={`Confidence ${n} of 3`}>
      {[1, 2, 3].map(i => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= n ? 'bg-brand' : 'bg-gray-200'}`} />
      ))}
    </span>
  )
}

export function HeadToHead({ data }: { data: SignalDataset }) {
  const [active, setActive] = useState(data.headToHead[0]?.entityId ?? '')
  const card = data.headToHead.find(h => h.entityId === active)
  const proposedAxes = data.axes.filter(a => a.proposed)

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {data.headToHead.map(h => {
          const e = entityById(data, h.entityId)
          return (
            <button
              key={h.entityId}
              onClick={() => setActive(h.entityId)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active === h.entityId ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {e ? entityLabel(e) : h.entityId}
            </button>
          )
        })}
      </div>

      {card && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <p className="px-4 py-3 text-sm text-gray-600 bg-gray-50 border-b border-gray-100">{card.summary}</p>
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Where we stand, per axis</h4>
            <EdgeStrip axes={card.cells.map(c => ({
              label: data.axes.find(a => a.key === c.axis)?.label ?? c.axis,
              edge: c.edge,
            }))} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[460px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-2 font-medium w-40">Axis</th>
                  <th className="px-4 py-2 font-medium">Moba</th>
                  <th className="px-4 py-2 font-medium">{(() => { const e = entityById(data, card.entityId); return e ? entityLabel(e) : card.entityId })()}</th>
                  <th className="px-4 py-2 font-medium w-32">Verified</th>
                </tr>
              </thead>
              <tbody>
                {card.cells.map(cell => {
                  const axis = data.axes.find(a => a.key === cell.axis)
                  return (
                    <tr key={cell.axis} className="border-b border-gray-50 last:border-0 align-top">
                      <td className="px-4 py-2.5 font-medium text-gray-700">{axis?.label ?? cell.axis}</td>
                      <td className="px-4 py-2.5 text-gray-600">{cell.moba}</td>
                      <td className="px-4 py-2.5 text-gray-600">{cell.competitor}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">
                        <ConfidenceDots n={cell.confidence} />
                        <span className="block mt-0.5">{fmtDate(cell.lastVerified)}</span>
                      </td>
                    </tr>
                  )
                })}
                {proposedAxes.map(a => (
                  <tr key={a.key} className="border-b border-gray-50 last:border-0 bg-gray-50/50 text-gray-400">
                    <td className="px-4 py-2.5 font-medium italic">{a.label}</td>
                    <td className="px-4 py-2.5 text-xs italic" colSpan={3}>
                      Proposed axis, awaiting analyst approval. {a.proposedRationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
