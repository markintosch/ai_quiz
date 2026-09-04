'use client'

// ─── Moba Signal V2 preview — the decision layer ─────────────────────────────
// V1 answers "what is happening in the competitive landscape?". V2 answers
// "what should I care about today?" first, then "what should we do about it?",
// and only then shows the evidence. Three editorial levels (review §5):
//
//   Level 1, Decision:  a dark masthead band carrying the attention hero.
//   Level 2, Evidence:  the timeline in full view, then the asymmetric
//                       column grid (main + two supporting columns), the
//                       same density logic V1 proved out.
//   Level 3, System:    sources, method, queue, behind one confidence figure.
//
// Art direction: deep teal ink (brand) for the decision band, the brand
// orange/gold strictly as the action accent, triage colour on card edges.
// Editorial contrast without becoming a colourful SaaS dashboard.
//
// Three lenses, not three products: Executive, Sales and Marketing re-weight
// the same modules. The analyst's full working surface stays on V1.

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

/** The module card: V1's proven container, with an editorial header accent. */
function Card({ id, title, sub, tall, scroll = true, children }: {
  id?: string
  title: string
  sub?: string
  tall?: boolean
  scroll?: boolean
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-gray-200 bg-white flex flex-col min-w-0 shadow-sm">
      <header className="px-4 py-2.5 border-b border-gray-100 shrink-0 flex items-start gap-2">
        <span className="w-[3px] self-stretch my-0.5 rounded-full bg-brand-accent shrink-0" aria-hidden />
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold text-brand-dark leading-tight">{title}</h2>
          {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </header>
      <div className={`p-4 ${scroll ? `overflow-y-auto ${tall ? 'max-h-[840px]' : 'max-h-[520px]'}` : ''}`}>{children}</div>
    </section>
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

  const laneLabel = (id: string) => { const e = entityById(data, id); return e ? entityLabel(e) : id }

  // ── The module cards, keyed, so each lens is just a column layout ──────────
  const cards: Record<string, React.ReactNode> = {
    actions: (
      <Card key="actions" id="actions" title="Actions and implications" tall
        sub="Promoted interpretations with a recommended action, a suggested owner and a due date.">
        <div className="space-y-4">
          {lens === 'sales' && <TalkTrack data={data} />}
          {lens === 'marketing' && <MarketingResponse data={data} />}
          <Actions data={data} onSelect={setSelected} />
        </div>
      </Card>
    ),
    accounts: (
      <Card key="accounts" id="accounts" title="Accounts at risk"
        sub="Strategic Moba accounts touched by competitor intelligence.">
        <AccountsAtRisk data={data} onSelect={setSelected} />
      </Card>
    ),
    wins: (
      <Card key="wins" title="Wins and references"
        sub="Announced wins by region. Red flag: touches a Moba strategic account.">
        <Wins data={data} onSelect={setSelected} />
      </Card>
    ),
    regions: (
      <Card key="regions" id="regions" title="Regional pulse"
        sub="Region, competitor, account, event: one card per territory.">
        <RegionPulseCards data={data} onSelect={setSelected} cols="grid-cols-1" />
      </Card>
    ),
    eventactions: (
      <Card key="eventactions" id="ahead" title="Event actions"
        sub="Attendance gaps as decisions, competitor moments as preparation.">
        <EventDecisions data={data} cols="grid-cols-1" />
      </Card>
    ),
    events: (
      <Card key="events" title="Event radar" tall={lens === 'marketing'}
        sub="T-90 to T+30 monitoring. Stand size is a budget decision made months ahead.">
        <Events data={data} />
      </Card>
    ),
    hiring: (
      <Card key="hiring" title="Hiring signals"
        sub="Vacancy clusters read as intent. Inference, marked ◐, never presented as fact.">
        <Hiring data={data} onSelect={setSelected} />
      </Card>
    ),
    battlefield: (
      <Card key="battlefield" id="market" title="Positioning battlefield" scroll={false}
        sub="Moba territory against competitive pressure. Whitespace is the investment call.">
        <Battlefield data={data} />
      </Card>
    ),
    claims: (
      <Card key="claims" title="Claims, in their words"
        sub="Every messaging-house claim against what competitors say, with source and date.">
        <Claims data={data} />
      </Card>
    ),
    sov: (
      <Card key="sov" title="Share of voice"
        sub="LinkedIn competitor analytics, interpreted before charted.">
        <div className="space-y-3">
          <SovInsightCard data={data} />
          <ShareOfVoice data={data} />
        </div>
      </Card>
    ),
    positioning: (
      <Card key="positioning" title="Brand positioning" tall
        sub="The quarterly reference paper: fixed axes, fixed themes.">
        <PositioningCard paper={data.paper} entityName={laneLabel} />
      </Card>
    ),
    momentum: (
      <Card key="momentum" title="Momentum" scroll={false}
        sub="Signals per competitor per quarter. Darker = more movement.">
        <HeatStrip quarters={momentum.quarters} rows={momentum.rows} laneLabel={laneLabel} />
      </Card>
    ),
    h2h: (
      <Card key="h2h" title="Head to head"
        sub="Fixed axes, confidence and last-verified per cell.">
        <HeadToHead data={data} />
      </Card>
    ),
    feed: (
      <Card key="feed" title="Latest intelligence"
        sub="Everything collected, newest first, impact-ranked.">
        <Feed data={data} onSelect={setSelected} />
      </Card>
    ),
    brief: (
      <Card key="brief" title="This week's brief" scroll={false}
        sub="Drafted by the Editor agent, worded and approved by the analyst.">
        {brief.empty
          ? <p className="text-sm text-gray-600">{brief.headline}</p>
          : <BriefCard data={data} />}
      </Card>
    ),
  }

  // ── The asymmetric grid per lens: main column + two supporting ─────────────
  const layout: Record<Lens, { main: string[]; a: string[]; b: string[] }> = {
    executive: { main: ['actions', 'battlefield'], a: ['brief', 'regions'], b: ['eventactions', 'momentum', 'sov'] },
    sales:     { main: ['accounts', 'actions'], a: ['regions', 'wins', 'eventactions', 'h2h'], b: ['hiring', 'events', 'momentum', 'feed'] },
    marketing: { main: ['actions', 'battlefield', 'claims'], a: ['sov', 'positioning'], b: ['eventactions', 'events', 'hiring', 'feed'] },
  }
  const cols = layout[lens]

  return (
    <main className="min-h-screen bg-gray-100">
      {/* ── Level 1: the ink band. Masthead and the attention hero ── */}
      <div className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
          <span className="font-bold text-white whitespace-nowrap">Moba <span className="text-brand-gold">Signal</span></span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-brand-gradient rounded px-1.5 py-0.5">V2 preview</span>
          <span className="text-[11px] text-gray-400 hidden md:inline whitespace-nowrap">{sourceLabel}</span>
          <div className="ml-auto flex items-center gap-1" role="tablist" aria-label="Lens">
            {(Object.keys(LENSES) as Lens[]).map(k => (
              <button key={k} role="tab" aria-selected={lens === k} onClick={() => setLens(k)} title={LENSES[k].hint}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  lens === k ? 'bg-brand-accent text-white border-brand-accent' : 'bg-transparent text-gray-300 border-white/25 hover:border-white/60 hover:text-white'
                }`}>
                {LENSES[k].label}
              </button>
            ))}
          </div>
          <a href="/moba/signal" className="text-[11px] text-gray-400 hover:text-white whitespace-nowrap hidden sm:inline"
            title="The analyst's full working surface: V1, unchanged">
            Analyst workspace →
          </a>
        </div>
      </div>

      <div className="bg-brand-dark text-white">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 pt-7 pb-9">
          <p className="text-[13px] text-gray-300 mb-2">
            <span className="font-semibold text-brand-gold">{weekday(data.asOf)} · {fmtDate(data.asOf)}</span>
            {data.headlineOverride && <span className="text-gray-300"> · {data.headlineOverride.text}</span>}
          </p>
          <AttentionHero data={data} items={attention} onSelect={setSelected} />
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="#accounts" className="text-xs font-bold text-brand-gold hover:underline">Explore the evidence ↓</a>
            <EvidenceLegend />
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── Your world: four doors, triage-coloured edges ── */}
        <section aria-label="Your world" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {world.map(w => (
            <a key={w.label} href={w.href}
              className={`rounded-xl border border-gray-200 border-l-4 ${w.alert ? 'border-l-red-500' : 'border-l-brand'} bg-white px-4 py-3 shadow-sm hover:border-gray-400 transition-colors`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{w.label}</span>
              <span className={`block text-[15px] font-semibold mt-0.5 ${w.alert ? 'text-red-700' : 'text-gray-800'}`}>{w.value}</span>
            </a>
          ))}
        </section>

        {/* ── Executive counts, only where the 90-second read needs them ── */}
        {lens === 'executive' && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="This quarter in numbers">
            {[
              { n: counts.changes, label: 'material changes, 90d', cls: 'text-brand-dark' },
              { n: counts.threats, label: 'labelled threats', cls: counts.threats > 0 ? 'text-red-600' : 'text-brand-dark' },
              { n: counts.opportunities, label: 'labelled opportunities', cls: counts.opportunities > 0 ? 'text-emerald-600' : 'text-brand-dark' },
              { n: counts.decisions, label: 'decisions required', cls: counts.decisions > 0 ? 'text-brand-accent' : 'text-brand-dark' },
            ].map(x => (
              <div key={x.label} className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <span className={`text-3xl font-bold ${x.cls}`}>{x.n}</span>
                <span className="block text-[11px] text-gray-500 mt-0.5">{x.label}</span>
              </div>
            ))}
          </section>
        )}

        {/* ── Level 2 opens with the visual context: the timeline, in view ── */}
        <Card id="movement" title="Competitive movement" scroll={false}
          sub="24 months of movement, Moba's lane on top, events as guide lines. Click any point for the source and annotations.">
          <Timeline data={data} onSelect={setSelected} />
        </Card>

        {/* ── The asymmetric module grid: main column + two supporting ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 items-start">
          <div className="lg:col-span-2 2xl:col-span-1 grid grid-cols-1 gap-4 min-w-0">
            {cols.main.map(id => cards[id])}
          </div>
          <div className="grid grid-cols-1 gap-4 min-w-0">
            {cols.a.map(id => cards[id])}
          </div>
          <div className="grid grid-cols-1 gap-4 min-w-0">
            {cols.b.map(id => cards[id])}
          </div>
        </div>

        {/* ── Universal search ── */}
        <Card id="search" title="Search Signal" scroll={false}
          sub="A competitor, an account, a market, a claim. The graph answers the way users ask.">
          <UniversalSearch data={data} onSelect={setSelected} />
        </Card>

        {/* ── Level 3: the system layer, one figure in front ── */}
        <details id="evidence" className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <summary className="px-4 py-3 text-sm font-bold text-brand-dark cursor-pointer select-none hover:text-brand">
            Data confidence {confidence.pct}%: {confidence.ok} of {confidence.total} sources healthy
            {confidence.failed ? `, ${confidence.failed} failed` : ''}{confidence.stale ? `, ${confidence.stale} stale` : ''}. Sources, method and blind spots
          </summary>
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-5">
            <SourceHealth data={data} />
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Curator queue</h3>
              <Queue data={data} />
            </div>
          </div>
        </details>

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
