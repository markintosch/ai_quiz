'use client'

// ─── Moba Signal V2 preview — the decision layer ─────────────────────────────
// V1 answers "what is happening in the competitive landscape?". V2 answers
// "what should I care about today?" first, then "what should we do about it?",
// and only then shows the evidence. Three editorial levels (review §5):
//
//   Level 1, Decision:  the attention hero and actions. Large type, limited.
//   Level 2, Evidence:  chapters of modules, reused from V1, re-weighted.
//   Level 3, System:    sources, method, queue, behind one confidence figure.
//
// Three lenses, not three products: Executive, Sales and Marketing are
// prioritisation modes over the same dataset. The analyst's full working
// surface stays where it was: V1 at /moba/signal.

import { useMemo, useState } from 'react'
import type { Signal, SignalDataset } from '@/products/moba_signal/types'
import { REGION_LABELS } from '@/products/moba_signal/types'
import { entityById, entityLabel, fmtDate, quarterlyLaneCounts } from '@/products/moba_signal/selectors'
import {
  accountsAtRisk, attentionItems, briefLine, dataConfidence, eventDecisions,
  executiveCounts, regionPulse,
} from '@/products/moba_signal/v2'
import { HeatStrip } from '../viz'
import { SignalDetail } from '../SignalDetail'
import { Timeline } from '../Timeline'
import { Feed } from '../Feed'
import { Claims } from '../Claims'
import { HeadToHead } from '../HeadToHead'
import { Events } from '../Events'
import { Wins } from '../Wins'
import { Hiring } from '../Hiring'
import { ShareOfVoice } from '../ShareOfVoice'
import { SourceHealth } from '../SourceHealth'
import { Queue } from '../Queue'
import { BriefCard } from '../Brief'
import { PositioningCard } from '../Positioning'
import { AttentionHero } from './Attention'
import { Actions } from './Actions'
import { Battlefield, SovInsightCard } from './Market'
import { AccountsAtRisk, MarketingResponse, RegionPulseCards, TalkTrack } from './Sales'
import { EventDecisions } from './Ahead'
import { UniversalSearch } from './Search'
import { EvidenceLegend } from './EvidenceMark'

type Lens = 'executive' | 'sales' | 'marketing'

