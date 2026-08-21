'use client'

// ─── The weekly competitive brief and the implications block ─────────────────
// The Executive view's spine: temperature, one-sentence picture, what changed,
// and at most a handful of recommended responses. Drafted by the Editor
// agent, worded and approved by the analyst; the approval line says so.

import type { SignalDataset, Signal } from '@/products/moba_signal/types'
import { DISPOSITION_META } from '@/products/moba_signal/types'
import { fmtDate, relTime, entityById, entityLabel } from '@/products/moba_signal/selectors'

const TEMP_META = {
  elevated: { label: 'Elevated', cls: 'bg-red-50 text-red-700 border-red-200' },
  normal:   { label: 'Normal',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  quiet:    { label: 'Quiet',    cls: 'bg-gray-100 text-gray-600 border-gray-200' },
} as const

function Section({ label, text }: { label: string; text: string }) {
  if (!text) return null
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</h4>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  )
}

export function BriefCard({ data }: { data: SignalDataset }) {
  const b = data.brief
  if (!b) {
    return (
      <p className="text-xs text-gray-400">
        No approved brief yet. The Editor agent drafts one every Monday; approve it in the{' '}
        <a href="/admin/moba-signal" className="text-brand underline">collection console</a> and it renders here.
      </p>
    )
  }
  const t = TEMP_META[b.temperature]
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${t.cls}`}>
          Competitive temperature: {t.label}
        </span>
        <span className="text-[11px] text-gray-400">
          Week of {fmtDate(b.weekStart)}{b.approvedBy ? ` · approved by ${b.approvedBy}` : ''}
        </span>
      </div>
      <p className="text-base font-medium text-gray-900 leading-snug">{b.headline}</p>

      {b.changes.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Top changes this week</h4>
          <ul className="space-y-1">
            {b.changes.map((c, i) => (
              <li key={i} className="text-sm text-gray-700">
                <span className="font-semibold">{c.entity}:</span> {c.change}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
        <Section label="Key development" text={b.keyDevelopment} />
        <Section label="Why it matters" text={b.whyItMatters} />
        <Section label="Moba advantage" text={b.mobaAdvantage} />
        <Section label="Watch next" text={b.watchNext} />
      </div>

      <div className="rounded-lg border border-brand/20 bg-brand/5 p-3.5 space-y-2">
        <Section label="Recommended marketing response" text={b.marketingResponse} />
        <Section label="Recommended sales response" text={b.salesResponse} />
      </div>
    </div>
  )
}

// ── Implications for Moba: promoted "so what" annotations, decision-labelled ──

export function Implications({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const promoted = data.signals
    .filter(s => s.annotations.some(a => a.promotedToBriefing))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
  if (promoted.length === 0) {
    return <p className="text-xs text-gray-400">No promoted interpretations yet. Promote a &ldquo;so what&rdquo; to surface it here.</p>
  }
  return (
    <div className="space-y-2.5">
      {promoted.map(s => {
        const a = s.annotations.find(x => x.promotedToBriefing)!
        const e = entityById(data, s.entityId)
        const d = s.disposition ? DISPOSITION_META[s.disposition] : null
        return (
          <button key={s.id} onClick={() => onSelect(s)}
            className="w-full text-left rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] mb-1">
              {d && <span className={`px-1.5 py-0.5 rounded-full border font-semibold ${d.badge}`}>{d.label}</span>}
              {s.recommendedAction && <span className="px-1.5 py-0.5 rounded-full border bg-gray-50 text-gray-500 border-gray-200 uppercase tracking-wide">{s.recommendedAction}</span>}
              <span className="text-gray-400">{e ? entityLabel(e) : s.entityId} · {relTime(s.date, data.asOf)}</span>
            </div>
            <p className="text-sm text-gray-800">{a.means}</p>
            <p className="text-xs text-gray-500 mt-0.5"><span className="font-medium text-gray-600">Consider:</span> {a.consider}</p>
          </button>
        )
      })}
    </div>
  )
}
