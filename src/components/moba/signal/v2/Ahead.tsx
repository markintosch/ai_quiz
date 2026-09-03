'use client'

// ─── V2: event decisions (review §14) ────────────────────────────────────────
// The event radar's flags, turned into workflow: an attendance gap is not a
// fact to note, it is a decision to make, with a named owner. The full radar
// with phases and stand sizes stays available beneath, as evidence.

import type { SignalDataset } from '@/products/moba_signal/types'
import { fmtDate, relUntil } from '@/products/moba_signal/selectors'
import { eventDecisions } from '@/products/moba_signal/v2'

export function EventDecisions({ data }: { data: SignalDataset }) {
  const decisions = eventDecisions(data)
  if (decisions.length === 0) {
    return <p className="text-sm text-gray-500">No event decisions open. The radar is watching the calendar.</p>
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {decisions.map(d => (
        <article key={d.event.id}
          className={`rounded-xl border p-4 bg-white ${d.kind === 'decision' ? 'border-amber-300' : 'border-gray-200'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${d.kind === 'decision' ? 'text-amber-700' : 'text-gray-400'}`}>
            {d.kind === 'decision' ? 'Event decision required' : 'Prepare for this event'}
          </p>
          <h4 className="text-[15px] font-bold text-gray-900 leading-snug">{d.headline}</h4>
          <p className="text-xs text-gray-500 mt-1">
            {d.event.location}, {d.event.country} · {fmtDate(d.event.startDate)} · {relUntil(d.event.startDate, data.asOf)}
          </p>
          <p className="text-[13px] text-gray-700 mt-2">{d.context}</p>
          <p className="text-[13px] font-semibold text-gray-900 mt-2">{d.question}</p>
          <p className="text-[11px] text-gray-500 mt-1.5">
            <span className="font-semibold text-gray-600">Suggested owner:</span> {d.owner}
          </p>
        </article>
      ))}
    </div>
  )
}
