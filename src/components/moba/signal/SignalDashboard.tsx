'use client'

// ─── Moba Signal — competitive intelligence dashboard ────────────────────────
// One surface, ten tiers, ordered by the ruthless-ranking principle: the value
// is not the volume of data, it is what floats to the top.
//
// Layout: asymmetric. One main column carries the view's primary reading
// material; two narrower columns carry supporting modules. Equal columns would
// say every module matters equally, which contradicts the ranking the PRD is
// built on. The view switcher decides what "primary" means per role: the same
// modules, re-weighted, never forked content.

import { useMemo, useState } from 'react'
import type { Signal, SignalDataset } from '@/products/moba_signal/types'
import { band, daysBetween, entityById, entityLabel, headline, laneEntityId, quarterlyLaneCounts, relTime, sortForFeed, statusMetrics, fmtDate } from '@/products/moba_signal/selectors'
import { HeatStrip, Sparkline } from './viz'
import { SignalDetail } from './SignalDetail'
import { Timeline } from './Timeline'
import { Feed } from './Feed'
import { Claims } from './Claims'
import { HeadToHead } from './HeadToHead'
import { Events } from './Events'
import { Wins } from './Wins'
import { Hiring } from './Hiring'
import { BriefCard, Implications } from './Brief'
import { PositioningCard } from './Positioning'
import { ShareOfVoice } from './ShareOfVoice'
import { SourceHealth } from './SourceHealth'
import { Queue } from './Queue'

const TONE_CLS = {
  alert: 'text-red-600',
  watch: 'text-amber-600',
  ok:    'text-gray-800',
} as const

function Card({ id, title, sub, tall, scroll = true, children }: {
  id: string
  title: string
  sub?: string
  /** Main-column cards get more vertical room before scrolling. */
  tall?: boolean
  scroll?: boolean
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-32 rounded-xl border border-gray-200 bg-white flex flex-col min-w-0">
      <header className="px-4 py-2.5 border-b border-gray-100 shrink-0">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </header>
      <div className={`p-4 ${scroll ? `overflow-y-auto ${tall ? 'max-h-[840px]' : 'max-h-[480px]'}` : ''}`}>{children}</div>
    </section>
  )
}

// ── Views ─────────────────────────────────────────────────────────────────────
// Two jobs, not five personas. Answer = the takeaway (what changed, what it
// means, what to do), for the time-poor reader. Explore = the working surface
// (everything collected, ranked, with the queue), for the analyst-curator.
// Same modules, re-weighted. Sales stays a deferred P2 (battlecard view).

type ViewKey = 'answer' | 'explore'
type CardId = 'feed' | 'claims' | 'h2h' | 'wins' | 'events' | 'queue' | 'tech' | 'momentum' | 'sov' | 'brief' | 'implications' | 'positioning' | 'hiring'

const VIEWS: Record<ViewKey, { label: string; hint: string; main: CardId[]; a: CardId[]; b: CardId[] }> = {
  answer: {
    label: 'Answer', hint: 'The takeaway: what changed, what it means, what to do',
    main: ['brief'], a: ['implications', 'positioning', 'claims'], b: ['momentum', 'wins', 'hiring', 'sov', 'events'],
  },
  explore: {
    label: 'Explore', hint: 'The working view: everything collected, ranked, with the queue',
    main: ['events', 'feed'], a: ['implications', 'momentum', 'hiring', 'sov'], b: ['wins', 'claims', 'h2h', 'tech', 'queue'],
  },
}

