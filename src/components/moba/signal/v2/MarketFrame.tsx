'use client'

// ─── Market frame ─────────────────────────────────────────────────────────────
// A standing interpretation of where the market is going, as opposed to a dated
// thing a competitor did. Third-party research names no events, so it has no
// honest home in the timeline: forcing it there would mean inventing an entity
// and a type it does not have, and the timeline's whole claim on trust is that
// every point is something that happened.
//
// A frame earns its place by changing how the cards next to it read, so it sits
// beside them, quietly: no impact band, no triage colour, no place in the
// counts. Marked inferred, because a frame is interpretation.
//
// Publication is opt-in per row. Context also holds analyst-only material such
// as the strategic account list, so an unflagged row never reaches the board.

import type { SignalDataset } from '@/products/moba_signal/types'
import { fmtDate } from '@/products/moba_signal/selectors'
import { EvidenceMark } from './EvidenceMark'

export function MarketFrame({ data }: { data: SignalDataset }) {
  const frames = data.context.filter(c => c.frame)

  if (frames.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No market frame loaded. Research that sets the terms of the fight belongs here rather than in the timeline.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {frames.map(f => {
        const overdue = f.reviewBy < data.asOf
        return (
          <div key={f.id} className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <EvidenceMark inference className="mt-1 shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 leading-snug">{f.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {f.owner} · loaded {fmtDate(f.loadedOn)}
                </p>
                {f.note && (
                  <p className="text-[12px] text-gray-700 mt-1.5 leading-relaxed">{f.note}</p>
                )}
                <p className={`text-[11px] mt-1.5 ${overdue ? 'text-amber-700 font-medium' : 'text-gray-400'}`}>
                  {overdue ? `Review overdue since ${fmtDate(f.reviewBy)}` : `Review by ${fmtDate(f.reviewBy)}`}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
