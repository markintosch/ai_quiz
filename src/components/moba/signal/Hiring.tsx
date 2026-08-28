'use client'

// ─── Hiring signals ───────────────────────────────────────────────────────────
// HR mentions read as a leading indicator. A vacancy cluster or a senior hire
// usually shows intent months before a launch, a market entry or a service
// build-out, so it earns a module of its own rather than sitting in the feed.
//
// The honest part is the read. Where the analyst has written a "so what", that
// is the read and it is shown as theirs. Where nobody has yet, a category-based
// hint stands in, clearly marked as an inference, never dressed up as a fact.

import type { Signal, SignalDataset, Category } from '@/products/moba_signal/types'
import { CATEGORY_LABELS, REGION_LABELS } from '@/products/moba_signal/types'
import { entityById, entityLabel, fmtDate, laneEntityId, relTime } from '@/products/moba_signal/selectors'

// A fallback read by category, used only when the analyst has not annotated the
// item. Framed as a tendency ("usually", "points at"), because a job posting is
// evidence of intent, not proof of it.
const CATEGORY_READ: Partial<Record<Category, string>> = {
  service:        'Service-network build-out. Field or helpdesk roles usually track an installed base that has grown enough to need local support.',
  digital:        'Connected-services push. Software and IoT roles point at a data or platform play rather than a new machine.',
  processing:     'Processing-capability build-out. Hiring here usually precedes a bigger push in breaking, pasteurising or drying.',
  grading:        'Grading capacity or capability build-out.',
  detection:      'Vision and detection investment.',
  corporate:      'Commercial or leadership intent. A senior hire tends to reshape where a company pushes next.',
  sustainability: 'Sustainability positioning investment.',
}

export function Hiring({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const items = data.signals
    .filter(s => s.type === 'personnel' && laneEntityId(data, s.entityId) !== 'moba')
    .sort((a, b) => b.date.localeCompare(a.date))

  if (items.length === 0) {
    return (
      <p className="text-xs text-gray-500">
        No competitor hiring signals collected yet. The job-postings sweep feeds this module.
      </p>
    )
  }

  const sourceClassOf = (id: string) => data.sources.find(s => s.id === id)?.sourceClass

  return (
    <div>
      <p className="text-[11px] text-gray-500 mb-3 leading-snug">
        Hiring is a leading indicator. A vacancy cluster or a senior hire often shows intent months
        before it turns into a launch, a market entry or a service base. The read below each item is a
        signal, not a certainty.
      </p>
      <ul className="space-y-2.5">
        {items.map(s => {
          const e = entityById(data, s.entityId)
          const isVacancy = sourceClassOf(s.sourceId) === 'jobs'
          const analystRead = s.annotations.find(a => a.means)?.means
          const read = analystRead ?? CATEGORY_READ[s.category]
          return (
            <li key={s.id}>
              <button
                onClick={() => onSelect(s)}
                className="text-left w-full rounded-lg border border-gray-100 bg-white px-3 py-2.5 hover:border-gray-300 transition-colors group"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    {isVacancy ? 'Vacancy' : 'Hire'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{e ? entityLabel(e) : s.entityId}</span>
                  <span className="text-[11px] text-gray-400">
                    {REGION_LABELS[s.region]} · {CATEGORY_LABELS[s.category]} · <span title={fmtDate(s.date)}>{relTime(s.date, data.asOf)}</span>
                  </span>
                </div>
                <span className="block text-sm text-gray-700 mt-1 group-hover:text-brand transition-colors">{s.title}</span>
                {read && (
                  <span className="block mt-1.5 pl-2 border-l-2 border-amber-300 text-[11px] text-gray-600 leading-snug">
                    <span className="font-semibold text-amber-700">May indicate: </span>
                    {read}
                    {!analystRead && (
                      <span className="text-gray-400"> (inferred from the role, no analyst read yet)</span>
                    )}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
