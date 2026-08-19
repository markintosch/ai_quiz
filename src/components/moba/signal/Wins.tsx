'use client'

// ─── Tier 6: wins and references ──────────────────────────────────────────────
// Announced customer wins by region and category. The flag that makes an entry
// urgent rather than interesting: does it touch a known Moba account or region.

import type { Signal, SignalDataset, Region } from '@/products/moba_signal/types'
import { CATEGORY_LABELS, REGION_LABELS } from '@/products/moba_signal/types'
import { entityById, entityLabel, fmtDate, laneEntityId } from '@/products/moba_signal/selectors'

export function Wins({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const wins = data.signals
    .filter(s => s.type === 'win' && laneEntityId(data, s.entityId) !== 'moba')
    .sort((a, b) => b.date.localeCompare(a.date))

  const byRegion = new Map<Region, Signal[]>()
  for (const w of wins) {
    byRegion.set(w.region, [...(byRegion.get(w.region) ?? []), w])
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {[...byRegion.entries()].map(([region, items]) => (
        <div key={region} className="rounded-xl border border-gray-100 bg-white p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            {REGION_LABELS[region]} · {items.length}
          </h4>
          <ul className="space-y-2">
            {items.map(w => {
              const e = entityById(data, w.entityId)
              return (
                <li key={w.id}>
                  <button onClick={() => onSelect(w)} className="text-left w-full group">
                    <span className="text-sm text-gray-700 group-hover:text-brand transition-colors">
                      <span className="font-medium">{e ? entityLabel(e) : w.entityId}</span> · {w.title}
                    </span>
                    <span className="block text-[11px] text-gray-400">
                      {CATEGORY_LABELS[w.category]} · {fmtDate(w.date)}
                      {w.touchesMobaAccount && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">
                          touches {w.touchesMobaAccount}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
