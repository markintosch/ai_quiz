'use client'

// ─── V2 hero module: Actions and implications (review §3) ────────────────────
// The promoted "so what" annotations, upgraded from "another card among many"
// to the dominant section after the attention hero. Every implication carries
// a recommended action with a suggested owner, function and due date. Real
// ownership workflow (assign, status, done) is the P1 backend ask; until it
// lands, owners are derived and labelled as suggestions.

import type { Signal, SignalDataset } from '@/products/moba_signal/types'
import { DISPOSITION_META } from '@/products/moba_signal/types'
import { entityById, entityLabel, fmtDate, relTime } from '@/products/moba_signal/selectors'
import { addDays, suggestedOwner } from '@/products/moba_signal/v2'
import { EvidenceMark } from './EvidenceMark'

export function Actions({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  // Promoted annotations first; signals the analyst decision-labelled but did
  // not annotate yet follow, so the module never depends on one workflow step.
  const promoted = data.signals
    .filter(s => s.annotations.some(a => a.promotedToBriefing))
    .sort((a, b) => b.date.localeCompare(a.date))
  const labelled = data.signals
    .filter(s => s.disposition && s.recommendedAction && s.recommendedAction !== 'ignore'
      && !s.annotations.some(a => a.promotedToBriefing))
    .sort((a, b) => b.date.localeCompare(a.date))
  const rows = [...promoted, ...labelled].slice(0, 6)

  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">No open implications. New ones appear when the analyst promotes a &ldquo;so what&rdquo;.</p>
  }

  return (
    <div className="space-y-3">
      {rows.map(s => {
        const a = s.annotations.find(x => x.promotedToBriefing) ?? s.annotations[0]
        const e = entityById(data, s.entityId)
        const d = s.disposition ? DISPOSITION_META[s.disposition] : null
        const { owner, consult } = suggestedOwner(s)
        const due = s.recommendedAction === 'respond' ? addDays(data.asOf, 2)
          : s.recommendedAction === 'investigate' ? addDays(data.asOf, 14)
          : null
        return (
          <article key={s.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-1.5">
              {d && <span className={`px-2 py-0.5 rounded-full border font-semibold ${d.badge}`}>{d.label}</span>}
              {s.recommendedAction && (
                <span className="px-2 py-0.5 rounded-full border bg-gray-50 text-gray-500 border-gray-200 uppercase tracking-wide font-medium">
                  {s.recommendedAction}
                </span>
              )}
              <span className="text-gray-400">
                <EvidenceMark inference={s.inference} className="mr-1" />
                {e ? entityLabel(e) : s.entityId} · {relTime(s.date, data.asOf)}
              </span>
            </div>

            <p className="text-[15px] text-gray-900 leading-snug">{a ? a.means : s.summary}</p>

            {(a?.consider || s.recommendedAction) && (
              <div className="mt-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Recommended action</p>
                <p className="text-[13px] text-gray-700">{a?.consider ?? 'Assess and decide the response.'}</p>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  <span className="font-semibold text-gray-600">Suggested owner:</span> {owner}
                  {' '}· <span className="font-semibold text-gray-600">consult:</span> {consult}
                  {' '}· <span className="font-semibold text-gray-600">status:</span> open
                  {due && <> · <span className="font-semibold text-gray-600">due:</span> {fmtDate(due)}</>}
                </p>
              </div>
            )}

            <button onClick={() => onSelect(s)} className="text-xs font-bold text-brand-accent hover:underline mt-2">
              Open the evidence →
            </button>
          </article>
        )
      })}
      <p className="text-[11px] text-gray-400">
        Owners are suggestions derived from region and function. Assigning, tracking and closing
        actions is the next build phase; today the account or function owner confirms by reply.
      </p>
    </div>
  )
}
