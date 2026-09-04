'use client'

// ─── Regional pressure ────────────────────────────────────────────────────────
// Where the competitive heat sits, by world region. Every signal already carries
// a region, so this is a rollup: activity count, threat tilt, the most active
// competitor and the latest move per region, with a heat bar weighted by recent
// activity and threat level. A schematic world map sits on top; clicking a
// region (map or tile) focuses the rest of the board on it. A region with no
// collected activity yet falls back to a clearly-labelled demo tile.

import type { Signal, SignalDataset, Region } from '@/products/moba_signal/types'
import { REGION_LABELS } from '@/products/moba_signal/types'
import { entityById, entityLabel, laneEntityId, relTime } from '@/products/moba_signal/selectors'

const REGIONS: Region[] = ['europe', 'americas', 'asia', 'mea']

type Tilt = 'threat' | 'opportunity' | 'neutral'
const TILT: Record<Tilt, { label: string; bar: string; badge: string; hex: string }> = {
  threat:      { label: 'Threat-leaning', bar: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border-red-200',         hex: '#ef4444' },
  opportunity: { label: 'Opportunity',    bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', hex: '#10b981' },
  neutral:     { label: 'Quiet',          bar: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-500 border-gray-200',       hex: '#9ca3af' },
}

// Fallback shown only for a region with zero collected activity, clearly badged.
const DEMO_REGION: Record<Region, { intensity: number; tilt: Tilt; dominant: string; count: number; latest: string }> = {
  europe:   { intensity: 0.45, tilt: 'neutral',     dominant: 'Prinzen', count: 3, latest: 'Connected-packer teaser at SPACE' },
  americas: { intensity: 0.30, tilt: 'opportunity', dominant: 'Zenyer',  count: 2, latest: 'First IPPE appearance' },
  asia:     { intensity: 0.85, tilt: 'threat',      dominant: 'Sanovo',  count: 6, latest: 'Third SEA processing win' },
  mea:      { intensity: 0.25, tilt: 'neutral',     dominant: 'NABEL',   count: 1, latest: 'Saudi Ag session slot' },
  global:   { intensity: 0.20, tilt: 'neutral',     dominant: '—',       count: 0, latest: '' },
}

// Rough geographic placement for the schematic world, viewBox 320×150.
const GEO: Record<Region, { cx: number; cy: number; rx: number; ry: number }> = {
  americas: { cx: 58,  cy: 82, rx: 30, ry: 50 },
  europe:   { cx: 165, cy: 44, rx: 26, ry: 21 },
  mea:      { cx: 172, cy: 101, rx: 30, ry: 29 },
  asia:     { cx: 256, cy: 76, rx: 40, ry: 44 },
  global:   { cx: 160, cy: 75, rx: 0,  ry: 0 },
}

interface RegionRow {
  region: Region
  count: number
  tilt: Tilt
  dominant: string
  heat: number        // 0..1 for the bar and the map opacity
  latest?: Signal
  demo: boolean
  demoLatest?: string
}

function weight(s: Signal): number {
  if (s.disposition === 'threat') return 3
  if (s.type === 'win' || s.materiality === 3) return 2
  return 1
}

export function Regions({ data, onSelect, activeRegion, onRegionFilter }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
  activeRegion?: Region | null
  onRegionFilter?: (r: Region) => void
}) {
  // Raw weighted intensity per region, then normalised to the busiest region.
  const raw: Record<string, number> = {}
  for (const region of REGIONS) {
    raw[region] = data.signals
      .filter(s => s.region === region && laneEntityId(data, s.entityId) !== 'moba')
      .reduce((n, s) => n + weight(s), 0)
  }
  const maxRaw = Math.max(1, ...Object.values(raw))

  const rows: RegionRow[] = REGIONS.map(region => {
    const sigs = data.signals.filter(s => s.region === region && laneEntityId(data, s.entityId) !== 'moba')
    if (sigs.length === 0) {
      const d = DEMO_REGION[region]
      return { region, count: d.count, tilt: d.tilt, dominant: d.dominant, heat: d.intensity, demo: true, demoLatest: d.latest }
    }
    const threats = sigs.filter(s => s.disposition === 'threat').length
    const opps = sigs.filter(s => s.disposition === 'opportunity').length
    const tilt: Tilt = threats > opps ? 'threat' : opps > threats ? 'opportunity' : 'neutral'
    const byLane = new Map<string, number>()
    for (const s of sigs) {
      const lane = laneEntityId(data, s.entityId)
      byLane.set(lane, (byLane.get(lane) ?? 0) + 1)
    }
    const topLane = [...byLane.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    const e = topLane ? entityById(data, topLane) : undefined
    const latest = [...sigs].sort((a, b) => b.date.localeCompare(a.date))[0]
    return {
      region, count: sigs.length, tilt, dominant: e ? entityLabel(e) : (topLane ?? '—'),
      heat: raw[region] / maxRaw, latest, demo: false,
    }
  })

  const byRegion = new Map(rows.map(r => [r.region, r]))
  const anyDemo = rows.some(r => r.demo)
  const clickable = !!onRegionFilter

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[11px] text-gray-500 leading-snug flex-1">
          Competitive heat by world region, weighted by recent activity and threat level.
          {clickable && ' Click a region to focus the board; click again to clear.'}
        </p>
        {anyDemo && (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Demo data</span>
        )}
      </div>

      {/* Schematic world map */}
      <svg viewBox="0 0 320 150" className="w-full h-auto mb-3 rounded-xl" style={{ background: '#f1f5f9' }} role="img" aria-label="Competitive heat by world region">
        {REGIONS.map(region => {
          const r = byRegion.get(region)!
          const g = GEO[region]
          const t = TILT[r.tilt]
          const active = activeRegion === region
          const dim = activeRegion && !active
          return (
            <g
              key={region}
              onClick={clickable ? () => onRegionFilter!(region) : undefined}
              style={{ cursor: clickable ? 'pointer' : 'default', opacity: dim ? 0.4 : 1 }}
            >
              {/* React 19 requires a single text child in <title> */}
              <title>{`${REGION_LABELS[region]} · ${t.label} · ${r.count} signals`}</title>
              <ellipse
                cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry}
                fill={t.hex} fillOpacity={0.28 + 0.55 * r.heat}
                stroke={active ? '#354E5E' : '#ffffff'} strokeWidth={active ? 2.5 : 1}
              />
              <text x={g.cx} y={g.cy - 1} textAnchor="middle" fontSize="9" fontWeight="700" fill="#1f2937">{REGION_LABELS[region]}</text>
              <text x={g.cx} y={g.cy + 10} textAnchor="middle" fontSize="8" fill="#4b5563">{r.count} sig</text>
            </g>
          )
        })}
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map(r => {
          const t = TILT[r.tilt]
          const pct = Math.round(r.heat * 100)
          const active = activeRegion === r.region
          const header = (
            <>
              <span className={`text-sm font-semibold text-gray-900 ${clickable ? 'group-hover:text-brand transition-colors' : ''}`}>{REGION_LABELS[r.region]}</span>
              <span className="flex items-center gap-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${t.badge}`}>{t.label}</span>
                {r.demo && <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">Demo</span>}
              </span>
            </>
          )
          return (
            <div key={r.region} className={`rounded-xl border p-3 ${active ? 'ring-2 ring-brand border-brand/40' : r.demo ? 'border-dashed border-amber-300/70 bg-amber-50/20' : 'border-gray-100 bg-white'}`}>
              {clickable ? (
                <button type="button" onClick={() => onRegionFilter!(r.region)}
                  className="w-full text-left flex items-center justify-between gap-2 mb-1.5 group">
                  {header}
                </button>
              ) : (
                <div className="flex items-center justify-between gap-2 mb-1.5">{header}</div>
              )}
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