const LENSES: Record<Lens, { label: string; hint: string }> = {
  executive: { label: 'Executive', hint: 'The 90-second read: changes, threats, decisions' },
  sales:     { label: 'Sales',     hint: 'Accounts, regions, wins and actions' },
  marketing: { label: 'Marketing', hint: 'Claims, positioning, share of voice and events' },
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function weekday(iso: string): string {
  return WEEKDAYS[new Date(iso + 'T00:00:00Z').getUTCDay()]
}

/** Level-2 chapter header: the mental map the card wall never gave. */
function Chapter({ id, title, sub, children }: {
  id: string
  title: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <header className="flex items-baseline gap-3 border-b-2 border-gray-900 pb-1.5 mb-4">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-gray-900">{title}</h2>
        {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
      </header>
      {children}
    </section>
  )
}

function SubHead({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">{children}</h3>
}

/** Collapsed exploration block: keep depth reachable, not mandatory. */
function Fold({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="rounded-xl border border-gray-200 bg-white">
      <summary className="px-4 py-3 text-sm font-semibold text-gray-700 cursor-pointer select-none hover:text-gray-900">
        {label}
      </summary>
      <div className="px-4 pb-4 border-t border-gray-100 pt-3">{children}</div>
    </details>
  )
}

export function SignalV2Dashboard({ data, sourceLabel = 'prototype, sample data' }: {
  data: SignalDataset
  sourceLabel?: string
}) {
  const [selected, setSelected] = useState<Signal | null>(null)
  const [lens, setLens] = useState<Lens>('sales')

  const attention = useMemo(() => attentionItems(data), [data])
  const counts = useMemo(() => executiveCounts(data), [data])
  const confidence = useMemo(() => dataConfidence(data), [data])
  const brief = useMemo(() => briefLine(data), [data])
  const accounts = useMemo(() => accountsAtRisk(data), [data])
  const pulses = useMemo(() => regionPulse(data), [data])
  const decisions = useMemo(() => eventDecisions(data), [data])
  const momentum = useMemo(() => quarterlyLaneCounts(data, 8), [data])

  const contested = data.claims.filter(c => c.status === 'contested' || c.status === 'conceded').length
  const threatRegions = pulses.filter(p => p.leaning === 'threat').map(p => REGION_LABELS[p.region])

  const world = [
    { label: 'Accounts', value: accounts.length ? `${accounts.length} at risk` : 'quiet', alert: accounts.some(a => a.level === 'high'), href: '#accounts' },
    { label: 'Regions', value: threatRegions.length ? `${threatRegions.join(', ')} threat leaning` : 'no threat leaning', alert: threatRegions.length > 0, href: '#regions' },
    { label: 'Events', value: `${decisions.length} action${decisions.length === 1 ? '' : 's'} open`, alert: decisions.some(d => d.kind === 'decision'), href: '#ahead' },
    { label: 'Claims', value: `${contested} contested`, alert: contested >= 3, href: '#market' },
  ]

  const history = (
    <Fold label="Competitive history: 24 months of movement, momentum and head to head">
      <div className="space-y-5">
        <Timeline data={data} onSelect={setSelected} />
        <div>
          <SubHead>Momentum: signals per competitor per quarter</SubHead>
          <HeatStrip
            quarters={momentum.quarters}
            rows={momentum.rows}
            laneLabel={id => { const e = entityById(data, id); return e ? entityLabel(e) : id }}
          />
        </div>
        <div>
          <SubHead>Head to head</SubHead>
          <HeadToHead data={data} />
        </div>
      </div>
    </Fold>
  )

  const latest = (
    <Fold label="Latest intelligence: everything collected, ranked">
      <Feed data={data} onSelect={setSelected} />
    </Fold>
  )

  const evidence = (
    <Chapter id="evidence" title="Evidence"
      sub="The system layer: for trust and for analysts, not for the daily read">
      <Fold label={`Data confidence ${confidence.pct}%: ${confidence.ok} of ${confidence.total} sources healthy${confidence.failed ? `, ${confidence.failed} failed` : ''}${confidence.stale ? `, ${confidence.stale} stale` : ''}. Sources, method and blind spots`}>
        <div className="space-y-5">
          <SourceHealth data={data} />
          <div>
            <SubHead>Curator queue</SubHead>
            <Queue data={data} />
          </div>
        </div>
      </Fold>
    </Chapter>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Masthead: identity, lens switcher, nothing else ── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
          <span className="font-bold text-brand whitespace-nowrap">Moba Signal</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-gray-900 rounded px-1.5 py-0.5">V2 preview</span>
          <span className="text-[11px] text-gray-400 hidden md:inline whitespace-nowrap">{sourceLabel}</span>
          <div className="ml-auto flex items-center gap-1" role="tablist" aria-label="Lens">
            {(Object.keys(LENSES) as Lens[]).map(k => (
              <button key={k} role="tab" aria-selected={lens === k} onClick={() => setLens(k)} title={LENSES[k].hint}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  lens === k ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}>
                {LENSES[k].label}
              </button>
            ))}
          </div>
          <a href="/moba/signal" className="text-[11px] text-gray-400 hover:text-gray-600 whitespace-nowrap hidden sm:inline"
            title="The analyst's full working surface: V1, unchanged">
            Analyst workspace →
          </a>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* ── Level 1: the attention hero ── */}
        <section>
          <p className="text-[13px] text-gray-500 mb-1">
            {weekday(data.asOf)} · {fmtDate(data.asOf)}
            {data.headlineOverride && <span className="text-gray-400"> · {data.headlineOverride.text}</span>}
          </p>
          <AttentionHero data={data} items={attention} onSelect={setSelected} />
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="#actions" className="text-xs font-semibold text-gray-500 hover:text-gray-900">Explore the evidence ↓</a>
            <EvidenceLegend />
          </div>
        </section>

        {/* ── Your world: four doors into the chapters ── */}
        <section aria-label="Your world" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {world.map(w => (
            <a key={w.label} href={w.href}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-400 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{w.label}</span>
              <span className={`block text-[15px] font-semibold mt-0.5 ${w.alert ? 'text-red-700' : 'text-gray-800'}`}>{w.value}</span>
            </a>
          ))}
        </section>

        {/* ── Executive lens: the 90-second read ── */}
        {lens === 'executive' && (
          <>
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="This quarter in numbers">
              {[
                { n: counts.changes, label: 'material changes, 90d' },
                { n: counts.threats, label: 'labelled threats' },
                { n: counts.opportunities, label: 'labelled opportunities' },
                { n: counts.decisions, label: 'decisions required' },
              ].map(x => (
                <div key={x.label} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <span className="text-2xl font-bold text-gray-900">{x.n}</span>
                  <span className="block text-[11px] text-gray-500">{x.label}</span>
                </div>
              ))}
            </section>

            <Chapter id="actions" title="Attention" sub="What changed and who should act">
              <Actions data={data} onSelect={setSelected} />
            </Chapter>

            <Chapter id="market" title="Market and message" sub="Where Moba can own language">
              <Battlefield data={data} />
            </Chapter>

            <Chapter id="regions" title="Competition" sub="Where the pressure sits">
              <div className="space-y-4">
                <RegionPulseCards data={data} onSelect={setSelected} />
                {brief.empty
                  ? <p className="text-sm text-gray-500">{brief.headline}</p>
                  : <Fold label={`This week's brief: ${brief.headline}`}><BriefCard data={data} /></Fold>}
              </div>
            </Chapter>

            {evidence}
          </>
        )}

        {/* ── Sales lens: accounts first ── */}
        {lens === 'sales' && (
          <>
            <Chapter id="accounts" title="Accounts" sub="Strategic accounts touched by competitor intelligence, and announced wins">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
                <div>
                  <SubHead>Accounts at risk</SubHead>
                  <AccountsAtRisk data={data} onSelect={setSelected} />
                </div>
                <div>
                  <SubHead>Competitor wins and references</SubHead>
                  <Wins data={data} onSelect={setSelected} />
                </div>
              </div>
            </Chapter>

            <Chapter id="actions" title="Actions and implications" sub="What it means and who does what">
              <div className="space-y-4">
                <TalkTrack data={data} />
                <Actions data={data} onSelect={setSelected} />
              </div>
            </Chapter>

            <Chapter id="regions" title="Competition" sub="Region, competitor, account, event: one card per territory">
              <div className="space-y-4">
                <RegionPulseCards data={data} onSelect={setSelected} />
                {history}
              </div>
            </Chapter>

            <Chapter id="ahead" title="Ahead" sub="Known moments and forming patterns">
              <div className="space-y-4">
                <EventDecisions data={data} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
                  <div>
                    <SubHead>Hiring read as intent</SubHead>
                    <Hiring data={data} onSelect={setSelected} />
                  </div>
                  <div>
                    <SubHead>Event radar</SubHead>
                    <Events data={data} />
                  </div>
                </div>
              </div>
            </Chapter>

            <Chapter id="latest" title="Latest" sub="The full ranked feed, when you want to go deeper">
              {latest}
            </Chapter>

            {evidence}
          </>
        )}

        {/* ── Marketing lens: claims and message first ── */}
        {lens === 'marketing' && (
          <>
            <Chapter id="actions" title="Actions and implications" sub="What it means and who does what">
              <div className="space-y-4">
                <MarketingResponse data={data} />
                <Actions data={data} onSelect={setSelected} />
              </div>
            </Chapter>

            <Chapter id="market" title="Market and message" sub="The positioning battlefield, claims and share of voice">
              <div className="space-y-5">
                <Battlefield data={data} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
                  <div className="space-y-3">
                    <SubHead>Share of voice</SubHead>
                    <SovInsightCard data={data} />
                    <ShareOfVoice data={data} />
                  </div>
                  <div>
                    <SubHead>Claims, in their words</SubHead>
                    <Claims data={data} />
                  </div>
                </div>
                <Fold label="Brand positioning: the quarterly reference paper">
                  <PositioningCard paper={data.paper} entityName={id => { const e = entityById(data, id); return e ? entityLabel(e) : id }} />
                </Fold>
              </div>
            </Chapter>

            <Chapter id="ahead" title="Ahead" sub="Event moments to prepare and patterns forming">
              <div className="space-y-4">
                <EventDecisions data={data} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
                  <div>
                    <SubHead>Event radar</SubHead>
                    <Events data={data} />
                  </div>
                  <div>
                    <SubHead>Hiring read as intent</SubHead>
                    <Hiring data={data} onSelect={setSelected} />
                  </div>
                </div>
              </div>
            </Chapter>

            <Chapter id="regions" title="Competition" sub="History and pressure, for context">
              <div className="space-y-4">
                <RegionPulseCards data={data} onSelect={setSelected} />
                {history}
                {latest}
              </div>
            </Chapter>

            {evidence}
          </>
        )}

        {/* ── Universal search: the interface many users will prefer ── */}
        <Chapter id="search" title="Search" sub="A competitor, an account, a market, a claim">
          <UniversalSearch data={data} onSelect={setSelected} />
        </Chapter>

        <footer className="pt-2 pb-8 text-[11px] text-gray-400 space-y-1 border-t border-gray-200">
          <p>
            Moba Signal V2 preview: the same intelligence model as V1, restructured around attention,
            action and ownership. The full analyst surface stays at <a href="/moba/signal" className="underline">the V1 dashboard</a>.
            Mode: {sourceLabel}.
          </p>
          <p>
            Impact model unchanged: proximity + materiality + credibility, Critical 8-9, never Critical
            on an unverified single source. Every item carries provenance; inference is marked ◐.
          </p>
        </footer>
      </div>

      {selected && <SignalDetail signal={selected} data={data} onClose={() => setSelected(null)} />}
    </main>
  )
}
