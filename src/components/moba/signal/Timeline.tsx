'use client'

// ─── Tier 3: the timeline, the spine of the product ──────────────────────────
// Horizontal, 24 months, one lane per competitor group plus a Moba lane.
// Group rollup applies: a Staalkat item plots in the Sanovo lane. Event types
// are colour-coded; clicking a point opens the source and annotations.

import { useMemo, useState } from 'react'
import type { Signal, SignalDataset, SignalType } from '@/products/moba_signal/types'
import { SIGNAL_TYPE_LABELS } from '@/products/moba_signal/types'
import { band, entityById, entityLabel, laneEntityId, fmtMonth } from '@/products/moba_signal/selectors'

const TYPE_COLORS: Record<SignalType, string> = {
  launch:        'bg-blue-500',
  win:           'bg-emerald-500',
  partnership:   'bg-purple-500',
  personnel:     'bg-slate-400',
  facility:      'bg-cyan-500',
  funding:       'bg-pink-500',
  certification: 'bg-lime-500',
  moba:          'bg-brand-accent',
}

const RANGES = [
  { key: 24, label: '24 mnd' },
  { key: 12, label: '12 mnd' },
  { key: 6,  label: '6 mnd' },
] as const

function monthsBack(asOf: string, months: number): string {
  const d = new Date(asOf + 'T00:00:00Z')
  d.setUTCMonth(d.getUTCMonth() - months)
  return d.toISOString().slice(0, 10)
}

export function Timeline({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const [range, setRange] = useState<number>(24)
  const [laneFilter, setLaneFilter] = useState<string | null>(null)

  const from = monthsBack(data.asOf, range)
  const fromMs = Date.parse(from)
  const toMs = Date.parse(data.asOf)

  // Lanes: Moba first, then priority competitors, then the rest with signals
  const lanes = useMemo(() => {
    const withSignals = new Set(data.signals.map(s => laneEntityId(data, s.entityId)))
    const ordered = ['moba', ...data.entities
      .filter(e => e.type === 'competitor' && withSignals.has(e.id))
      .sort((a, b) => Number(b.priority ?? false) - Number(a.priority ?? false))
      .map(e => e.id)]
    return ordered.filter((id, i) => ordered.indexOf(id) === i)
  }, [data])

  const visibleLanes = laneFilter ? lanes.filter(l => l === laneFilter || l === 'moba') : lanes

  // Month gridlines
  const months: string[] = []
  {
    const d = new Date(from + 'T00:00:00Z')
    d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + 1)
    while (d.getTime() < toMs) {
      months.push(d.toISOString().slice(0, 10))
      d.setUTCMonth(d.getUTCMonth() + 1)
    }
  }
  const pct = (iso: string) => ((Date.parse(iso) - fromMs) / (toMs - fromMs)) * 100
  const labelEvery = range === 24 ? 3 : range === 12 ? 2 : 1

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                range === r.key ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <select
          value={laneFilter ?? ''}
          onChange={e => setLaneFilter(e.target.value || null)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
          aria-label="Filter timeline by competitor"
        >
          <option value="">All competitors</option>
          {lanes.filter(l => l !== 'moba').map(l => {
            const e = entityById(data, l)
            return <option key={l} value={l}>{e ? entityLabel(e) : l}</option>
          })}
        </select>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {visibleLanes.map(laneId => {
            const entity = entityById(data, laneId)
            const laneSignals = data.signals.filter(s =>
              laneEntityId(data, s.entityId) === laneId &&
              Date.parse(s.date) >= fromMs && Date.parse(s.date) <= toMs
            )
            const isMoba = laneId === 'moba'
            return (
              <div key={laneId} className={`flex items-center gap-3 py-1 ${isMoba ? 'border-b-2 border-gray-200 pb-2 mb-1' : ''}`}>
                <div className={`w-36 shrink-0 text-xs truncate ${isMoba ? 'font-bold text-brand' : 'text-gray-600'}`}>
                  {entity ? entityLabel(entity) : laneId}
                  {entity?.priority && <span className="ml-1 text-brand-accent" title="Priority competitor">●</span>}
                </div>
                <div className={`relative h-8 flex-1 rounded ${isMoba ? 'bg-brand/5' : 'bg-gray-50'}`}>
                  {months.map(m => (
                    <div key={m} className="absolute top-0 bottom-0 w-px bg-gray-200/70" style={{ left: `${pct(m)}%` }} />
                  ))}
                  {laneSignals.map(s => {
                    const critical = band(s) === 'critical' && !isMoba
                    return (
                      <button
                        key={s.id}
                        onClick={() => onSelect(s)}
                        title={`${s.title} (${SIGNAL_TYPE_LABELS[s.type]})`}
                        className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${TYPE_COLORS[s.type]} ${
                          critical ? 'w-4 h-4 ring-2 ring-red-300' : 'w-2.5 h-2.5'
                        } hover:scale-150 transition-transform`}
                        style={{ left: `${pct(s.date)}%` }}
                        aria-label={s.title}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Month axis */}
          <div className="flex items-center gap-3 mt-1">
            <div className="w-36 shrink-0" />
            <div className="relative h-5 flex-1">
              {months.map((m, i) => (
                i % labelEvery === 0 ? (
                  <span key={m} className="absolute text-[10px] text-gray-400 -translate-x-1/2" style={{ left: `${pct(m)}%` }}>
                    {fmtMonth(m.slice(0, 7))}
                  </span>
                ) : null
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-[11px] text-gray-500">
        {(Object.keys(TYPE_COLORS) as SignalType[]).map(t => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[t]}`} />
            {SIGNAL_TYPE_LABELS[t]}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-300 ring-2 ring-red-300" />
          Critical item
        </span>
      </div>
    </div>
  )
}
