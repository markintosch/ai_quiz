'use client'

// ─── Tier 3: the timeline, the spine of the product ──────────────────────────
// Horizontal, 24 months, one lane per competitor group plus a Moba lane.
// Group rollup applies: a Staalkat item plots in the Sanovo lane. Event types
// are colour-coded; clicking a point opens the source and annotations.
//
// A "Trade events" context band runs along the same time axis: the shows that
// drive announcement clusters (VIV, SPACE, EuroTier, IPPE …). A faint guide
// line drops from each event down through the lanes, so a burst of competitor
// news can be read against the event that produced it. Because the event radar
// looks forward (T-90 to T+30), the right edge extends past today when
// upcoming events exist, with today marked in place.

import { useMemo, useState } from 'react'
import type { Signal, SignalDataset, SignalType, TradeEvent } from '@/products/moba_signal/types'
import { SIGNAL_TYPE_LABELS } from '@/products/moba_signal/types'
import { band, entityById, entityLabel, eventPhase, laneEntityId, fmtDate, fmtMonth } from '@/products/moba_signal/selectors'

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

const DAY = 86_400_000

function monthsBack(asOf: string, months: number): string {
  const d = new Date(asOf + 'T00:00:00Z')
  d.setUTCMonth(d.getUTCMonth() - months)
  return d.toISOString().slice(0, 10)
}

const eventMid = (e: TradeEvent) => (Date.parse(e.startDate) + Date.parse(e.endDate)) / 2