export function SignalDashboard({ data, sourceLabel = 'prototype, sample data' }: { data: SignalDataset; sourceLabel?: string }) {
  const [selected, setSelected] = useState<Signal | null>(null)
  const [view, setView] = useState<ViewKey>('explore')

  const metrics = useMemo(() => statusMetrics(data), [data])
  const head = useMemo(() => headline(data), [data])
  // Top alerts: critical competitor items from the last two quarters. Moba's own
  // moves and older criticals stay visible in the timeline and the feed.
  const criticals = useMemo(
    () => sortForFeed(data.signals.filter(s =>
      band(s) === 'critical' &&
      laneEntityId(data, s.entityId) !== 'moba' &&
      daysBetween(s.date, data.asOf) <= 180
    )),
    [data]
  )

  const momentum = useMemo(() => quarterlyLaneCounts(data, 8), [data])

  const cards: Record<CardId, (tall: boolean) => React.ReactNode> = {
    feed: tall => (
      <Card key="feed" id="feed" title="Signal feed" tall={tall}
        sub="Everything collected, newest first, impact-ranked within each period. Noise is collapsed, not deleted.">
        <Feed data={data} onSelect={setSelected} />
      </Card>
    ),
    claims: tall => (
      <Card key="claims" id="claims" title="Claims and positioning" tall={tall}
        sub="Every messaging-house claim against what competitors say, in their own words.">
        <Claims data={data} />
      </Card>
    ),
    h2h: tall => (
      <Card key="h2h" id="h2h" title="Head to head" tall={tall}
        sub="Fixed axes, confidence and last-verified per cell.">
        <HeadToHead data={data} />
      </Card>
    ),
    wins: tall => (
      <Card key="wins" id="wins" title="Wins and references" tall={tall}
        sub="Announced wins by region. Red flag: touches a Moba strategic account.">
        <Wins data={data} onSelect={setSelected} />
      </Card>
    ),
    hiring: tall => (
      <Card key="hiring" id="hiring" title="Hiring signals" tall={tall}
        sub="Competitor HR mentions read as intent: vacancies and senior hires, with what each may indicate.">
        <Hiring data={data} onSelect={setSelected} />
      </Card>
    ),
    events: tall => (
      <Card key="events" id="events" title="Event radar" tall={tall}
        sub="The only predictive module. T-90 to T+30 monitoring cadence.">
        <Events data={data} />
      </Card>
    ),
    queue: tall => (
      <Card key="queue" id="queue" title="Curator queue" tall={tall}
        sub="Agent proposals, contributions and open questions. Nothing publishes without approval.">
        <Queue data={data} />
      </Card>
    ),
    momentum: tall => (
      <Card key="momentum" id="momentum" title="Momentum" tall={tall} scroll={false}
        sub="Signals per competitor per quarter, backfill included. Darker = more movement.">
        <HeatStrip
          quarters={momentum.quarters}
          rows={momentum.rows}
          laneLabel={id => { const e = entityById(data, id); return e ? entityLabel(e) : id }}
        />
      </Card>
    ),
    brief: () => (
      <Card key="brief" id="brief" title="Competitive brief" scroll={false}
        sub="Drafted by the Editor agent every Monday, worded and approved by the analyst.">
        <BriefCard data={data} />
      </Card>
    ),
    implications: tall => (
      <Card key="implications" id="implications" title="Implications for Moba" tall={tall}
        sub="Promoted interpretations: what it means and what to consider doing.">
        <Implications data={data} onSelect={setSelected} />
      </Card>
    ),
    positioning: () => (
      <Card key="positioning" id="positioning" title="Brand positioning" scroll={false}
        sub="The quarterly reference paper: how each company positions itself publicly. Fixed axes, fixed themes.">
        <PositioningCard paper={data.paper} entityName={id => { const e = entityById(data, id); return e ? entityLabel(e) : id }} />
      </Card>
    ),
    sov: () => (
      <Card key="sov" id="sov" title="Share of voice" scroll={false}
        sub="LinkedIn competitor analytics: who is publishing, who is resonating. Monthly import.">
        <ShareOfVoice data={data} />
      </Card>
    ),
    tech: () => (
      <Card key="tech" id="tech" title="Technology radar" scroll={false}
        sub="Adopt / trial / assess / watch.">
        <p className="text-xs text-gray-500">
          Designed for, not built in v1 (P2). Deliberately slow-moving: this tier should change monthly, not daily.
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          Early signals already collected: Zenyer optical-detection patents, NABEL AI inspection, Prinzen connected-services hiring.
        </p>
      </Card>
    ),
  }

  const v = VIEWS[view]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Tier 1: status bar, sticky, with the view switcher ── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-4 mb-1.5">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-bold text-brand whitespace-nowrap">Moba Signal</span>
              <span className="text-[11px] text-gray-400 whitespace-nowrap hidden sm:inline">as of {fmtDate(data.asOf)} · {sourceLabel}</span>
            </div>
            <div className="flex items-center gap-1" role="tablist" aria-label="View">
              {(Object.keys(VIEWS) as ViewKey[]).map(k => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={view === k}
                  onClick={() => setView(k)}
                  title={VIEWS[k].hint}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    view === k ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {VIEWS[k].label}
                </button>
              ))}
              <span
                className="px-2.5 py-1 rounded-full text-xs border border-dashed border-gray-200 text-gray-300 cursor-not-allowed select-none"
                title="Sales access is P2: a battlecard view with its own owner, decided after v1."
              >
                Sales · P2
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-2">
            {metrics.map(m => (
              <div key={m.key} className="min-w-0">
                <div className="flex items-end gap-2">
                  <div className={`text-lg font-bold leading-tight ${TONE_CLS[m.tone]}`}>{m.value}</div>
                  {m.spark && <div className="hidden lg:block pb-0.5"><Sparkline values={m.spark} /></div>}
                </div>
                <div className="text-[10px] text-gray-500 leading-tight truncate" title={m.label}>{m.label}</div>
                <div className="text-[10px] text-gray-400 leading-tight truncate" title={m.baseline}>{m.baseline}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* ── Tier 2: analyst headline (hero) or a quiet status line, critical alerts right ── */}
        <section className="grid grid-cols-1 2xl:grid-cols-3 gap-4 items-start">
          <div>
            {head.author ? (
              <>
                <p className="text-base 2xl:text-lg font-medium text-gray-900 leading-snug">{head.text}</p>
                <p className="text-[11px] text-gray-400 mt-2">
                  Written by {head.author}{data.headlineOverride ? `, ${fmtDate(data.headlineOverride.writtenOn)}` : ''}. The analyst&rsquo;s line, held until the next material change.
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-500 leading-snug">
                <span className="font-semibold text-gray-600">Status:</span> {head.text}
              </p>
            )}
          </div>
          {criticals.length > 0 && (
            <div className="2xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {criticals.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="text-left rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 hover:bg-red-100/70 transition-colors"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide text-red-600">
                    Critical · {relTime(s.date, data.asOf)} · {fmtDate(s.date)}
                  </span>
                  <span className="block text-sm font-semibold text-gray-900 mt-0.5">{s.title}</span>
                  <span className="block text-xs text-gray-600 mt-0.5">{s.summary}</span>
                  {s.annotations.length === 0 && (
                    <span className="block text-[11px] text-red-600 mt-1 font-medium">Analyst &ldquo;so what&rdquo; required within 48 hours.</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Tier 3: timeline, always full width — sequence is the context ── */}
        <Card id="timeline" title="Timeline" scroll={false}
          sub="24 months of movement, Moba's lane on top. The event band highlights only shows with a story (a tracked competitor, an attendance gap, or nearby news) and drops a guide line so a news cluster reads against the show that drove it; other dates stay as faint hover ticks. The axis runs past today to cover upcoming events. Click any point for the source and annotations.">
          <Timeline data={data} onSelect={setSelected} />
        </Card>

        {/* ── The asymmetric module grid: main column + two supporting ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 items-start">
          <div className="lg:col-span-2 2xl:col-span-1 grid grid-cols-1 gap-4 min-w-0">
            {v.main.map(id => cards[id](true))}
          </div>
          <div className="grid grid-cols-1 gap-4 min-w-0">
            {v.a.map(id => cards[id](false))}
          </div>
          <div className="grid grid-cols-1 gap-4 min-w-0">
            {v.b.map(id => cards[id](false))}
          </div>
        </div>

        {/* ── Tier 10: method and source health, always full width ── */}
        <Card id="sources" title="Method and source health" scroll={false}
          sub="Honesty about gaps is what makes the rest trustworthy.">
          <SourceHealth data={data} />
        </Card>

        <footer className="pt-2 pb-8 text-[11px] text-gray-400 space-y-1">
          <p>Internal prototype for Moba marketing and innovation. Mode: {sourceLabel}. In live mode the claims tracker, head to head and event calendar still show curated sample content until their pipeline phases land.</p>
          <p>Impact model: proximity + materiality + credibility. Critical 8-9 · Notable 5-7 · Context 3-4 · Noise below 3. An item can never be Critical on credibility 1.</p>
        </footer>
      </div>

      {selected && <SignalDetail signal={selected} data={data} onClose={() => setSelected(null)} />}
    </main>
  )
}
