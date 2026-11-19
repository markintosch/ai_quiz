'use client'

// ─── Company profile tab (first subject: Sanovo) ─────────────────────────────
// For internal Moba readers who want one answer: what is the latest from
// Sanovo, and what does it mean for us. The reading order is the hierarchy:
//
//   1. Hero band:     who they are, four numbers, the legal flag if one is open.
//   2. Top stories:   the few items that matter, each with the "for Moba" read.
//   3. What changed:  where our standing picture is now out of date.
//   4. Everything:    the full chronology (scored items + newsroom digest)
//                     beside channels and share of voice.
//   5. Legal and communications: open matters, how we talk about them, how
//                     we collect on them.
//   6. Reference:     structure, head to head, timeline, events, inputs, gaps.
//   7. Evidence:      every source URL the tab cites, grouped by publisher.
//
// Scored items open the standard detail drawer; digest items link out to the
// source. Every entry says which of the two it is.
//
// Real data only. The rest of the Signal page falls back to a curated sample
// dataset; this tab never shows it. Scored items and the LinkedIn import are
// used only when the page runs on the live database. Head to head, claims and
// the event calendar are still sample content even in live mode, so the tab
// does not use them at all.

import { useMemo, useState } from 'react'
import type { Signal, SignalDataset } from '@/products/moba_signal/types'
import { REGION_LABELS } from '@/products/moba_signal/types'
import { BAND_META, band, entityById, entityLabel, fmtDate, relTime, relUntil, daysBetween } from '@/products/moba_signal/selectors'
import {
  NEWS_TOPIC_LABELS, PUBLISHER_LABELS, VERIFICATION_META, groupDataset, groupSignals, latestFromGroup, profileAsOf, profileEvidence,
  type CompanyProfile, type EvidenceSource, type LatestEntry, type NewsDigestItem, type NewsTopic, type Verification,
} from '@/products/moba_signal/profile'
import { Timeline } from './Timeline'

const TOPIC_CLS: Record<NewsTopic, string> = {
  product:     'bg-sky-50 text-sky-700 border-sky-200',
  partnership: 'bg-violet-50 text-violet-700 border-violet-200',
  footprint:   'bg-teal-50 text-teal-700 border-teal-200',
  corporate:   'bg-gray-100 text-gray-600 border-gray-200',
  legal:       'bg-red-50 text-red-700 border-red-200',
  channel:     'bg-amber-50 text-amber-700 border-amber-200',
}

const SEVERITY_CLS = {
  high:   { edge: 'border-l-red-500',   chip: 'bg-red-50 text-red-700 border-red-200',       label: 'High' },
  medium: { edge: 'border-l-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Medium' },
  low:    { edge: 'border-l-gray-300',  chip: 'bg-gray-100 text-gray-600 border-gray-200',   label: 'Low' },
} as const

const STATE_CLS = {
  live:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  proposed: 'bg-amber-50 text-amber-700 border-amber-200',
  idea:     'bg-gray-100 text-gray-500 border-gray-200',
} as const

