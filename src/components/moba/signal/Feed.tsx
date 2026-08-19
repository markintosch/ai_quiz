'use client'

// ─── Tier 9: the raw feed ─────────────────────────────────────────────────────
// Everything collected, filterable by competitor, region, category and band.
// Noise is collected but collapsed by default, per the display rules.

import { useMemo, useState } from 'react'
import type { Signal, SignalDataset } from '@/products/moba_signal/types'
import { CATEGORY_LABELS, REGION_LABELS, SIGNAL_TYPE_LABELS } from '@/products/moba_signal/types'
import { band, BAND_META, entityById, entityLabel, fmtDate, impactScore, laneEntityId, sortForFeed } from '@/products/moba_signal/selectors'

function Select({ value, onChange, options, all }: {
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
  all: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
    >
      <option value="">{all}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function Feed({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const [competitor, setCompetitor] = useState('')
  const [region, setRegion] = useState('')
  const [category, setCategory] = useState('')
  const [showNoise, setShowNoise] = useState(false)

  const competitorOptions = useMemo(() =>
    data.entities
      .filter(e => e.type === 'competitor')
      .map(e => ({ value: e.id, label: entityLabel(e) })),
  [data])

  const filtered = sortForFeed(data.signals).filter(s => {
    if (competitor && laneEntityId(data, s.entityId) !== competitor) return false
    if (region && s.region !== region) return false
    if (category && s.category !== category) return false
    if (!showNoise && band(s) === 'noise') return false
    return true
  })
  const noiseCount = data.signals.filter(s => band(s) === 'noise').length

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select value={competitor} onChange={setCompetitor} all="All competitors" options={competitorOptions} />
        <Select value={region} onChange={setRegion} all="All regions"
          options={Object.entries(REGION_LABELS).map(([value, label]) => ({ value, label }))} />
        <Select value={category} onChange={setCategory} all="All categories"
          options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))} />
        {noiseCount > 0 && (
          <button
            onClick={() => setShowNoise(v => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 underline ml-auto"
          >
            {showNoise ? 'Hide' : 'Show'} noise ({noiseCount})
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white">
        {filtered.map(s => {
          const b = band(s)
          const meta = BAND_META[b]
          const entity = entityById(data, s.entityId)
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3"
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-gray-800 truncate">{s.title}</span>
                <span className="block text-xs text-gray-400 mt-0.5">
                  {entity ? entityLabel(entity) : s.entityId} · {SIGNAL_TYPE_LABELS[s.type]} · {REGION_LABELS[s.region]} · {fmtDate(s.date)}
                  {s.annotations.length > 0 && <span className="ml-2 text-brand">✎ {s.annotations.length}</span>}
                  {s.status === 'disputed' && <span className="ml-2 text-red-500">disputed</span>}
                  {s.inference && <span className="ml-2 text-purple-500">inference</span>}
                </span>
              </span>
              <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full border font-medium ${meta.badge}`}>
                {impactScore(s)}
              </span>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-400 text-center">No items match these filters.</p>
        )}
      </div>
    </div>
  )
}
