'use client'

// ─── Share of voice: LinkedIn competitor analytics ────────────────────────────
// Chosen form: share-of-voice lines over time (Option A). LinkedIn only
// exports period totals, so time context is reconstructed here: when the
// store holds nested windows that end on the same day (the 15/30/90/365-day
// exports), they are differenced into non-overlapping segments — "the year
// before the last 90 days", "the 60 days before the last 30", and so on.
// Each segment is one x-point; a line is an entity's percentage of ALL
// engagement in the tracked set within that segment. Standalone windows
// (e.g. a monthly import) pass through unchanged. Colour follows the
// entity; every line ends in a direct label; the detail table below
// carries the absolute numbers for the most recent segment.

import type { SignalDataset } from '@/products/moba_signal/types'
import { entityById, entityLabel, entityColor, fmtDate } from '@/products/moba_signal/selectors'

interface EntityStat {
  engagements: number
  posts: number
  newFollowers: number
  followers: number
}

interface Segment {
  key: string
  start: string
  end: string
  spanDays: number   // inclusive day count
  derived: boolean   // true when differenced out of nested windows
  labelTop: string
  labelBottom: string
  values: Map<string, EntityStat>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const dayBefore = (iso: string) =>
  new Date(Date.parse(iso + 'T00:00:00Z') - 86_400_000).toISOString().slice(0, 10)

function rangeLabel(start: string, end: string, spanDays: number): [string, string] {
  const s = new Date(start + 'T00:00:00Z')
  const e = new Date(end + 'T00:00:00Z')
  const bottom = spanDays >= 60 ? `${Math.round(spanDays / 30)} mo` : `${spanDays} d`
  if (spanDays >= 60) {
    const sm = `${MONTHS[s.getUTCMonth()]} '${String(s.getUTCFullYear()).slice(2)}`
    const em = `${MONTHS[e.getUTCMonth()]} '${String(e.getUTCFullYear()).slice(2)}`
    return [`${sm}–${em}`, bottom]
  }
  if (s.getUTCMonth() === e.getUTCMonth() && s.getUTCFullYear() === e.getUTCFullYear()) {
    return [`${s.getUTCDate()}–${e.getUTCDate()} ${MONTHS[e.getUTCMonth()]}`, bottom]
  }
  return [`${s.getUTCDate()} ${MONTHS[s.getUTCMonth()]}–${e.getUTCDate()} ${MONTHS[e.getUTCMonth()]}`, bottom]
}

// Difference nested same-end windows into disjoint segments; anything that
// does not nest passes through as its own segment.
function deriveSegments(data: SignalDataset): Segment[] {
  const social = data.social ?? []

  // Per-period per-entity stats
  const periods = new Map<string, { start: string; end: string; values: Map<string, EntityStat> }>()
  for (const s of social) {
    const key = `${s.periodStart}|${s.periodEnd}`
    if (!periods.has(key)) periods.set(key, { start: s.periodStart, end: s.periodEnd, values: new Map() })
    periods.get(key)!.values.set(s.entityId, {
      engagements: s.engagements, posts: s.posts, newFollowers: s.newFollowers, followers: s.followers,
    })
  }

  // Group by end date; nested chains (longest first) get differenced
  const byEnd = new Map<string, Array<{ start: string; end: string; values: Map<string, EntityStat> }>>()
  for (const p of periods.values()) {
    if (!byEnd.has(p.end)) byEnd.set(p.end, [])
    byEnd.get(p.end)!.push(p)
  }

  const mkSegment = (start: string, end: string, derived: boolean, values: Map<string, EntityStat>): Segment => {
    const spanDays = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1
    const [labelTop, labelBottom] = rangeLabel(start, end, spanDays)
    return { key: `${start}|${end}`, start, end, spanDays, derived, labelTop, labelBottom, values }
  }

  const segments: Segment[] = []
  for (const group of byEnd.values()) {
    group.sort((a, b) => a.start.localeCompare(b.start)) // longest window first
    for (let i = 0; i < group.length; i++) {
      const outer = group[i]
      const inner = group[i + 1]
      if (!inner || inner.start <= outer.start) {
        // Smallest of the chain, or a non-nesting window: keep as-is
        segments.push(mkSegment(outer.start, outer.end, false, outer.values))
        continue
      }
      // outer minus inner = the slice of time the inner window doesn't cover
      const diff = new Map<string, EntityStat>()
      for (const [id, o] of outer.values) {
        const n = inner.values.get(id)
        diff.set(id, {
          engagements: Math.max(0, o.engagements - (n?.engagements ?? 0)),
          posts: Math.max(0, o.posts - (n?.posts ?? 0)),
          newFollowers: Math.max(0, o.newFollowers - (n?.newFollowers ?? 0)),
          followers: o.followers,
        })
      }
      segments.push(mkSegment(outer.start, dayBefore(inner.start), true, diff))
    }
  }

  return segments.sort((a, b) => a.end === b.end ? a.start.localeCompare(b.start) : a.end.localeCompare(b.end))
}

function ShareChart({ data, segments, entityIds }: {
  data: SignalDataset
  segments: Segment[]
  entityIds: string[]
}) {
  const totals = segments.map(seg =>
    entityIds.reduce((sum, id) => sum + (seg.values.get(id)?.engagements ?? 0), 0))

  const share = (id: string, si: number): number | null => {
    const v = segments[si].values.get(id)
    if (!v || totals[si] === 0) return null
    return (v.engagements / totals[si]) * 100
  }

  const maxShare = Math.max(...entityIds.flatMap(id => segments.map((_, i) => share(id, i) ?? 0)), 10)
  const yMax = Math.min(Math.ceil(maxShare / 10) * 10 + 10, 100)

  const W = 560, H = 218, PL = 36, PR = 118, PT = 10, PB = 34
  const pw = W - PL - PR, ph = H - PT - PB
  const x = (i: number) => segments.length === 1 ? PL + pw / 2 : PL + (i * pw) / (segments.length - 1)
  const y = (v: number) => PT + ph * (1 - v / yMax)

  // Direct labels at line ends, nudged apart when they collide
  const ends = entityIds
    .map(id => ({ id, v: share(id, segments.length - 1) }))
    .filter((e): e is { id: string; v: number } => e.v !== null)
    .sort((a, b) => b.v - a.v)
  const labelY: Record<string, number> = {}
  let prev = -Infinity
  for (const e of ends) {
    let ly = y(e.v)
    if (ly - prev < 14) ly = prev + 14
    labelY[e.id] = ly
    prev = ly
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Share of voice over time">
      {Array.from({ length: yMax / 10 + 1 }, (_, i) => i * 10).filter(g => g % 20 === 0).map(g => (
        <g key={g}>
          <line x1={PL} y1={y(g)} x2={W - PR} y2={y(g)} stroke="#e1e0d9" strokeWidth="1" />
          <text x={PL - 6} y={y(g) + 3.5} textAnchor="end" fontSize="10" fill="#898781">{g}%</text>
        </g>
      ))}
      {segments.map((seg, i) => {
        const anchor = i === 0 ? 'start' : i === segments.length - 1 ? 'end' : 'middle'
        const tx = i === 0 ? Math.max(x(i) - 30, 2) : i === segments.length - 1 ? x(i) + 6 : x(i)
        return (
          <text key={seg.key} x={tx} y={H - 18} textAnchor={anchor} fontSize="10" fill="#898781">
            <title>{fmtDate(seg.start)} – {fmtDate(seg.end)}</title>
            <tspan x={tx}>{seg.labelTop}</tspan>
            <tspan x={tx} dy="11" fontSize="9" fill="#b0aea7">{seg.labelBottom}</tspan>
          </text>
        )
      })}
      {entityIds.map(id => {
        const pts = segments
          .map((_, i) => ({ i, v: share(id, i) }))
          .filter((p): p is { i: number; v: number } => p.v !== null)
        if (pts.length === 0) return null
        const color = entityColor(id)
        const line = pts.map(p => `${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')
        return (
          <g key={id}>
            {pts.length > 1 && <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />}
            {pts.map(p => (
              <circle key={p.i} cx={x(p.i)} cy={y(p.v)} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5">
                <title>{`${id} · ${segments[p.i].labelTop}: ${p.v.toFixed(0)}% of tracked engagement`}</title>
              </circle>
            ))}
          </g>
        )
      })}
      {ends.map(e => {
        const entity = entityById(data, e.id)
        return (
          <text key={e.id} x={W - PR + 8} y={labelY[e.id] + 3.5} fontSize="11" fontWeight="600" fill="#0b0b0b">
            <tspan fill={entityColor(e.id)}>●</tspan> {entity ? entityLabel(entity) : e.id} {e.v.toFixed(0)}%
          </text>
        )
      })}
    </svg>
  )
}

export function ShareOfVoice({ data }: { data: SignalDataset }) {
  const social = data.social ?? []
  if (social.length === 0) {
    return (
      <p className="text-xs text-gray-400">
        No social data yet. Import the LinkedIn competitor analytics export (.xlsx) in the{' '}
        <a href="/admin/moba-signal" className="text-brand underline">collection console</a>.
      </p>
    )
  }

  const segments = deriveSegments(data)
  const entityIds = [...new Set(social.map(s => s.entityId))]
  const anyDerived = segments.some(s => s.derived)

  // Most recent segment: absolute numbers under the chart
  const last = segments[segments.length - 1]
  const rows = [...last.values.entries()]
    .map(([entityId, v]) => ({ entityId, ...v }))
    .sort((a, b) => b.engagements - a.engagements)

  return (
    <div>
      <ShareChart data={data} segments={segments} entityIds={entityIds} />
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs min-w-[380px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="py-1 pr-3 font-medium">Latest · {last.labelTop} ({last.labelBottom})</th>
              <th className="py-1 pr-3 font-medium text-right">Posts</th>
              <th className="py-1 pr-3 font-medium text-right">Engagem.</th>
              <th className="py-1 pr-3 font-medium text-right">Eng./post</th>
              <th className="py-1 font-medium text-right">New foll.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const e = entityById(data, r.entityId)
              const isMoba = e?.ownership.kind === 'moba' || r.entityId === 'moba'
              return (
                <tr key={r.entityId} className={`border-b border-gray-50 last:border-0 ${isMoba ? 'bg-brand/5' : ''}`}>
                  <td className="py-1.5 pr-3">
                    <span className="inline-flex items-center gap-1.5 text-gray-800">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entityColor(r.entityId) }} />
                      <span className={isMoba ? 'font-semibold' : ''}>{e ? entityLabel(e) : r.entityId}</span>
                    </span>
                  </td>
                  <td className="py-1.5 pr-3 text-right tabular-nums text-gray-700">{r.posts}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums text-gray-700">{r.engagements.toLocaleString('en-US')}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums text-gray-700">{r.posts > 0 ? Math.round(r.engagements / r.posts) : 0}</td>
                  <td className="py-1.5 text-right tabular-nums text-gray-700">{r.newFollowers.toLocaleString('en-US')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Share = an entity&rsquo;s percentage of all LinkedIn engagement in the tracked set per time segment.
        Pages roll up per entity, namesake pages excluded.
        {anyDerived && ' Nested export windows (15/30/90/365 days ending the same day) are differenced into non-overlapping segments, so each point covers its own slice of time.'}
        {' '}Monthly imports extend the lines to the right.
      </p>
    </div>
  )
}
