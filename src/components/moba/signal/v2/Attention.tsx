'use client'

// ─── V2 Level 1: the attention hero ──────────────────────────────────────────
// The first screen answers "what should I care about today?" with at most
// three developments: act / prepare / watch. Large type, high contrast,
// extremely limited, per the review's editorial-contrast principle. Everything
// else on the page is evidence for these three cards.

import type { Signal, SignalDataset } from '@/products/moba_signal/types'
import { fmtDate, impactScore } from '@/products/moba_signal/selectors'
import { ATTENTION_META, humanScore, type AttentionItem } from '@/products/moba_signal/v2'
import { EvidenceMark } from './EvidenceMark'

/** "Why this ranks here": confidence without teaching the scoring formula. */
function WhyRanked({ item }: { item: AttentionItem }) {
  return (
    <details className="mt-2">
      <summary className="text-[11px] text-gray-400 cursor-pointer hover:text-gray-600 select-none">
        Why this ranks here
      </summary>
      <ul className="mt-1.5 space-y-1">
        {item.whyRanked.map((r, i) => (
          <li key={i} className="text-[11px] text-gray-500 flex gap-1.5">
            <span className="text-emerald-600" aria-hidden>✓</span>{r}
          </li>
        ))}
        {item.signal && (
          <li className="text-[10px] text-gray-400 pt-0.5">
            Impact score {impactScore(item.signal)} · proximity {item.signal.proximity} · materiality {item.signal.materiality} · credibility {item.signal.credibility}
          </li>
        )}
      </ul>
    </details>
  )
}

export function AttentionHero({ data, items, onSelect }: {
  data: SignalDataset
  items: AttentionItem[]
  onSelect: (s: Signal) => void
}) {
  if (items.length === 0) {
    return (
      <p className="text-xl font-medium text-gray-700">
        Nothing requires attention this week. The watch list is quiet.
      </p>
    )
  }
  return (
    <div className="space-y-5">
      <h2 className="text-[22px] sm:text-[26px] font-bold text-gray-900 leading-tight tracking-tight">
        {items.length} development{items.length > 1 ? 's' : ''} require{items.length > 1 ? '' : 's'} attention
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {items.map((item, i) => {
          const meta = ATTENTION_META[item.kind]
          const hs = item.signal ? humanScore(item.signal) : null
          return (
            <article key={i} className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${meta.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} aria-hidden />
                  {i + 1} · {meta.label}
                </span>
                <span className="text-[11px] text-gray-400">{meta.sub}</span>
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{item.kicker}</p>
              <h3 className="text-[17px] font-bold text-gray-900 leading-snug mt-1">
                {item.signal && <EvidenceMark inference={item.signal.inference} className="mr-1.5" />}
                {item.headline}
              </h3>

              <div className="mt-3 space-y-2.5 flex-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Why this matters</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed mt-0.5">{item.why}</p>
                  {hs && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      {hs.proximity} · {hs.materiality} · {hs.credibility}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Recommended response</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed mt-0.5">{item.response}</p>
                </div>
              </div>

              {(item.owner || item.due) && (
                <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  {item.owner && <><span className="font-semibold text-gray-600">Suggested owner:</span> {item.owner}</>}
                  {item.consult && <> · consult {item.consult}</>}
                  {item.due && <> · <span className="font-semibold text-gray-600">due</span> {fmtDate(item.due)}</>}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                {item.signal ? (
                  <button onClick={() => onSelect(item.signal!)}
                    className="text-xs font-semibold text-brand hover:underline">
                    Open intelligence →
                  </button>
                ) : item.event ? (
                  <a href="#ahead" className="text-xs font-semibold text-brand hover:underline">
                    Open event brief →
                  </a>
                ) : <span />}
              </div>
              <WhyRanked item={item} />
            </article>
          )
        })}
      </div>
    </div>
  )
}
