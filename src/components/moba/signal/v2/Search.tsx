'use client'

// ─── V2: universal search (review §18) ───────────────────────────────────────
// Users think "what is happening with Sanovo?" or "what affects Ba Huân?",
// not "I want the momentum module". One box over the structured graph:
// signals, events, claims and whitespace, ranked the same way the feed is.

import { useMemo, useState } from 'react'
import type { Signal, SignalDataset } from '@/products/moba_signal/types'
import { CONTESTED_LABELS } from '@/products/moba_signal/types'
import { band, BAND_META, entityById, entityLabel, fmtDate, relTime } from '@/products/moba_signal/selectors'
import { runSearch } from '@/products/moba_signal/v2'
import { EvidenceMark } from './EvidenceMark'

const EXAMPLES = ['Sanovo processing Asia', 'Ba Huan', 'iMoba', 'SPACE', 'labour reduction']

export function UniversalSearch({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => runSearch(data, query), [data, query])

  return (
    <div>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden>⌕</span>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search Signal: a competitor, an account, a market, a claim"
          className="w-full rounded-xl border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          aria-label="Search Signal"
        />
      </div>
      {!results && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => setQuery(ex)}
              className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors">
              {ex}
            </button>
          ))}
        </div>
      )}

      {results && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {results.signals.length + results.events.length + results.claims.length + results.whitespace.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">Nothing matches. Try a competitor, account, event or claim word.</p>
          )}

          {results.signals.map(s => {
            const e = entityById(data, s.entityId)
            const bm = BAND_META[band(s)]
            return (
              <button key={s.id} onClick={() => onSelect(s)} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${bm.dot}`} aria-hidden />
                  {bm.label} · {e ? entityLabel(e) : s.entityId} · {relTime(s.date, data.asOf)}
                  <EvidenceMark inference={s.inference} />
                </span>
                <span className="block text-sm text-gray-800 mt-0.5">{s.title}</span>
              </button>
            )
          })}

          {results.events.map(ev => (
            <div key={ev.id} className="px-4 py-2.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Event</span>
              <span className="block text-sm text-gray-800">
                {ev.name} · {ev.location}, {ev.country} · {fmtDate(ev.startDate)}
                {!ev.mobaExhibiting && ev.competitors.length > 0 && <span className="text-amber-700"> · Moba absent</span>}
              </span>
            </div>
          ))}

          {results.claims.map(c => (
            <div key={c.id} className="px-4 py-2.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Claim · {CONTESTED_LABELS[c.status]}</span>
              <span className="block text-sm text-gray-800">{c.claim}</span>
            </div>
          ))}

          {results.whitespace.map(w => (
            <div key={w.id} className="px-4 py-2.5">
              <span className="text-[10px] text-emerald-700 uppercase tracking-wide font-semibold">Whitespace</span>
              <span className="block text-sm text-gray-800">{w.territory}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
