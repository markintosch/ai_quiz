'use client'

// ─── Share of voice: LinkedIn competitor analytics ────────────────────────────
// Chosen form: share-of-voice lines over time (Option A). Each imported
// period is one x-point; a line is an entity's percentage of ALL engagement
// in the tracked set for that period. LinkedIn only exports period totals,
// so the time axis accumulates one point per import: the 12-month baseline
// and the latest 30 days are the first two points, monthly imports extend
// the lines. Colour follows the entity; every line ends in a direct label;
// the detail table below carries the absolute numbers.

import type { SignalDataset, SocialStat } from '@/products/moba_signal/types'
import { entityById, entityLabel, entityColor, fmtDate } from '@/products/moba_signal/selectors'

interface Period {
  key: string
  start: string
  end: string
  spanDays: number
  label: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function periodLabel(start: string, end: string, spanDays: number): string {
  const d = new Date(end + 'T00:00:00Z')
  const m = `${MONTHS[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`
  if (spanDays > 45) return `${Math.round(spanDays / 30)} mo→${m}`
  return m
}

function ShareChart({ data, periods, entityIds }: {
  data: SignalDataset
  periods: Period[]
  entityIds: string[]
}) {
  const social = data.social ?? []
  const byKey = new Map(social.map(s => [`${s.entityId}|${s.periodStart}|${s.periodEnd}`, s]))
  const totals = periods.map(p =>
    entityIds.reduce((sum, id) => sum + (byKey.get(`${id}|${p.start}|${p.end}`)?.engagements ?? 0), 0))

  const share = (id: string, pi: number): number | null => {
    const s = byKey.get(`${id}|${periods[pi].start}|${periods[pi].end}`)
    if (!s || totals[pi] === 0) return null
    return (s.engagements / totals[pi]) * 100
  }

  const maxShare = Math.max(...entityIds.flatMap(id => periods.map((_, i) => share(id, i) ?? 0)), 10)
  const yMax = Math.min(Math.ceil(maxShare / 10) * 10 + 10, 100)

  const W = 560, H = 210, PL = 36, PR = 118, PT = 10, PB = 26
  const pw = W - PL - PR, ph = H - PT - PB
  const x = (i: number) => periods.length === 1 ? PL + pw / 2 : PL + (i * pw) / (periods.length - 1)
  const y = (v: number) => PT + ph * (1 - v / yMax)

  // Direct labels at line ends, nudged apart when they collide
  const ends = entityIds
    .map(id => ({ id, v: share(id, periods.length - 1) }))
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
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Share of voice per period">
      {Array.from({ length: yMax / 10 + 1 }, (_, i) => i * 10).filter(g => g % 20 === 0).map(g => (
        <g key={g}>
          <line x1={PL} y1={y(g)} x2={W - PR} y2={y(g)} stroke="#e1e0d9" strokeWidth="1" />
          <text x={PL - 6} y={y(g) + 3.5} textAnchor="end" fontSize="10" fill="#898781">{g}%</text>
        </g>
      ))}
      {periods.map((p, i) => (
        <text key={p.key} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#898781">
          <title>{fmtDate(p.start)} – {fmtDate(p.end)}</title>
          {p.label}
        </text>
      ))}
      {entityIds.map(id => {
        const pts = periods
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
                <title>{`${id} · ${periods[p.i].label}: ${p.v.toFixed(0)}% of tracked engagement`}</title>
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

  // Periods ordered by end date, longer window first on ties (baseline, then months)
  const periodMap = new Map<string, Period>()
  for (const s of social) {
    const key = `${s.periodStart}|${s.periodEnd}`
    if (!periodMap.has(key)) {
      const span = Math.round((Date.parse(s.periodEnd) - Date.parse(s.periodStart)) / 86_400_000)
      periodMap.set(key, { key, start: s.periodStart, end: s.periodEnd, spanDays: span, label: periodLabel(s.periodStart, s.periodEnd, span) })
    }
  }
  const periods = [...periodMap.values()].sort((a, b) =>
    a.end === b.end ? b.spanDays - a.spanDays : a.end.localeCompare(b.end))
  const entityIds = [...new Set(social.map(s => s.entityId))]

  // Latest period detail (absolute numbers under the chart)
  const last = periods[periods.length - 1]
  const latest = social.filter(s => s.periodStart === last.start && s.periodEnd === last.end)
  const rows = [...latest].sort((a, b) => b.engagements - a.engagements)
  const perPost = (r: SocialStat) => (r.posts > 0 ? Math.round(r.engagements / r.posts) : 0)

  return (
    <div>
      <ShareChart data={data} periods={periods} entityIds={entityIds} />
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs min-w-[380px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="py-1 pr-3 font-medium">Latest period · {last.label.replace('→', ' to ')}</th>
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
                  <td className="py-1.5 pr-3 text-right tabular-nums text-gray-700">{perPost(r)}</td>
                  <td className="py-1.5 text-right tabular-nums text-gray-700">{r.newFollowers.toLocaleString('en-US')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Share = an entity&rsquo;s percentage of all LinkedIn engagement in the tracked set per imported period.
        Pages roll up per entity, namesake pages excluded. A &ldquo;12 mo&rdquo; point is the yearly baseline window;
        each monthly import adds a point.
        {periods.length < 3 && ' Import monthly to extend the lines.'}
      </p>
    </div>
  )
}
