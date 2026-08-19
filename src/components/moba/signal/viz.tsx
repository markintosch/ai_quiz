'use client'

// ─── Shared chart primitives ──────────────────────────────────────────────────
// Plain SVG, no chart library: every mark here is small, labelled and specific.
// Rules followed throughout (dataviz method): one axis, thin marks with 2px
// surface gaps, colour follows the entity (ENTITY_COLORS) and never carries
// meaning alone — every mark has a visible text label or tooltip.

import { entityColor } from '@/products/moba_signal/selectors'

// ── Sparkline: columns for a short count series (stat tiles) ──────────────────

export function Sparkline({ values, highlightLast = true }: {
  values: number[]
  highlightLast?: boolean
}) {
  const max = Math.max(...values, 1)
  const w = 4, gap = 2
  const width = values.length * (w + gap) - gap
  const h = 18
  return (
    <svg width={width} height={h} className="block" aria-hidden="true">
      {values.map((v, i) => {
        const bh = Math.max((v / max) * h, v > 0 ? 2 : 1)
        const last = i === values.length - 1
        return (
          <rect
            key={i}
            x={i * (w + gap)}
            y={h - bh}
            width={w}
            height={bh}
            rx={1.5}
            className={last && highlightLast ? 'fill-brand-accent' : v === 0 ? 'fill-gray-200' : 'fill-gray-300'}
          />
        )
      })}
    </svg>
  )
}

// ── Stacked columns: wins per quarter by competitor ───────────────────────────

