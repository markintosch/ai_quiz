'use client'

// ─── Moba on Meta: owned-channel context ─────────────────────────────────────
// Moba's own Facebook and Instagram insights from the Business Suite export.
// Real imported numbers in every mode, labelled as such. Context, not
// competition: it shows when Moba's own audience pays attention, which is
// the yardstick for reading a competitor's share of voice.
//
// Form: the headline is a sentence, the totals are stat tiles, and the one
// chart is weekly views as single-series bars (one axis, no legend needed:
// the title names the series). Other metrics stay in tiles rather than
// sharing a second scale. The three biggest weeks are labelled from the data
// itself. Trade shows are deliberately not overlaid: the event calendar is
// still sample content, and this card shows real data only.

import { useMemo, useState } from 'react'
import type { OwnedDaily } from '@/products/moba_signal/types'
import { fmtDate } from '@/products/moba_signal/selectors'
import { LEVEL_METRICS, META_METRIC_LABELS, metricLabel } from '@/lib/signal/meta'

type Metric = string

const PLATFORM_LABEL: Record<OwnedDaily['platform'], string> = {
  facebook: 'Facebook', instagram: 'Instagram', meta: 'Facebook + Instagram',
}

const DAY = 86_400_000
const ms = (iso: string) => Date.parse(iso + 'T00:00:00Z')
const iso = (t: number) => new Date(t).toISOString().slice(0, 10)
const nf = (n: number) => n.toLocaleString('en-GB')
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function median(v: number[]): number {
  if (v.length === 0) return 0
  const s = [...v].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** Monday of the ISO week, as an ISO date. */
function weekOf(day: string): string {
  const t = ms(day)
  const wd = (new Date(t).getUTCDay() + 6) % 7
  return iso(t - wd * DAY)
}

interface Series { platforms: Set<OwnedDaily['platform']>; byDay: Map<string, number> }

function buildSeries(rows: OwnedDaily[]): Record<Metric, Series | undefined> {
  const out: Record<Metric, Series | undefined> = {}
  for (const r of rows) {
    const s = out[r.metric] ?? { platforms: new Set<OwnedDaily['platform']>(), byDay: new Map<string, number>() }
    s.platforms.add(r.platform)
    s.byDay.set(r.day, (s.byDay.get(r.day) ?? 0) + r.value)
    out[r.metric] = s
  }
  return out
}

function platformLabel(s: Series): string {
  const p = [...s.platforms]
  if (p.includes('meta') || (p.includes('facebook') && p.includes('instagram'))) return PLATFORM_LABEL.meta
  return PLATFORM_LABEL[p[0]]
}

/** For a level metric (total followers): the last value on or before a day. */
function levelAt(s: Series, beforeT: number): number | null {
  let best: [number, number] | null = null
  for (const [d, v] of s.byDay) { const t = ms(d); if (t < beforeT && (!best || t > best[0])) best = [t, v] }
  return best ? best[1] : null
}

function windowSum(s: Series | undefined, from: number, to: number): number {
  if (!s) return 0
  let n = 0
  for (const [d, v] of s.byDay) { const t = ms(d); if (t >= from && t < to) n += v }
  return n
}

function Delta({ now, before }: { now: number; before: number }) {
  if (before === 0) return <span className="text-[11px] text-gray-400">no prior period</span>
  const pct = Math.round(((now - before) / before) * 100)
  const up = pct >= 0
  return (
    <span className={`block text-[11px] font-semibold ${up ? 'text-emerald-700' : 'text-red-600'}`}>
      <span aria-hidden>{up ? '▲' : '▼'}</span> {Math.abs(pct)}% <span className="font-normal text-gray-400">last 30 days</span>
    </span>
  )
}

export function OwnedSocial({ rows }: { rows: OwnedDaily[] }) {
  const [hover, setHover] = useState<number | null>(null)

  const model = useMemo(() => {
    if (rows.length === 0) return null
    const series = buildSeries(rows)
    const days = [...new Set(rows.map(r => r.day))].sort()
    const first = days[0]
    const last = days[days.length - 1]
    const end = ms(last) + DAY
    const l30 = [end - 30 * DAY, end] as const
    const p30 = [end - 60 * DAY, end - 30 * DAY] as const

    const main: Metric = ['views', 'reach', 'impressions', 'interactions'].find(m => series[m])
      ?? Object.keys(series).find(m => !LEVEL_METRICS.has(m)) ?? Object.keys(series)[0]
    const ms0 = series[main]!

    // Weekly buckets of the main metric (and interactions for the tooltip)
    const weeks = new Map<string, { views: number; inter: number; days: number }>()
    for (const d of days) {
      const w = weekOf(d)
      const b = weeks.get(w) ?? { views: 0, inter: 0, days: 0 }
      b.views += ms0.byDay.get(d) ?? 0
      b.inter += series.interactions?.byDay.get(d) ?? 0
      b.days += 1
      weeks.set(w, b)
    }
    const weekList = [...weeks.entries()].map(([start, b]) => ({ start, ...b }))

    // Drivers
    const values = [...ms0.byDay.values()]
    const med = median(values)
    const sorted = [...values].sort((a, b) => b - a)
    const topN = Math.max(1, Math.round(sorted.length / 10))
    const total = values.reduce((a, b) => a + b, 0)
    const concentration = total ? Math.round((sorted.slice(0, topN).reduce((a, b) => a + b, 0) / total) * 100) : 0

    const byWd = new Map<number, number[]>()
    for (const [d, v] of ms0.byDay) { const k = new Date(ms(d)).getUTCDay(); byWd.set(k, [...(byWd.get(k) ?? []), v]) }
    const wdMean = [...byWd.entries()].map(([k, v]) => ({ k, mean: v.reduce((a, b) => a + b, 0) / v.length }))
    const meanOf = (ks: number[]) => { const m = wdMean.filter(w => ks.includes(w.k)); return m.reduce((a, b) => a + b.mean, 0) / Math.max(1, m.length) }
    const weekendRatio = meanOf([2, 3, 4]) ? meanOf([0, 6]) / meanOf([2, 3, 4]) : null
    const bestWd = [...wdMean].sort((a, b) => b.mean - a.mean)[0]

    // The biggest weeks, read from the data itself
    const peaks = [...weekList].filter(w => w.days === 7).sort((a, b) => b.views - a.views).slice(0, 3)
    const typicalWeek = median(weekList.filter(w => w.days === 7).map(w => w.views))
    const peakShare = total ? Math.round((peaks.reduce((a, b) => a + b.views, 0) / total) * 100) : 0

    const visits = series.visits ? [...series.visits.byDay.values()].reduce((a, b) => a + b, 0) : 0
    const clicks = series.link_clicks ? [...series.link_clicks.byDay.values()].reduce((a, b) => a + b, 0) : 0

    const mainNow = windowSum(ms0, ...l30)
    const mainBefore = windowSum(ms0, ...p30)
    const change = mainBefore ? Math.round(((mainNow - mainBefore) / mainBefore) * 100) : null

    return { series, first, last, l30, p30, main, weekList, med, concentration, bestWd, weekendRatio, peaks, typicalWeek, peakShare, visits, clicks, change }
  }, [rows])

  if (!model) {
    return (
      <p className="text-xs text-gray-500">
        No Meta export imported yet. Export the daily insights for Moba&rsquo;s pages from Meta Business Suite and
        import the CSVs in the Signal admin console. The card then shows how Moba&rsquo;s own audience responds.
      </p>
    )
  }

  const { series, weekList, peaks } = model
  const mainLabel = metricLabel(model.main).toLowerCase()
  // Known metrics as tiles in a fixed order; unfamiliar titles listed below them.
  const tiles = Object.keys(META_METRIC_LABELS).filter(m => series[m]).map(m => ({ metric: m, label: metricLabel(m) }))
  const others = Object.keys(series).filter(m => m.startsWith('other:'))

  // ── Chart geometry ──
  const W = 640, H = 150, PAD_L = 4, PAD_B = 18, PAD_T = 22
  const maxV = Math.max(1, ...weekList.map(w => w.views))
  const slot = (W - PAD_L) / weekList.length
  const barW = Math.max(2, slot - 2) // 2px surface gap between bars
  const y = (v: number) => PAD_T + (H - PAD_T - PAD_B) * (1 - v / maxV)
  const x = (i: number) => PAD_L + i * slot
  const peakIdx = new Set(peaks.map(p => weekList.indexOf(p)))
  const shortDate = (d: string) => new Date(ms(d)).toLocaleString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const months = weekList
    .map((w, i) => ({ i, d: new Date(ms(w.start)) }))
    .filter((m, idx, arr) => idx === 0 || m.d.getUTCMonth() !== arr[idx - 1].d.getUTCMonth())
  const hw = hover !== null ? weekList[hover] : null

  const headline = [
    `Moba's audience shows up in bursts: the three biggest weeks carried ${model.peakShare}% of the year's ${mainLabel}.`,
    model.change !== null
      ? `The last 30 days are ${model.change >= 0 ? 'up' : 'down'} ${Math.abs(model.change)}% on the 30 before.`
      : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-900 leading-snug">{headline}</p>

      <div className="grid grid-cols-2 gap-2">
        {tiles.map(t => {
          const s = series[t.metric]!
          const level = LEVEL_METRICS.has(t.metric)
          const total = level ? (levelAt(s, model.l30[1]) ?? 0) : [...s.byDay.values()].reduce((a, b) => a + b, 0)
          return (
            <div key={t.metric} className="rounded-lg border border-gray-200 px-3 py-2 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 leading-tight">{t.label}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{platformLabel(s)}{level ? ', latest' : ''}</p>
              <p className="text-lg font-bold text-gray-900 tabular-nums leading-tight">{nf(total)}</p>
              {level
                ? <Delta now={total} before={levelAt(s, model.l30[0]) ?? 0} />
                : <Delta now={windowSum(s, ...model.l30)} before={windowSum(s, ...model.p30)} />}
            </div>
          )
        })}
      </div>

      {others.length > 0 && (
        <p className="text-[11px] text-gray-500">
          <span className="font-semibold text-gray-700">Also imported:</span>{' '}
          {others.map(m => {
            const sm = series[m]!
            return `${metricLabel(m)} (${platformLabel(sm)}, ${nf([...sm.byDay.values()].reduce((a, b) => a + b, 0))})`
          }).join(' · ')}
        </p>
      )}

      <div>
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <p className="text-[11px] font-semibold text-gray-700">
            Weekly {mainLabel} · {platformLabel(series[model.main]!)}
          </p>
          <p className="text-[11px] text-gray-500 tabular-nums h-4">
            {hw ? `Week of ${fmtDate(hw.start)}: ${nf(hw.views)} ${mainLabel}${series.interactions ? `, ${nf(hw.inter)} interactions` : ''}` : 'Hover a week for its numbers'}
          </p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
          aria-label={`Weekly ${mainLabel} from ${fmtDate(model.first)} to ${fmtDate(model.last)}, peak ${nf(maxV)}`}
          onMouseLeave={() => setHover(null)}>
          <line x1={PAD_L} x2={W} y1={H - PAD_B} y2={H - PAD_B} className="stroke-gray-200" strokeWidth={1} />
          {weekList.map((w, i) => {
            const top = y(w.views)
            const h = Math.max(1, H - PAD_B - top)
            const r = Math.min(4, barW / 2, h)
            const x0 = x(i), x1 = x0 + barW, yb = H - PAD_B
            // 4px rounded data-end, square at the baseline
            const d = `M${x0},${yb} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x1 - r} Q${x1},${top} ${x1},${top + r} V${yb} Z`
            return (
              <g key={w.start} onMouseEnter={() => setHover(i)}>
                <rect x={x0 - 1} y={0} width={slot} height={H} fill="transparent" />
                <path d={d} className={hover === i ? 'fill-brand-dark' : 'fill-brand'} opacity={hover === null || hover === i ? 1 : 0.55} />
                {peakIdx.has(i) && (
                  <text x={x0 + barW / 2} y={top - 5} textAnchor="middle" className="fill-gray-600" fontSize={9}>{shortDate(w.start)}</text>
                )}
              </g>
            )
          })}
          {months.map(m => (
            <text key={m.i} x={x(m.i)} y={H - 4} className="fill-gray-400" fontSize={9}>
              {m.d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })}
            </text>
          ))}
        </svg>
        <p className="text-[10px] text-gray-400 mt-0.5">Labelled: the three biggest weeks, by week start.</p>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">What drives it</p>
        <ul className="space-y-1.5 text-xs text-gray-700">
          <li className="flex gap-2"><span className="text-brand-accent" aria-hidden>■</span>
            <span>Biggest weeks against a typical week ({nf(Math.round(model.typicalWeek))} {mainLabel}):{' '}
              {peaks.map(p => `${fmtDate(p.start)} ${(p.views / Math.max(1, model.typicalWeek)).toFixed(1)}×`).join(', ')}. Check what Moba posted or attended those weeks: that is the content to repeat.</span></li>
          <li className="flex gap-2"><span className="text-brand-accent" aria-hidden>■</span>
            <span>The top 10% of days carry {model.concentration}% of all {mainLabel}: attention comes in bursts around posts and events, not as a steady stream.</span></li>
          {model.bestWd && (
            <li className="flex gap-2"><span className="text-brand-accent" aria-hidden>■</span>
              <span>{WEEKDAYS[model.bestWd.k]} is the strongest day on average{model.weekendRatio !== null ? `; weekends run at ${Math.round(model.weekendRatio * 100)}% of midweek` : ''}.</span></li>
          )}
          {model.visits > 0 && series.link_clicks && (
            <li className="flex gap-2"><span className="text-brand-accent" aria-hidden>■</span>
              <span>{nf(model.clicks)} link clicks from {nf(model.visits)} page visits ({((model.clicks / model.visits) * 100).toFixed(1)}%): the page builds attention but sends little traffic on to moba.net.</span></li>
          )}
        </ul>
      </div>

      <p className="text-[10px] text-gray-400 border-t border-gray-100 pt-2">
        Real data: Meta Business Suite export for Moba&rsquo;s own pages, {fmtDate(model.first)} to {fmtDate(model.last)}.
        Shown in every mode, also when the rest of the page uses sample data.
      </p>
    </div>
  )
}
