'use client'

// ─── Curator queue, open questions, contribution channels ────────────────────
// Everything the agent proposes and everything humans feed in lands here.
// Nothing publishes directly: one approval standard for agent and human input.

import type { SignalDataset, ProposalKind } from '@/products/moba_signal/types'
import { CHANNEL_LABELS } from '@/products/moba_signal/types'
import { fmtDate } from '@/products/moba_signal/selectors'

const KIND_LABELS: Record<ProposalKind, string> = {
  'source':        'New source',
  'entity':        'New entity',
  'axis':          'New axis',
  'contribution':  'Contribution',
  'claim-status':  'Claim status',
}

export function Queue({ data }: { data: SignalDataset }) {
  const pending = data.proposals.filter(p => p.state === 'pending')
  const decided = data.proposals.filter(p => p.state !== 'pending')

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Approval queue */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
          Approval queue · {pending.length} pending
        </h4>
        <div className="space-y-3">
          {pending.map(p => (
            <div key={p.id} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand/5 text-brand border border-brand/20 font-semibold uppercase tracking-wide">
                  {KIND_LABELS[p.kind]}
                </span>
                <span className="text-[11px] text-gray-400">by {p.proposedBy} · {fmtDate(p.proposedOn)}</span>
              </div>
              <h5 className="text-sm font-semibold text-gray-800">{p.title}</h5>
              <p className="text-xs text-gray-500 mt-1">{p.rationale}</p>
              {p.why && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  &ldquo;{p.why}&rdquo; ({p.contributor}, via {p.channel ? CHANNEL_LABELS[p.channel] : 'unknown channel'})
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 rounded-lg bg-brand text-white text-xs font-medium opacity-60 cursor-not-allowed" title="Read-only prototype">
                  Accept
                </button>
                <button className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium opacity-60 cursor-not-allowed" title="Read-only prototype">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
        {decided.length > 0 && (
          <div className="mt-4">
            <h5 className="text-[11px] font-semibold uppercase tracking-wide text-gray-300 mb-1.5">Decided (learning-loop record)</h5>
            <ul className="space-y-1">
              {decided.map(p => (
                <li key={p.id} className="text-xs text-gray-400">
                  <span className={p.state === 'accepted' ? 'text-emerald-600' : 'text-red-500'}>
                    {p.state === 'accepted' ? '✓' : '✕'}
                  </span>{' '}
                  {p.title} · {fmtDate(p.proposedOn)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Open questions */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Open question queue</h4>
          <div className="space-y-2">
            {data.questions.map(q => (
              <div key={q.id} className={`rounded-xl border p-4 ${q.state === 'resolved' ? 'border-gray-100 bg-gray-50/60' : 'border-gray-100 bg-white'}`}>
                <p className={`text-sm ${q.state === 'resolved' ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>{q.question}</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Asked by {q.askedBy}, {fmtDate(q.askedOn)} · {q.attempts} attempts · last tried {fmtDate(q.lastAttempt)}
                </p>
                {q.resolution && <p className="text-xs text-emerald-700 mt-1.5">Resolved: {q.resolution}</p>}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            The agent carries each question forward across runs until it resolves. Anyone on the team can post one:
            it is the cheapest research request channel there is.
          </p>
        </div>

        {/* Contribution channels */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Feed the agent</h4>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600">
              <li>📧 Forward to signal@moba.net</li>
              <li>📷 Photo from the show floor</li>
              <li>🔗 Paste a URL</li>
              <li>📄 Drop a document</li>
              <li>💬 Post in the Teams channel</li>
              <li>🎙 Voice note after a visit</li>
            </ul>
            <p className="text-[11px] text-gray-400 mt-3">
              One required line, whatever the channel: why you are sending it. Everything arrives as a proposal
              and enters the verification pipeline. Confidential material is quarantined to the analyst on submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
