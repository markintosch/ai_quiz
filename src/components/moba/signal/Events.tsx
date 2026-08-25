'use client'

// ─── Tier 7: event radar ──────────────────────────────────────────────────────
// The predictive module: exhibitor lists publish weeks ahead. Two halves:
// UPCOMING events with their watch notes and Moba/competitor presence, and a
// PAST-EDITIONS timeline beneath so the show cadence and its follow-on news
// read together. Rolling calendar, Moba presence marked, stand-size deltas as
// investment signals, and the attendance-gap flag.

import type { SignalDataset } from '@/products/moba_signal/types'
import { entityById, entityLabel, eventPhase, fmtDate, relTime, relUntil } from '@/products/moba_signal/selectors'
import { EventStrip } from './viz'

export function Events({ data }: { data: SignalDataset }) {
  const events = [...data.events]
  const upcoming = events
    .filter(ev => ev.endDate >= data.asOf)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  const past = events
    .filter(ev => ev.endDate < data.asOf)
    .sort((a, b) => b.startDate.localeCompare(a.startDate)) // most recent first

  return (
    <div className="space-y-4">
      {/* ── Upcoming: the forward radar ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Upcoming</h3>
          <span className="text-[11px] text-gray-300">{upcoming.length}</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        {upcoming.length > 0 && (
          <EventStrip
            asOf={data.asOf}
            events={upcoming.map(ev => ({
              id: ev.id,
              name: ev.name,
              startDate: ev.startDate,
              mobaExhibiting: ev.mobaExhibiting,
              gap: !ev.mobaExhibiting && ev.competitors.some(c => entityById(data, c.entityId)?.priority),
              competitors: ev.competitors.length,
            }))}
          />
        )}
        {upcoming.map(ev => {
          const phase = eventPhase(data, ev.startDate, ev.endDate)
          const priorityCount = ev.competitors.filter(c => entityById(data, c.entityId)?.priority).length
          const gap = !ev.mobaExhibiting && priorityCount >= 1
          return (
            <div key={ev.id} className={`rounded-xl border p-4 bg-white ${gap ? 'border-amber-300' : 'border-gray-100'}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{ev.name}</h4>
                  <p className="text-xs text-gray-400">
                    {ev.location}, {ev.country} · {fmtDate(ev.startDate)} – {fmtDate(ev.endDate)}
                    <span className="ml-1.5 font-semibold text-gray-600">{relUntil(ev.startDate, data.asOf)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200" title={phase.note}>
                    {phase.stage} · {phase.note}
                  </span>
                  {ev.mobaExhibiting ? (
                    <span className="px-2 py-0.5 rounded-full border bg-brand/5 text-brand border-brand/20 font-medium">Moba exhibits</span>
                  ) : gap ? (
                    <span className="px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 font-medium">Attendance gap</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full border bg-gray-50 text-gray-400 border-gray-200">Monitored</span>
                  )}
                </div>
              </div>

              {ev.competitors.length > 0 && (
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {ev.competitors.map(c => {
                    const e = entityById(data, c.entityId)
                    const grew = c.standSqm != null && c.standSqmLastEdition != null && c.standSqm > c.standSqmLastEdition
                    return (
                      <li key={c.entityId} className="text-[11px] px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-600">
                        {e ? entityLabel(e) : c.entityId}
                        {c.standSqm != null && (
                          <span className={grew ? 'text-red-600 font-medium' : 'text-gray-400'}>
                            {' '}· {c.standSqm} m²
                            {c.standSqmLastEdition != null && ` (was ${c.standSqmLastEdition})`}
                          </span>
                        )}
                        {c.sessions?.map(s => <span key={s} className="text-purple-600"> · session: {s}</span>)}
                      </li>
                    )
                  })}
                </ul>
              )}
              {ev.notes && (
                <p className="text-[11px] mt-2">
                  <span className="font-semibold text-brand-accent">Watch:</span>{' '}
                  <span className="text-gray-500">{ev.notes}</span>
                </p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">Exhibitor list: {ev.exhibitorListStatus.replace('-', ' ')}.</p>
            </div>
          )
        })}
        {upcoming.length === 0 && <p className="text-sm text-gray-400">No upcoming events on the radar.</p>}
      </div>

      {/* ── Past editions: the cadence beneath ── */}
      {past.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Recent editions</h3>
            <span className="text-[11px] text-gray-300">{past.length}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <ol className="relative border-l border-gray-200 ml-1.5 space-y-3">
            {past.map(ev => {
              const tracked = ev.competitors.filter(c => entityById(data, c.entityId))
              const grewAny = ev.competitors.some(c => c.standSqm != null && c.standSqmLastEdition != null && c.standSqm > c.standSqmLastEdition)
              return (
                <li key={ev.id} className="ml-4">
                  <span className={`absolute -left-[5px] w-2.5 h-2.5 rounded-full border-2 border-white ${tracked.length ? 'bg-brand-accent' : 'bg-gray-300'}`} />
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-medium text-gray-800">{ev.name}</span>
                    <span className="text-[11px] text-gray-400">{ev.location}, {ev.country}</span>
                    <span className="text-[11px] text-gray-400 ml-auto whitespace-nowrap">
                      {fmtDate(ev.startDate)} · {relTime(ev.startDate, data.asOf)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {ev.mobaExhibiting && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-brand/5 text-brand border-brand/20">Moba</span>
                    )}
                    {tracked.map(c => {
                      const e = entityById(data, c.entityId)
                      const grew = c.standSqm != null && c.standSqmLastEdition != null && c.standSqm > c.standSqmLastEdition
                      return (
                        <span key={c.entityId} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${grew ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {e ? entityLabel(e) : c.entityId}{c.standSqm != null ? ` ${c.standSqm}m²` : ''}
                        </span>
                      )
                    })}
                    {tracked.length === 0 && (
                      <span className="text-[10px] text-gray-400">exhibitor list {ev.exhibitorListStatus.replace('-', ' ')}</span>
                    )}
                  </div>
                  {ev.notes && <p className="text-[11px] text-gray-400 mt-0.5">{ev.notes}</p>}
                  {grewAny && <p className="text-[10px] text-red-600 mt-0.5">A tracked competitor grew its stand here.</p>}
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <p className="text-[11px] text-gray-400">
        Stand size is a budget decision made six months ahead. Growth tells you where a competitor
        intends to win, well before any win is announced. Past editions show the cadence a news
        cluster usually trails.
      </p>
    </div>
  )
}
