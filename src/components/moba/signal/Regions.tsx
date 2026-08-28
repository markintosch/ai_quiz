'use client'

// ─── Regional pressure ────────────────────────────────────────────────────────
// Where the competitive heat sits, by world region. Every signal already carries
// a region, so this is a rollup: activity count, threat tilt, the most active
// competitor and the latest move per region, with a heat bar weighted by recent
// activity and threat level. A region with no collected activity yet falls back
// to a clearly-labelled demo tile so the map reads as intended; those recede as
// real signals arrive.

import type { Signal, SignalDataset, Region } from '@/products/moba_signal/types'
import { REGION_LABELS } from '@/products/moba_signal/types'
import { entityById, entityLabel, laneEntityId, relTime } from '@/products/moba_signal/selectors'

const REGIONS: Region[] = ['europe', 'americas', 'asia', 'mea']

type Tilt = 'threat' | 'opportunity' | 'neutral'
const TILT: Record<Tilt, { label: string; bar: string; badge: string }> = {
  threat:      { label: 'Threat-leaning', bar: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border-red-200' },
  opportunity: { label: 'Opportunity',    bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  neutral:     { label: 'Quiet',          bar: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-500 border-gray-200' },
}

// Fallback shown only for a region with zero collected activity, clearly badged.
const DEMO_REGION: Record<Region, { intensity: number; tilt: Tilt; dominant: string; count: number; latest: string }> = {
  europe:   { intensity: 0.45, tilt: 'neutral',     dominant: 'Prinzen', count: 3, latest: 'Connected-packer teaser at SPACE' },
  americas: { intensity: 0.30, tilt: 'opportunity', dominant: 'Zenyer',  count: 2, latest: 'First IPPE appearance' },
  asia:     { intensity: 0.85, tilt: 'threat',      dominant: 'Sanovo',  count: 6, latest: 'Third SEA processing win' },
  mea:      { intensity: 0.25, tilt: 'neutral',     dominant: 'NABEL',   count: 1, latest: 'Saudi Ag session slot' },
  global:   { intensity: 0.20, tilt: 'neutral',     dominant: '—',       count: 0, latest: '' },
}

interface RegionRow {
  region: Region
  count: number
  raw: number
  tilt: Tilt
  dominant: string
  latest?: Signal
  demo: boolean
  demoLatest?: string
  demoIntensity?: number
}

function weight(s: Signal): number {
  if (s.disposition === 'threat') return 3
  if (s.type === 'win' || s.materiality === 3) return 2
  return 1
}

export function Regions({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const rows: RegionRow[] = REGIONS.map(region => {
    const sigs = data.signals.filter(s => s.region === region && laneEntityId(data, s.entityId) !== 'moba')
    if (sigs.length === 0) {
      const d = DEMO_REGION[region]
      return { region, count: d.count, raw: 0, tilt: d.tilt, dominant: d.dominant, demo: true, demoLatest: d.latest, demoIntensity: d.intensity }
    }
    const threats = sigs.filter(s => s.disposition === 'threat').length
    const opps = sigs.filter(s => s.disposition === 'opportunity').length
    const tilt: Tilt = threats > opps ? 'threat' : opps > threats ? 'opportunity' : 'neutral'
    // Most active competitor lane in the region.
    const byLane = new Map<string, number>()
    for (const s of sigs) {
      const lane = laneEntityId(data, s.entityId)
      byLane.set(lane, (byLane.get(lane) ?? 0) + 1)
    }
    const topLane = [...byLane.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    const e = topLane ? entityById(data, topLane) : undefined
    const latest = [...sigs].sort((a, b) => b.date.localeCompare(a.date))[0]
    return {
      region, count: sigs.length, raw: sigs.reduce((n, s) => n + weight(s), 0),
      tilt, dominant: e ? entityLabel(e) : (topLane ?? '—'), latest, demo: false,
    }
  })

  const maxRaw = Math.max(1, ...rows.map(r => r.raw))
  const anyDemo = rows.some(r => r.demo)

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[11px] text-gray-500 leading-snug flex-1">
          Competitive heat by world region, weighted by recent activity and threat level. A quiet region is an opening; a hot one is where to brief the local team.
        </p>
        {anyDemo && (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Demo data</span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map(r => {
          const t = TILT[r.tilt]
          const pct = Math.round((r.demo ? (r.demoIntensity ?? 0) : r.raw / maxRaw) * 100)
          return (
            <div key={r.region} className={`rounded-xl border p-3 ${r.demo ? 'border-dashed border-amber-300/70 bg-amber-50/20' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-gray-900">{REGION_LABELS[r.region]}</span>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${t.badge}`}>{t.label}</span>
                  {r.demo && <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">Demo</span>}
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-1.5">
                <div className={`h-full rounded-full ${t.bar} transition-all`} style={{ width: `${Math.max(6, pct)}%` }} />
              </div>
              <p className="text-[11px] text-gray-500">
                {r.count} signal{r.count === 1 ? '' : 's'} · most active: <span className="font-medium text-gray-700">{r.dominant}</span>
              </p>
              {r.demo ? (
                r.demoLatest && <p className="text-[11px] text-gray-400 mt-1 italic">{r.demoLatest}</p>
              ) : r.latest ? (
                <button onClick={() => onSelect(r.latest!)} className="text-left mt-1 group">
                  <span className="text-[11px] text-gray-500 group-hover:text-brand transition-colors">
                    Latest: {r.latest.title} · {relTime(r.latest.date, data.asOf)}
                  </span>
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
