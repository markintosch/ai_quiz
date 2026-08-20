'use client'

// ─── Share of voice: LinkedIn competitor analytics ────────────────────────────
// Series data, so it lives in its own module, never in the signal feed. One
// row per entity for the latest period, with proportional bars inside the
// table (magnitude comparison across few entities; every mark carries its
// number, colour follows the entity). Trend arrives once 2+ periods exist.

import type { SignalDataset, SocialStat } from '@/products/moba_signal/types'
import { entityById, entityLabel, entityColor, fmtDate } from '@/products/moba_signal/selectors'

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="h-2.5 rounded-sm" style={{
        width: `${Math.max((value / Math.max(max, 1)) * 64, value > 0 ? 3 : 1)}px`,
        backgroundColor: value > 0 ? color : '#e1e0d9',
      }} />
      <span className="text-xs text-gray-700 tabular-nums">{value.toLocaleString('en-US')}</span>
    </div>
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

  // Latest period per entity; earlier periods feed the delta later
  const latestEnd = social.map(s => s.periodEnd).sort().pop()!
  const latest = social.filter(s => s.periodEnd === latestEnd)
  const periods = new Set(social.map(s => `${s.periodStart}|${s.periodEnd}`)).size
  const rows = [...latest].sort((a, b) => b.engagements - a.engagements)
  const start = latest[0]?.periodStart

  const max = {
    posts: Math.max(...rows.map(r => r.posts), 1),
    engagements: Math.max(...rows.map(r => r.engagements), 1),
    newFollowers: Math.max(...rows.map(r => r.newFollowers), 1),
  }

  const perPost = (r: SocialStat) => (r.posts > 0 ? Math.round(r.engagements / r.posts) : 0)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="py-1.5 pr-3 font-medium">LinkedIn page(s)</th>
              <th className="py-1.5 pr-3 font-medium">Posts</th>
              <th className="py-1.5 pr-3 font-medium">Engagements</th>
              <th className="py-1.5 pr-3 font-medium">Eng./post</th>
              <th className="py-1.5 font-medium">New followers</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const e = entityById(data, r.entityId)
              const isMoba = e?.ownership.kind === 'moba' || r.entityId === 'moba'
              const color = entityColor(r.entityId)
              return (
                <tr key={r.entityId} className={`border-b border-gray-50 last:border-0 ${isMoba ? 'bg-brand/5' : ''}`}>
                  <td className="py-2 pr-3">
                    <span className="inline-flex items-center gap-1.5 text-gray-800">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className={isMoba ? 'font-semibold' : ''}>{e ? entityLabel(e) : r.entityId}</span>
                    </span>
                    <span className="block text-[10px] text-gray-400 ml-3.5">{r.followers.toLocaleString('en-US')} followers</span>
                  </td>
                  <td className="py-2 pr-3"><Bar value={r.posts} max={max.posts} color={color} /></td>
                  <td className="py-2 pr-3"><Bar value={r.engagements} max={max.engagements} color={color} /></td>
                  <td className="py-2 pr-3 text-xs text-gray-700 tabular-nums">{perPost(r)}</td>
                  <td className="py-2"><Bar value={r.newFollowers} max={max.newFollowers} color={color} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Period {start ? fmtDate(start) : '—'} – {fmtDate(latestEnd)} · pages rolled up per entity, namesake pages excluded ·{' '}
        {periods > 1 ? `${periods} periods stored, trend view unlocks with the next import` : 'one period stored so far: import monthly to build the trend'}
      </p>
    </div>
  )
}
