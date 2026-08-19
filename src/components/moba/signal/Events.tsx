'use client'

// ─── Tier 7: event radar ──────────────────────────────────────────────────────
// The only predictive module: exhibitor lists publish weeks ahead. Rolling
// 12-month calendar, Moba presence marked, stand-size deltas as investment
// signals, and the attendance gap flag.

import type { SignalDataset } from '@/products/moba_signal/types'
import { entityById, entityLabel, eventPhase, fmtDate } from '@/products/moba_signal/selectors'

export function Events({ data }: { data: SignalDataset }) {
  const events = [...data.events].sort((a, b) => a.startDate.localeCompare(b.startDate))
  return (
    <div className="space-y-3">
      {events.map(ev => {
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
            <p className="text-[11px] text-gray-400 mt-2">
              Exhibitor list: {ev.exhibitorListStatus.replace('-', ' ')}.
              {ev.notes && <span className="text-gray-500"> {ev.notes}</span>}
            </p>
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">
        Stand size is a budget decision made six months ahead. Growth tells you where a competitor
        intends to win, well before any win is announced.
      </p>
    </div>
  )
}