export function StackedColumns({ quarters, lanes, stacks, laneLabel }: {
  quarters: Array<{ label: string }>
  lanes: string[]
  stacks: number[][] // [quarter][laneIndex]
  laneLabel: (id: string) => string
}) {
  const totals = stacks.map(q => q.reduce((a, b) => a + b, 0))
  const max = Math.max(...totals, 1)
  const H = 72
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: H + 18 }}>
        {stacks.map((q, qi) => (
          <div key={qi} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full">
            <span className="text-[10px] font-semibold text-gray-600 leading-none mb-0.5">
              {totals[qi] > 0 ? totals[qi] : ''}
            </span>
            <div className="w-full max-w-[38px] flex flex-col-reverse rounded overflow-hidden">
              {q.map((v, li) => v > 0 && (
                <div
                  key={li}
                  title={`${laneLabel(lanes[li])}: ${v}`}
                  style={{ height: (v / max) * H, backgroundColor: entityColor(lanes[li]), marginTop: 2 }}
                  className="w-full rounded-[3px]"
                />
              ))}
              {totals[qi] === 0 && <div className="w-full h-[3px] rounded bg-gray-100" />}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        {quarters.map((q, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-gray-400">{q.label}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {lanes.map(l => (
          <span key={l} className="inline-flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entityColor(l) }} />
            {laneLabel(l)}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Momentum heat strip: signals per competitor per quarter ───────────────────
// Sequential single hue (brand teal, light→dark). Counts are printed in every
// non-empty cell, so colour never carries the value alone.

const TEAL_RAMP = ['#f3f6f8', '#dbe4e9', '#b7c9d3', '#8fa9b9', '#63879c', '#354E5E']

function heat(v: number, max: number): { bg: string; ink: string } {
  if (v === 0) return { bg: TEAL_RAMP[0], ink: '#c3c2b7' }
  const idx = 1 + Math.min(4, Math.floor((v / max) * 4.999) )
  return { bg: TEAL_RAMP[idx], ink: idx >= 4 ? '#ffffff' : '#1E3340' }
}

export function HeatStrip({ quarters, rows, laneLabel }: {
  quarters: Array<{ label: string }>
  rows: Array<{ laneId: string; counts: number[]; total: number }>
  laneLabel: (id: string) => string
}) {
  const max = Math.max(...rows.flatMap(r => r.counts), 1)
  return (
    <div className="overflow-x-auto pr-0.5">
      <table className="border-separate" style={{ borderSpacing: 2 }}>
        <thead>
          <tr>
            <th className="text-left text-[10px] font-medium text-gray-400 pr-2 whitespace-nowrap">per quarter</th>
            {quarters.map((q, i) => (
              <th key={i} className={`text-[10px] font-medium text-center whitespace-nowrap min-w-[30px] ${i === quarters.length - 1 ? 'text-brand-accent font-semibold' : 'text-gray-400'}`}>
                {q.label}
              </th>
            ))}
            <th className="text-[10px] font-medium text-gray-400 text-right pl-2">total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.laneId}>
              <td className="text-xs text-gray-600 pr-2 whitespace-nowrap">
                <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ backgroundColor: entityColor(r.laneId) }} />
                {laneLabel(r.laneId)}
              </td>
              {r.counts.map((v, i) => {
                const c = heat(v, max)
                return (
                  <td key={i} title={`${laneLabel(r.laneId)} · ${quarters[i].label}: ${v} signal${v === 1 ? '' : 's'}`}
                    className="text-center text-[11px] font-medium rounded h-7"
                    style={{ backgroundColor: c.bg, color: c.ink }}>
                    {v > 0 ? v : ''}
                  </td>
                )
              })}
              <td className="text-right text-xs font-semibold text-gray-700 pl-2">{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Advantage strip: diverging per-axis judgement (behind · par · ahead) ──────

const EDGE_META = {
  '-1': { label: 'behind', color: '#d03b3b', pos: 0 },
  '0':  { label: 'par',    color: '#898781', pos: 1 },
  '1':  { label: 'ahead',  color: '#2a78d6', pos: 2 },
} as const

export function EdgeStrip({ axes }: {
  axes: Array<{ label: string; edge: -1 | 0 | 1 }>
}) {
  return (
    <div className="grid grid-cols-1 gap-1">
      {axes.map(a => {
        const m = EDGE_META[String(a.edge) as keyof typeof EDGE_META]
        return (
          <div key={a.label} className="flex items-center gap-2 text-[11px]">
            <span className="w-36 shrink-0 text-gray-500 truncate">{a.label}</span>
            <span className="flex-1 grid grid-cols-3 gap-0.5 max-w-[120px]">
              {[0, 1, 2].map(pos => (
                <span key={pos} className="h-2 rounded-sm"
                  style={{ backgroundColor: pos === m.pos ? m.color : '#f0efec' }} />
              ))}
            </span>
            <span className="w-12 font-medium" style={{ color: m.color }}>{m.label}</span>
          </div>
        )
      })}
      <div className="flex items-center gap-2 text-[10px] text-gray-300 mt-0.5">
        <span className="w-36 shrink-0" />
        <span className="flex-1 max-w-[120px] flex justify-between"><span>behind</span><span>ahead</span></span>
        <span className="w-12" />
      </div>
    </div>
  )
}

// ── Event strip: the next 12 months as one line, today at the left ────────────

export function EventStrip({ asOf, events, onHover }: {
  asOf: string
  events: Array<{ id: string; name: string; startDate: string; mobaExhibiting: boolean; gap: boolean; competitors: number }>
  onHover?: (id: string | null) => void
}) {
  const from = Date.parse(asOf)
  const spanMs = 365 * 86_400_000
  const months: string[] = []
  {
    const d = new Date(asOf + 'T00:00:00Z')
    d.setUTCDate(1)
    for (let i = 1; i <= 12; i++) {
      const m = new Date(d); m.setUTCMonth(d.getUTCMonth() + i)
      months.push(m.toISOString().slice(0, 10))
    }
  }
  const pct = (iso: string) => Math.min(100, Math.max(0, ((Date.parse(iso) - from) / spanMs) * 100))
  return (
    <div className="mb-3">
      <div className="relative h-9 bg-gray-50 rounded-lg border border-gray-100">
        {months.map(m => (
          <div key={m} className="absolute top-0 bottom-0 w-px bg-gray-200/60" style={{ left: `${pct(m)}%` }} />
        ))}
        <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-brand-accent/60 rounded-l-lg" />
        {events.map(e => (
          <span
            key={e.id}
            title={`${e.name} · ${e.competitors} competitor${e.competitors === 1 ? '' : 's'} exhibiting${e.mobaExhibiting ? ' · Moba exhibits' : e.gap ? ' · attendance gap' : ''}`}
            onMouseEnter={() => onHover?.(e.id)}
            onMouseLeave={() => onHover?.(null)}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 ${
              e.mobaExhibiting
                ? 'bg-brand border-brand'
                : e.gap
                  ? 'bg-amber-100 border-amber-500'
                  : 'bg-white border-gray-300'
            }`}
            style={{ left: `${pct(e.startDate)}%`, width: 10 + Math.min(e.competitors, 4) * 2, height: 10 + Math.min(e.competitors, 4) * 2 }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span className="font-semibold text-brand-accent">today</span>
        <span>+6 months</span>
        <span>+12 months</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand border-2 border-brand" />Moba exhibits</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-100 border-2 border-amber-500" />Attendance gap</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-300" />Monitored</span>
        <span className="text-gray-400">Size = competitors exhibiting</span>
      </div>
    </div>
  )
}