export function Timeline({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const [range, setRange] = useState<number>(24)
  const [laneFilter, setLaneFilter] = useState<string | null>(null)
  const [showEvents, setShowEvents] = useState(true)

  const from = monthsBack(data.asOf, range)
  const fromMs = Date.parse(from)
  const todayMs = Date.parse(data.asOf)

  // Extend the right edge to cover upcoming trade events (capped), so news and
  // the events that drive it share one axis. No future events → today is the edge.
  const events = data.events ?? []
  const futureEnds = events.map(e => Date.parse(e.endDate)).filter(ms => ms > todayMs)
  const horizonMs = showEvents && futureEnds.length
    ? Math.min(Math.max(...futureEnds) + 3 * DAY, todayMs + 130 * DAY)
    : todayMs
  const toMs = Math.max(todayMs, horizonMs)

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
  const pctMs = (ms: number) => ((ms - fromMs) / (toMs - fromMs)) * 100
  const todayPct = pctMs(todayMs)
  const labelEvery = range === 24 ? 3 : range === 12 ? 2 : 1

  // Events inside the visible window, filtered by the lane focus when set
  const windowEvents = useMemo(() => events
    .filter(e => Date.parse(e.endDate) >= fromMs && Date.parse(e.startDate) <= toMs)
    .filter(e => !laneFilter || e.competitors.some(c => laneEntityId(data, c.entityId) === laneFilter))
    .sort((a, b) => eventMid(a) - eventMid(b)),
  [events, fromMs, toMs, laneFilter, data])

  // Label thinning: in a tight cluster, keep every diamond but only label ones
  // far enough apart to stay legible; the rest carry their name on hover.
  const labelled = useMemo(() => {
    const keep = new Set<string>()
    let last = -Infinity
    for (const ev of windowEvents) {
      const x = pctMs(eventMid(ev))
      if (x - last >= 4.5) { keep.add(ev.id); last = x }
    }
    return keep
  }, [windowEvents, fromMs, toMs])

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
        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <button
              onClick={() => setShowEvents(v => !v)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                showEvents ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/30' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
              title="Show the trade-event context band"
            >
              {showEvents ? '◆ Events on' : '◇ Events off'}
            </button>
          )}
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
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* ── Trade-event context band ── */}
          {showEvents && windowEvents.length > 0 && (
            <div className="flex items-start gap-3 pb-2 mb-1 border-b border-gray-200">
              <div className="w-36 shrink-0 text-[11px] font-semibold text-gray-500 pt-1">
                Trade events
                <span className="block text-[10px] font-normal text-gray-400">{windowEvents.length} in view</span>
              </div>
              <div className="relative h-[86px] flex-1">
                {/* upcoming region: everything right of today has not happened yet */}
                {todayPct < 100 && (
                  <div className="absolute top-0 bottom-0 bg-brand-accent/[0.04] border-l border-dashed border-brand-accent/20"
                    style={{ left: `${todayPct}%`, right: 0 }} />
                )}
                {months.map(m => (
                  <div key={m} className="absolute top-0 bottom-0 w-px bg-gray-100" style={{ left: `${pct(m)}%` }} />
                ))}
                <div className="absolute top-0 bottom-0 w-0.5 bg-brand-accent/40" style={{ left: `${todayPct}%` }} />
                {windowEvents.map(ev => {
                  const x = pctMs(eventMid(ev))
                  const tracked = ev.competitors.filter(c => entityById(data, c.entityId))
                  const has = tracked.length > 0
                  const phase = eventPhase(data, ev.startDate, ev.endDate)
                  const names = tracked.map(c => { const e = entityById(data, c.entityId); return e ? entityLabel(e) : c.entityId })
                  const tip = `${ev.name} · ${fmtDate(ev.startDate)}${ev.endDate !== ev.startDate ? `–${fmtDate(ev.endDate)}` : ''}\n${ev.location}, ${ev.country} · ${phase.stage} (${phase.note})\nMoba ${ev.mobaExhibiting ? 'exhibiting' : 'not exhibiting'}${names.length ? `\nTracked: ${names.join(', ')}` : ''}${ev.notes ? `\n${ev.notes}` : ''}`
                  return (
                    <div key={ev.id} className="absolute top-0" style={{ left: `${x}%`, zIndex: labelled.has(ev.id) ? 2 : 1 }} title={tip}>
                      {/* stem from the diamond down to the lane divider */}
                      <div className="absolute top-[10px] -translate-x-1/2 w-px bg-gray-300" style={{ height: 76 }} />
                      <div className={`absolute top-1 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border border-white ${has ? 'bg-brand-accent' : 'bg-gray-300'} ${ev.mobaExhibiting ? 'ring-1 ring-brand/40' : ''}`} />
                      {labelled.has(ev.id) && (
                        <span
                          className="absolute text-[9px] leading-tight text-gray-500 whitespace-nowrap"
                          style={x > 82
                            ? { top: 15, right: 3, transformOrigin: 'top right', transform: 'rotate(-28deg)', textAlign: 'right' }
                            : { top: 15, left: 3, transformOrigin: 'top left', transform: 'rotate(28deg)' }}
                        >
                          {ev.name}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
                <div className={`relative h-8 flex-1 rounded overflow-hidden ${isMoba ? 'bg-brand/5' : 'bg-gray-50'}`}>
                  {showEvents && todayPct < 100 && (
                    <div className="absolute top-0 bottom-0 bg-brand-accent/[0.03]" style={{ left: `${todayPct}%`, right: 0 }} />
                  )}
                  {months.map(m => (
                    <div key={m} className="absolute top-0 bottom-0 w-px bg-gray-200/70" style={{ left: `${pct(m)}%` }} />
                  ))}
                  {/* event guide lines: relate a news cluster to the show that drove it */}
                  {showEvents && windowEvents.map(ev => (
                    <div key={`g-${ev.id}`} className="absolute top-0 bottom-0 w-px bg-brand-accent/15" style={{ left: `${pctMs(eventMid(ev))}%` }} />
                  ))}
                  {/* now marker */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-brand-accent/50" style={{ left: `${todayPct}%` }} />
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
                i % labelEvery === 0 && Math.abs(pct(m) - todayPct) > 4 ? (
                  <span key={m} className="absolute text-[10px] text-gray-400 -translate-x-1/2" style={{ left: `${pct(m)}%` }}>
                    {fmtMonth(m.slice(0, 7))}
                  </span>
                ) : null
              ))}
              <span className="absolute text-[10px] font-semibold text-brand-accent -translate-x-1/2" style={{ left: `${todayPct}%` }}>today</span>
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
        {showEvents && windowEvents.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rotate-45 bg-brand-accent" />
            Trade event (tracked competitor present)
          </span>
        )}
      </div>
    </div>
  )
}
