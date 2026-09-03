'use client'

// ─── V2 sales modules: accounts at risk and the region pulse ─────────────────
// The sales lens leads with the question a salesperson actually asks: does
// this affect one of my customers, and what is happening in my region. Each
// region card connects region → competitor → account → event → action, so it
// can carry a regional sales meeting on its own.

import type { Signal, SignalDataset } from '@/products/moba_signal/types'
import { REGION_LABELS } from '@/products/moba_signal/types'
import { fmtDate, relTime, relUntil } from '@/products/moba_signal/selectors'
import { accountsAtRisk, regionPulse, RISK_META } from '@/products/moba_signal/v2'
import { EvidenceMark } from './EvidenceMark'

export function AccountsAtRisk({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const rows = accountsAtRisk(data)
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">No strategic account is touched by current competitor intelligence.</p>
  }
  return (
    <div className="space-y-2.5">
      {rows.map(row => {
        const meta = RISK_META[row.level]
        return (
          <button key={row.account} onClick={() => onSelect(row.latest)}
            className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-bold text-gray-900">{row.account}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${meta.cls}`}>
                {meta.label}
              </span>
              <span className="text-[11px] text-gray-400 ml-auto">{REGION_LABELS[row.region]}</span>
            </div>
            <p className="text-[13px] text-gray-700 mt-1">
              <EvidenceMark inference={row.latest.inference} className="mr-1" />
              {row.competitor}: {row.latest.title}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {row.signals.length} signal{row.signals.length > 1 ? 's' : ''} on this account · latest {relTime(row.latest.date, data.asOf)} · open the account intelligence →
            </p>
          </button>
        )
      })}
    </div>
  )
}

const LEANING_META = {
  threat: { label: 'Threat leaning', cls: 'bg-red-50 text-red-700 border-red-200' },
  active: { label: 'Active',        cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  quiet:  { label: 'Quiet',         cls: 'bg-gray-100 text-gray-500 border-gray-200' },
} as const

export function RegionPulseCards({ data, onSelect }: {
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const pulses = regionPulse(data)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {pulses.map(p => {
        const meta = LEANING_META[p.leaning]
        return (
          <div key={p.region} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-gray-900">{REGION_LABELS[p.region]}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${meta.cls}`}>{meta.label}</span>
            </div>
            <dl className="mt-2.5 space-y-1.5 text-[12px]">
              <div className="flex justify-between gap-2">
                <dt className="text-gray-400">Signals, 90d</dt>
                <dd className="text-gray-700 font-medium">{p.count90d}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-400">Most active</dt>
                <dd className="text-gray-700 font-medium text-right">{p.topCompetitor ?? 'Nobody'}</dd>
              </div>
              {p.accountSignal && (
                <div>
                  <dt className="text-gray-400">Account signal</dt>
                  <dd>
                    <button onClick={() => onSelect(p.accountSignal!)} className="text-left text-gray-700 hover:text-brand">
                      {p.accountSignal.touchesMobaAccount}: {p.accountSignal.title}
                    </button>
                  </dd>
                </div>
              )}
              {p.nextEvent && (
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Next event</dt>
                  <dd className="text-gray-700 text-right">
                    {p.nextEvent.name}
                    <span className="text-gray-400"> · {relUntil(p.nextEvent.startDate, data.asOf)}</span>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )
      })}
    </div>
  )
}

export function TalkTrack({ data }: { data: SignalDataset }) {
  const b = data.brief
  if (!b?.salesResponse) return null
  return (
    <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">This week&rsquo;s sales response</p>
      <p className="text-[14px] text-gray-800 leading-relaxed">{b.salesResponse}</p>
      <p className="text-[11px] text-gray-400 mt-1.5">From the approved brief, week of {fmtDate(b.weekStart)}.</p>
    </div>
  )
}

export function MarketingResponse({ data }: { data: SignalDataset }) {
  const b = data.brief
  if (!b?.marketingResponse) return null
  return (
    <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">This week&rsquo;s marketing response</p>
      <p className="text-[14px] text-gray-800 leading-relaxed">{b.marketingResponse}</p>
      <p className="text-[11px] text-gray-400 mt-1.5">From the approved brief, week of {fmtDate(b.weekStart)}.</p>
    </div>
  )
}
