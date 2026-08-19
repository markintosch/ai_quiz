'use client'

// ─── Signal detail: provenance, score breakdown, annotations ─────────────────
// Opened from the timeline or the feed. Everything the PRD requires an item to
// carry is visible here: source, first seen, last confirmed, who asserted it,
// whether a human reviewed it, and the structured "so what".

import type { Signal, SignalDataset } from '@/products/moba_signal/types'
import { SIGNAL_TYPE_LABELS, CATEGORY_LABELS, REGION_LABELS, CHANNEL_LABELS } from '@/products/moba_signal/types'
import { band, BAND_META, entityById, entityLabel, fmtDate, impactScore } from '@/products/moba_signal/selectors'

const STATUS_CLS: Record<string, string> = {
  verified:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  unverified: 'bg-gray-100 text-gray-600 border-gray-200',
  disputed:   'bg-red-50 text-red-700 border-red-200',
  superseded: 'bg-gray-100 text-gray-400 border-gray-200 line-through',
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-gray-400">{label}</div>
    </div>
  )
}

export function SignalDetail({ signal, data, onClose }: {
  signal: Signal
  data: SignalDataset
  onClose: () => void
}) {
  const entity = entityById(data, signal.entityId)
  const b = band(signal)
  const meta = BAND_META[b]
  const linked = signal.linkedEntityIds
    .map(id => entityById(data, id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-6" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full border font-semibold ${meta.badge}`}>{meta.label} · {impactScore(signal)}</span>
              <span className={`px-2 py-0.5 rounded-full border ${STATUS_CLS[signal.status]}`}>{signal.status}</span>
              {signal.inference && (
                <span className="px-2 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">inference</span>
              )}
              {signal.touchesMobaAccount && (
                <span className="px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                  touches {signal.touchesMobaAccount}
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none shrink-0" aria-label="Close">×</button>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mt-2">{signal.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {entity ? entityLabel(entity) : signal.entityId} · {SIGNAL_TYPE_LABELS[signal.type]} · {REGION_LABELS[signal.region]} · {CATEGORY_LABELS[signal.category]} · {fmtDate(signal.date)}
          </p>
          <p className="text-sm text-gray-700 mt-3">{signal.summary}</p>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <ScorePill label="Proximity" value={signal.proximity} />
            <ScorePill label="Materiality" value={signal.materiality} />
            <ScorePill label="Credibility" value={signal.credibility} />
          </div>
          {signal.credibility === 1 && impactScore(signal) >= 8 && (
            <p className="text-xs text-amber-700 mt-2">
              Held at Notable: an item cannot be Critical on credibility 1.
            </p>
          )}

          {/* Provenance */}
          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4 text-xs text-gray-600 space-y-1">
            <div>
              Source:{' '}
              <a href={signal.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand underline break-all">
                {signal.sourceUrl}
              </a>
            </div>
            <div>First seen {fmtDate(signal.firstSeen)} · last confirmed {fmtDate(signal.lastConfirmed)}</div>
            <div>
              Asserted by <span className="font-medium">{signal.assertedBy}</span> agent ·{' '}
              {signal.humanReviewed ? 'human reviewed' : 'not yet human reviewed'}
            </div>
            {linked.length > 0 && (
              <div>Attached to: {linked.map(e => entityLabel(e)).join(', ')}</div>
            )}
            {signal.contribution && (
              <div className="pt-1 border-t border-gray-200 mt-2">
                Contributed via {CHANNEL_LABELS[signal.contribution.channel]} by {signal.contribution.contributor}.
                <span className="italic"> &ldquo;{signal.contribution.why}&rdquo;</span>
              </div>
            )}
          </div>

          {/* Annotations: the structured "so what" */}
          <div className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              So what {signal.annotations.length === 0 && '· none yet'}
            </h4>
            {signal.annotations.length === 0 && band(signal) === 'critical' && (
              <p className="text-xs text-red-600">Critical item: an analyst &ldquo;so what&rdquo; is required within 48 hours.</p>
            )}
            <div className="space-y-3">
              {signal.annotations.map(a => (
                <div key={a.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span><span className="font-medium text-gray-600">{a.author}</span> · {a.role}</span>
                    <span>{fmtDate(a.createdAt)}{a.promotedToBriefing && <span className="ml-2 text-brand-accent font-medium">→ in briefing</span>}</span>
                  </div>
                  <dl className="text-sm space-y-1.5">
                    <div><dt className="inline font-semibold text-gray-700">What this means: </dt><dd className="inline text-gray-600">{a.means}</dd></div>
                    <div><dt className="inline font-semibold text-gray-700">Consider doing: </dt><dd className="inline text-gray-600">{a.consider}</dd></div>
                    <div><dt className="inline font-semibold text-gray-700">Who needs to know: </dt><dd className="inline text-gray-600">{a.whoNeedsToKnow}</dd></div>
                  </dl>
                  {a.replies.map(r => (
                    <div key={r.id} className="mt-3 ml-4 pl-3 border-l-2 border-gray-200 text-sm">
                      <div className="text-xs text-gray-400 mb-0.5">{r.author} · {r.role} · {fmtDate(r.createdAt)}</div>
                      <p className="text-gray-600">{r.body}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">
              Annotations are permanent and versioned. In the prototype they are read-only sample data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
