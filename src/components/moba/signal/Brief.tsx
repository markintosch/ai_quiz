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

/**
 * Illustrative examples of what a promoted implication reads like. Shown, clearly
 * labelled as demo, only while real promoted implications are sparse, so the card
 * demonstrates its intent instead of looking empty. They recede once three or
 * more real "so whats" are promoted.
 */
type Disposition = keyof typeof DISPOSITION_META
const DEMO_IMPLICATIONS: Array<{ disposition: Disposition; action: string; entity: string; means: string; consider: string }> = [
  {
    disposition: 'threat', action: 'respond', entity: 'Sanovo',
    means: 'A third Southeast Asia processing win this quarter concentrates their momentum in the one segment where we are weakest.',
    consider: 'Hold processing out of the lead in Vietnam and Thailand material until the account team confirms scope. Brief the CMO.',
  },
  {
    disposition: 'opportunity', action: 'investigate', entity: 'NABEL',
    means: 'Their robotics partnership is Japan-anchored and slow to reach Europe, so the integrated-line story still owns the European keten conversation.',
    consider: 'Press the advantage at VIV Europe with a full-line proof point and a named reference customer.',
  },
  {
    disposition: 'watch', action: 'monitor', entity: 'Vencomatic / Prinzen',
    means: 'The Meggsius data brand plus a 47-role hiring wave reads as a connected-services push, the same direction as their connected-packer teaser.',
    consider: 'Map their roadmap against iMoba now, before a data gap becomes a public proof point.',
  },
]

export function Implications({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const promoted = data.signals
    .filter(s => s.annotations.some(a => a.promotedToBriefing))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)

  // Scaffold with clearly-labelled demo examples while real content is thin.
  const showDemo = promoted.length < 3

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

      {showDemo && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Demo data</span>
            <span className="text-[11px] text-gray-400">Illustrative, not live. Promote real &ldquo;so whats&rdquo; and these drop away.</span>
          </div>
          {DEMO_IMPLICATIONS.map((x, i) => {
            const d = DISPOSITION_META[x.disposition]
            return (
              <div key={i} className="rounded-lg border border-dashed border-amber-300/70 bg-amber-50/30 p-3">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] mb-1">
                  <span className={`px-1.5 py-0.5 rounded-full border font-semibold ${d.badge}`}>{d.label}</span>
                  <span className="px-1.5 py-0.5 rounded-full border bg-gray-50 text-gray-500 border-gray-200 uppercase tracking-wide">{x.action}</span>
                  <span className="text-gray-400">{x.entity}</span>
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-amber-600">Demo</span>
                </div>
                <p className="text-sm text-gray-800">{x.means}</p>
                <p className="text-xs text-gray-500 mt-0.5"><span className="font-medium text-gray-600">Consider:</span> {x.consider}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