function Chip({ cls, children, title }: { cls: string; children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border whitespace-nowrap ${cls}`}>
      {children}
    </span>
  )
}

function VerifyChip({ v }: { v: Verification }) {
  const m = VERIFICATION_META[v]
  return <Chip cls={m.cls} title={m.hint}>{m.label}</Chip>
}

function SourceLink({ url, label = 'Source' }: { url?: string; label?: string }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-brand hover:underline whitespace-nowrap">
      {label} ↗
    </a>
  )
}

/** Section heading: the second level of the hierarchy, a numbered chapter. */
function Chapter({ n, title, sub, children, id }: { n: string; title: string; sub?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-32 space-y-3">
      <header className="flex items-baseline gap-3 border-b border-gray-200 pb-2">
        <span className="text-xs font-bold text-brand-accent tabular-nums">{n}</span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-brand-dark leading-tight">{title}</h2>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}

function Panel({ title, sub, children, className = '' }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm min-w-0 ${className}`}>
      <div className="px-4 py-2.5 border-b border-gray-100">
        <h3 className="text-[13px] font-bold text-brand-dark">{title}</h3>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ── Top story card: the first level below the hero ────────────────────────────

function StoryCard({ item, asOf, lead }: { item: NewsDigestItem; asOf: string; lead?: boolean }) {
  return (
    <article className={`rounded-xl border bg-white shadow-sm flex flex-col min-w-0 overflow-hidden ${item.topic === 'legal' ? 'border-red-200' : 'border-gray-200'}`}>
      <div className={`h-1 ${item.topic === 'legal' ? 'bg-red-500' : 'bg-brand-gradient'}`} aria-hidden />
      <div className={`p-4 flex-1 ${lead ? 'sm:p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-x-8 gap-y-3' : 'flex flex-col gap-2'}`}>
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {lead && <Chip cls="bg-brand-dark text-white border-brand-dark">Lead story</Chip>}
            <Chip cls={TOPIC_CLS[item.topic]}>{NEWS_TOPIC_LABELS[item.topic]}</Chip>
            <span className="text-[11px] text-gray-500">{fmtDate(item.date)} · {relTime(item.date, asOf)}</span>
          </div>
          <h3 className={`font-bold text-gray-900 leading-snug ${lead ? 'text-2xl' : 'text-[15px]'}`}>{item.title}</h3>
          <p className={`text-gray-600 leading-relaxed ${lead ? 'text-[15px]' : 'text-[13px]'}`}>{item.summary}</p>
        </div>
        <div className={`rounded-lg bg-brand/5 border border-brand/10 px-3 py-2 ${lead ? 'lg:row-span-2 lg:self-start lg:px-4 lg:py-3' : 'mt-auto'}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand mb-0.5">For Moba</p>
          <p className={`text-gray-800 leading-relaxed ${lead ? 'text-[15px]' : 'text-[13px]'}`}>{item.forMoba}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <VerifyChip v={item.verification} />
          <SourceLink url={item.sourceUrl} />
          {item.alsoCovered?.map(c => <SourceLink key={c.url} url={c.url} label={c.label} />)}
        </div>
      </div>
    </article>
  )
}

// ── The chronology: one list, two origins ─────────────────────────────────────

type Origin = 'all' | 'signal' | 'digest'

function LatestList({ entries, asOf, data, onSelect }: {
  entries: LatestEntry[]
  asOf: string
  data: SignalDataset
  onSelect: (s: Signal) => void
}) {
  const [origin, setOrigin] = useState<Origin>('all')
  const shown = entries.filter(e => origin === 'all' || e.kind === origin)
  const count = (o: Origin) => (o === 'all' ? entries.length : entries.filter(e => e.kind === o).length)

  return (
    <div>
      <div className="flex items-center gap-1 mb-4 flex-wrap" role="tablist" aria-label="Origin">
        {([['all', 'Everything'], ['signal', 'Scored in Signal'], ['digest', 'Newsroom digest']] as [Origin, string][]).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={origin === k} onClick={() => setOrigin(k)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              origin === k ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}>
            {label} <span className="opacity-60">{count(k)}</span>
          </button>
        ))}
      </div>

      <ol className="relative border-l-2 border-gray-100 ml-2 space-y-4">
        {shown.map(e => {
          if (e.kind === 'signal') {
            const s = e.signal
            const b = BAND_META[band(s)]
            const ent = entityById(data, s.entityId)
            return (
              <li key={`s-${s.id}`} className="pl-5 relative">
                <span className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${b.dot}`} aria-hidden />
                <button onClick={() => onSelect(s)} className="text-left w-full group">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-[11px] font-semibold text-gray-700 tabular-nums">{fmtDate(s.date)}</span>
                    <Chip cls={b.badge}>{b.label}</Chip>
                    <span className="text-[10px] text-gray-400">Scored · {REGION_LABELS[s.region]}{ent && ent.id !== 'sanovo' ? ` · ${entityLabel(ent)}` : ''}</span>
                    {s.inference && <span className="text-amber-500 text-[11px]" title="Inferred, not stated by the company">◐ inference</span>}
                    {s.touchesMobaAccount && <Chip cls="bg-red-50 text-red-700 border-red-200">Moba account</Chip>}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-brand">{s.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{s.summary}</p>
                  {s.annotations[0] && (
                    <p className="text-xs text-gray-800 mt-1.5 pl-2 border-l-2 border-brand-accent">
                      <span className="font-semibold">So what:</span> {s.annotations[0].means}
                    </p>
                  )}
                </button>
              </li>
            )
          }
          const it = e.item
          return (
            <li key={`d-${it.id}`} className="pl-5 relative">
              <span className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white border-2 bg-white ${it.topic === 'legal' ? 'border-red-500' : 'border-brand'}`} aria-hidden />
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[11px] font-semibold text-gray-700 tabular-nums">{it.undated ? 'Undated' : fmtDate(it.date)}</span>
                <Chip cls={TOPIC_CLS[it.topic]}>{NEWS_TOPIC_LABELS[it.topic]}</Chip>
                <span className="text-[10px] text-gray-400">Newsroom digest{it.undated ? `, seen ${fmtDate(it.date)}` : ` · ${relTime(it.date, asOf)}`}</span>
                <VerifyChip v={it.verification} />
              </div>
              <p className="text-sm font-semibold text-gray-900">{it.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">{it.summary}</p>
              <p className="text-xs text-gray-800 mt-1.5 pl-2 border-l-2 border-brand">
                <span className="font-semibold">For Moba:</span> {it.forMoba}
              </p>
              <div className="mt-1"><SourceLink url={it.sourceUrl} /></div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ── Share of voice: Sanovo against Moba, latest imported period ───────────────

function SovCompare({ data, entityId }: { data: SignalDataset; entityId: string }) {
  const social = data.social ?? []
  const latestEnd = social.reduce((m, s) => (s.periodEnd > m ? s.periodEnd : m), '')
  const period = social.filter(s => s.periodEnd === latestEnd)
  const them = period.find(s => s.entityId === entityId)
  const moba = period.find(s => s.entityId === 'moba')
  if (!them) return <p className="text-xs text-gray-500">No real LinkedIn export imported yet. Upload the monthly competitor-analytics export in the admin console and the comparison appears here.</p>

  const rows: { label: string; a: number; b?: number }[] = [
    { label: 'Followers', a: them.followers, b: moba?.followers },
    { label: 'Posts', a: them.posts, b: moba?.posts },
    { label: 'Engagements', a: them.engagements, b: moba?.engagements },
    { label: 'Engagement per post', a: Math.round(them.engagements / Math.max(1, them.posts)), b: moba ? Math.round(moba.engagements / Math.max(1, moba.posts)) : undefined },
  ]
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] text-gray-400">LinkedIn, {fmtDate(them.periodStart)} to {fmtDate(them.periodEnd)}</p>
      {rows.map(r => {
        const max = Math.max(r.a, r.b ?? 0, 1)
        return (
          <div key={r.label}>
            <div className="flex justify-between text-[11px] text-gray-500 mb-0.5"><span>{r.label}</span></div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-14 text-[10px] font-semibold text-gray-700">Sanovo</span>
                <div className="flex-1 h-2.5 rounded bg-gray-100 overflow-hidden"><div className="h-full rounded bg-brand-accent" style={{ width: `${(r.a / max) * 100}%` }} /></div>
                <span className="w-14 text-right text-[11px] tabular-nums font-semibold text-gray-800">{r.a.toLocaleString('en-GB')}</span>
              </div>
              {r.b !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="w-14 text-[10px] font-semibold text-gray-500">Moba</span>
                  <div className="flex-1 h-2.5 rounded bg-gray-100 overflow-hidden"><div className="h-full rounded bg-brand" style={{ width: `${(r.b / max) * 100}%` }} /></div>
                  <span className="w-14 text-right text-[11px] tabular-nums text-gray-600">{r.b.toLocaleString('en-GB')}</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── The tab ───────────────────────────────────────────────────────────────────

export function CompanyProfileTab({ data: input, live, profile, onSelect }: {
  data: SignalDataset
  /** True only when the dataset comes from the live database. */
  live: boolean
  profile: CompanyProfile
  onSelect: (s: Signal) => void
}) {
  // Strip everything that is not collected for real. In prototype mode that
  // leaves the researched profile only.
  const data: SignalDataset = useMemo(() => ({
    ...input,
    signals: live ? input.signals : [],
    social: live ? input.social : [],
    headToHead: [],
    events: [],
    claims: [],
    paper: undefined,
    brief: undefined,
  }), [input, live])
  const asOf = profileAsOf(data, profile)
  const entries = useMemo(() => latestFromGroup(data, profile), [data, profile])
  const scored = useMemo(() => groupSignals(data, profile.entityId), [data, profile])
  const gData = useMemo(() => groupDataset(data, profile.entityId), [data, profile])
  const evidence = useMemo(() => profileEvidence(data, profile), [data, profile])
  const evidenceGroups = useMemo(() => {
    const g = new Map<EvidenceSource['publisher'], EvidenceSource[]>()
    evidence.forEach(e => g.set(e.publisher, [...(g.get(e.publisher) ?? []), e]))
    return [...g.entries()]
  }, [evidence])

  const stories = profile.digest.filter(d => d.headline).sort((a, b) => b.date.localeCompare(a.date))
  const [lead, ...rest] = stories
  const openLegal = profile.legal.filter(l => l.severity === 'high')
  const news180 = profile.digest.filter(d => !d.undated && daysBetween(d.date, profile.researchedOn) <= 180).length
  const upcoming = profile.upcoming.filter(ev => ev.endDate >= asOf).sort((a, b) => a.startDate.localeCompare(b.startDate))
  const channels = profile.socials.filter(c => c.url).length

  const stats = [
    { n: String(news180), label: 'newsroom items, last 6 months' },
    live
      ? { n: String(scored.filter(s => daysBetween(s.date, data.asOf) <= 90).length), label: 'scored items in Signal, 90 days' }
      : { n: String(upcoming.length), label: `launch moment ahead${upcoming[0] ? `: ${upcoming[0].name}` : ''}` },
    { n: String(channels), label: 'owned channels found' },
    { n: String(openLegal.length), label: 'open legal matter with Moba', alert: openLegal.length > 0 },
  ]

  return (
    <div className="space-y-8">
      {/* ── 1. Hero band ── */}
      <section className="rounded-2xl bg-brand-dark text-white overflow-hidden shadow-sm">
        <div className="h-1 bg-brand-gradient" aria-hidden />
        <div className="px-5 sm:px-7 py-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6 items-start">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">Competitor profile · priority competitor</p>
            <h1 className="text-3xl font-bold mt-1">{profile.name}</h1>
            <p className="text-[11px] text-gray-300 mt-1">
              Sanovo Technology Group, part of Thornico · includes Staalkat · researched {fmtDate(profile.researchedOn)}
            </p>
            <p className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-200 bg-emerald-500/15 ring-1 ring-emerald-400/30 rounded-full px-2.5 py-0.5">
              <span aria-hidden>●</span> Real data only{live ? ': researched profile plus live collected items' : ': researched profile. Sample data from the rest of Signal is not used here.'}
            </p>
            <p className="text-[15px] text-gray-100 leading-relaxed mt-3 max-w-3xl">{profile.oneLiner}</p>
            <div className="flex gap-x-4 gap-y-1 flex-wrap mt-4 text-xs font-semibold">
              <a href="#latest" className="text-brand-gold hover:underline">Latest news ↓</a>
              <a href="#legal" className="text-brand-gold hover:underline">Legal and communications ↓</a>
              <a href="#socials" className="text-brand-gold hover:underline">Channels ↓</a>
              <a href="#inputs" className="text-brand-gold hover:underline">Inputs ↓</a>
              <a href="#evidence-sources" className="text-brand-gold hover:underline">Evidence ↓</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => (
              <div key={s.label} className={`rounded-xl px-4 py-3 ${s.alert ? 'bg-red-500/15 ring-1 ring-red-400/40' : 'bg-white/5 ring-1 ring-white/10'}`}>
                <span className={`block text-2xl font-bold tabular-nums ${s.alert ? 'text-red-300' : 'text-white'}`}>{s.n}</span>
                <span className="block text-[11px] text-gray-300 leading-tight mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        {openLegal.map(l => (
          <a key={l.id} href="#legal" className="block bg-red-600/90 hover:bg-red-600 px-5 sm:px-7 py-2.5 text-sm transition-colors">
            <span className="font-bold">Legal flag:</span> {l.title}{l.date ? ` (${fmtDate(l.date)})` : ''}. Internal only, no comment outside Moba. Read the guidance →
          </a>
        ))}
      </section>

      {/* ── 2. Top stories ── */}
      <Chapter n="01" title="What matters now" sub="The stories a Moba colleague should know this month, each with our read. Picked by the analyst, not by volume.">
        {lead && <StoryCard item={lead} asOf={asOf} lead />}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rest.map(it => <StoryCard key={it.id} item={it} asOf={asOf} />)}
          </div>
        )}
      </Chapter>

      {/* ── 3. What changed in our picture ── */}
      <Chapter n="02" title="Where our picture is out of date" sub="Statements elsewhere in Signal that this news overturns or puts at risk.">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-3">
          {profile.changed.map((c, i) => (
            <div key={c.title} className="rounded-xl border border-gray-200 border-l-4 border-l-brand-accent bg-white px-4 py-3 shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-brand-accent tabular-nums">{i + 1}</span>
                <h3 className="text-sm font-bold text-gray-900">{c.title}</h3>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{c.detail}</p>
              <div className="flex items-center justify-between gap-2 mt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Update: {c.affects}</p>
                <SourceLink url={c.sourceUrl} />
              </div>
            </div>
          ))}
        </div>
      </Chapter>

      {/* ── 4. The full chronology beside channels ── */}
      <Chapter n="03" id="latest" title="Latest from Sanovo" sub={live
        ? 'Scored items from the live pipeline (filled dot, opens the evidence drawer) and the researched newsroom digest (open dot, links to the source), newest first.'
        : 'The researched newsroom digest, newest first. Scored items from the collection pipeline appear here once the page runs on the live database.'}>
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-4 items-start">
          <Panel title="Chronology" sub={`${entries.length} items.${live ? ' Scored items follow the impact model; the digest is reading, not scoring.' : ''}`}>
            <div className="max-h-[1100px] overflow-y-auto pr-1">
              <LatestList entries={entries} asOf={asOf} data={data} onSelect={onSelect} />
            </div>
          </Panel>
          <div className="space-y-4 min-w-0" id="socials">
            <Panel title="Channels" sub="Where Sanovo publishes, and how Signal reads each channel.">
              <ul className="space-y-3">
                {profile.socials.map(c => (
                  <li key={c.platform} className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{c.platform}</span>
                      <VerifyChip v={c.verification} />
                    </div>
                    {c.url
                      ? <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-brand hover:underline break-all">{c.handle} ↗</a>
                      : <span className="text-[11px] text-gray-400">{c.handle}</span>}
                    <p className="text-xs text-gray-600 mt-0.5">{c.use}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Signal: {c.collection}</p>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Share of voice: Sanovo vs Moba" sub="Latest monthly LinkedIn competitor-analytics import.">
              <SovCompare data={data} entityId={profile.entityId} />
            </Panel>
          </div>
        </div>
      </Chapter>

      {/* ── 5. Legal and communications ── */}
      <Chapter n="04" id="legal" title="Legal and communications" sub="What is open between the companies, how Moba may talk about Sanovo, and how Signal collects. Guidance for internal use, not legal advice: check external use with Moba legal counsel.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {profile.legal.map(l => {
            const sv = SEVERITY_CLS[l.severity]
            return (
              <div key={l.id} className={`rounded-xl border border-gray-200 border-l-4 ${sv.edge} bg-white px-4 py-3 shadow-sm`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <Chip cls={sv.chip}>{sv.label}</Chip>
                  <h3 className="text-sm font-bold text-gray-900">{l.title}</h3>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">{l.status}{l.date ? ` · ${fmtDate(l.date)}` : ''}</p>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{l.detail}</p>
                <div className="mt-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">What to do</p>
                  <p className="text-xs text-gray-800 leading-relaxed">{l.guidance}</p>
                </div>
                <div className="flex items-center gap-3 mt-2"><VerifyChip v={l.verification} /><SourceLink url={l.sourceUrl} /></div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {([
            ['How Moba talks about Sanovo', 'For marketing, sales and anyone presenting. The rules behind every comparison.', profile.commsRules],
            ['How Signal collects on Sanovo', 'For curators and anyone contributing intelligence.', profile.collectionRules],
          ] as const).map(([title, sub, rules]) => (
            <Panel key={title} title={title} sub={sub}>
              <ol className="space-y-3">
                {rules.map((r, i) => (
                  <li key={r.rule} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-brand-dark text-white text-[11px] font-bold flex items-center justify-center tabular-nums">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{r.rule}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{r.why}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{r.basis}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          ))}
        </div>
      </Chapter>

      {/* ── 6. Reference ── */}
      <Chapter n="05" title="Reference" sub="The standing facts: who owns what and where they show up next.">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
          <Panel title="Company facts">
            <dl className="space-y-2">
              {profile.facts.map(f => (
                <div key={f.label}>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{f.label}</dt>
                  <dd className="text-xs text-gray-800">{f.value} {f.sourceUrl && <SourceLink url={f.sourceUrl} />}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Group structure" sub="Ownership from Danish registry filings. Indented entities sit under the one above.">
            <ul className="space-y-1.5">
              {profile.structure.map((f, i) => (
                <li key={f.label} style={{ marginLeft: `${(f.depth ?? Math.min(i, 3)) * 14}px` }}
                  className={`rounded-lg border px-3 py-2 ${(f.depth ?? i) < 2 ? 'bg-gray-50 border-gray-200' : (f.depth ?? i) === 2 ? 'bg-brand/5 border-brand/30' : 'bg-white border-gray-200'}`}>
                  <p className={`text-xs font-bold ${(f.depth ?? i) === 2 ? 'text-brand-dark' : 'text-gray-800'}`}>{f.label}</p>
                  <p className="text-[11px] text-gray-600">{f.value} {f.sourceUrl && <SourceLink url={f.sourceUrl} />}</p>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Where they show up next" sub="Dated appearances found in the research, with what Sanovo said it will show.">
            {upcoming.length === 0 ? <p className="text-xs text-gray-500">No announced appearance found.</p> : (
              <ul className="space-y-2">
                {upcoming.map(ev => (
                  <li key={ev.name} className="rounded-lg border border-gray-200 border-l-4 border-l-brand-accent px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-bold text-gray-900">{ev.name}</span>
                      <span className="text-[11px] font-semibold text-brand-accent whitespace-nowrap">{relUntil(ev.startDate, asOf)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{fmtDate(ev.startDate)} to {fmtDate(ev.endDate)} · {ev.location}</p>
                    <p className="text-xs text-gray-800 mt-1">{ev.note}</p>
                    <div className="flex items-center gap-3 mt-1.5"><VerifyChip v={ev.verification} /><SourceLink url={ev.sourceUrl} /></div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {live && scored.length > 0 && (
          <Panel title="Sanovo movement over time" sub="Live scored Sanovo group items, Staalkat included, with Moba's lane for contrast. Click a point for the evidence.">
            <Timeline data={gData} onSelect={onSelect} />
          </Panel>
        )}
      </Chapter>

      {/* ── 7. Inputs and gaps ── */}
      <Chapter n="06" id="inputs" title="Inputs: what feeds this profile" sub="Live sources, sources awaiting approval in the curator queue, and material people can upload by hand.">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-4 items-start">
          <Panel title="Sources and uploads">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="py-1.5 pr-3 font-semibold">Input</th>
                    <th className="py-1.5 pr-3 font-semibold">Type</th>
                    <th className="py-1.5 pr-3 font-semibold">Feeds</th>
                    <th className="py-1.5 font-semibold">State</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.inputs.map(s => (
                    <tr key={s.name} className="border-b border-gray-50 align-top">
                      <td className="py-2 pr-3">
                        {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:text-brand">{s.name}</a> : <span className="font-semibold text-gray-900">{s.name}</span>}
                        {s.legalNote && <p className="text-[11px] text-gray-400 mt-0.5">{s.legalNote}</p>}
                      </td>
                      <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">{s.kind === 'online' ? 'Online' : 'Hand upload'}</td>
                      <td className="py-2 pr-3 text-gray-600">{s.feeds}</td>
                      <td className="py-2"><Chip cls={STATE_CLS[s.state]}>{s.state}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel title="Known gaps" sub="What this profile cannot see yet. A silent gap reads as calm, so it is listed.">
            <ul className="space-y-2">
              {profile.gaps.map(g => (
                <li key={g} className="flex gap-2 text-xs text-gray-700 leading-relaxed">
                  <span className="text-amber-500 shrink-0" aria-hidden>▲</span>{g}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </Chapter>

      {/* ── 8. Evidence ── */}
      <Chapter n="07" id="evidence-sources" title="Evidence"
        sub={`Every source this tab cites: ${evidence.length} sources behind ${evidence.reduce((n, e) => n + e.citations, 0)} statements. Each shows its weakest verification state, so one unchecked use is never hidden by a checked one.`}>
        <div className="columns-1 md:columns-2 2xl:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {evidenceGroups.map(([pub, list]) => (
            <Panel key={pub} title={PUBLISHER_LABELS[pub]}
              sub={pub === 'scored'
                ? `${list.length} source${list.length === 1 ? '' : 's'}. Provenance from the live collection pipeline.`
                : `${list.length} source${list.length === 1 ? '' : 's'}`}>
              <ul className="space-y-2.5">
                {list.map(e => (
                  <li key={e.url} className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-900">{e.host}</span>
                      <VerifyChip v={e.verification} />
                      <span className="text-[10px] text-gray-400">{e.citations} citation{e.citations === 1 ? '' : 's'}</span>
                    </div>
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-brand hover:underline break-all leading-snug">{e.url}</a>
                    <p className="text-[10px] text-gray-400 mt-0.5">Used in: {e.usedIn.join(', ')}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
        <p className="text-[11px] text-gray-400">
          Researched {fmtDate(profile.researchedOn)} by {profile.researchedBy}. Every source above is a real page.
          {live ? ' Scored items carry their full provenance in the evidence drawer.' : ' Scored items join this list once the page runs on the live database.'}
        </p>
      </Chapter>
    </div>
  )
}
