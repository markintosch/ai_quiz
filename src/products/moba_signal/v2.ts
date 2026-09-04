// FILE: src/products/moba_signal/v2.ts
// ─── Moba Signal V2 — decision-layer selectors ───────────────────────────────
//
// The V2 preview answers "what should I care about today?" before "what is
// happening?". Everything here is a pure derivation over the SAME dataset V1
// renders: no new data model fields, no migration, works identically for live
// and demo data. The scoring model is untouched; V2 only translates it into
// commercial language and picks what leads the page.
//
// Copy rule (review §10): expose the human language, keep the analytical
// terminology underneath. "Strategic customer affected" in front,
// "Proximity 3" behind a toggle.

import type {
  Claim, Region, Signal, SignalDataset, TradeEvent, Whitespace,
} from './types'
import { REGION_LABELS } from './types'
import {
  band, daysBetween, entityById, entityLabel, impactScore, laneEntityId,
  sortForFeed,
} from './selectors'

// ── Human-language score translation (review §10, §19) ────────────────────────

export interface HumanScore {
  proximity: string
  materiality: string
  credibility: string
}

export function humanScore(s: Signal): HumanScore {
  return {
    proximity:
      s.touchesMobaAccount ? 'Strategic customer affected'
      : s.proximity === 3 ? 'Names a Moba account, claim or stronghold'
      : s.proximity === 2 ? 'In our segment'
      : 'Adjacent market',
    materiality:
      s.materiality === 3 ? 'High commercial impact'
      : s.materiality === 2 ? 'Notable commercial impact'
      : 'Marketing-level move',
    credibility:
      s.credibility === 3 ? 'Confirmed by primary source'
      : s.credibility === 2 ? 'Reported by trade press'
      : s.inference ? 'Inferred, not stated'
      : 'Unconfirmed: single or social source',
  }
}

/** The "Why this ranks here" checklist: confidence without teaching the formula. */
export function whyRanked(data: SignalDataset, s: Signal): string[] {
  const out: string[] = []
  if (s.touchesMobaAccount) out.push(`Moba strategic account: ${s.touchesMobaAccount}`)
  const e = entityById(data, s.entityId)
  if (e?.priority || (e?.ownership.kind === 'group' && entityById(data, laneEntityId(data, s.entityId))?.priority)) {
    out.push('Priority competitor')
  }
  if (s.type === 'win') out.push('Commercial win, not marketing')
  const h = humanScore(s)
  if (s.materiality === 3) out.push(h.materiality)
  out.push(h.credibility)
  if (s.region === 'asia') out.push('High-growth market')
  return out
}

// ── Suggested ownership (review §3) ──────────────────────────────────────────
// The data model has no action-ownership workflow yet (that is the P1 backend
// ask V2 surfaces). Until it exists, owners are SUGGESTED from region and
// category, and labelled as suggestions in the UI.

const REGION_OWNER: Record<Region, string> = {
  asia: 'APAC Sales', europe: 'Europe Sales', americas: 'Americas Sales',
  mea: 'MEA Sales', global: 'Global commercial team',
}

const FUNCTION_OWNER: Record<string, string> = {
  grading: 'Product management', processing: 'Processing PM',
  detection: 'Product marketing', digital: 'Digital PM (iMoba)',
  service: 'Service lead', sustainability: 'Product marketing',
  corporate: 'CMO office',
}

export function suggestedOwner(s: Signal): { owner: string; consult: string } {
  const owner = s.touchesMobaAccount
    ? `${REGION_OWNER[s.region]} (account owner)`
    : REGION_OWNER[s.region]
  return { owner, consult: FUNCTION_OWNER[s.category] ?? 'Product marketing' }
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// ── The attention hero: act / prepare / watch (review §2) ─────────────────────

export type AttentionKind = 'act' | 'prepare' | 'watch'

export const ATTENTION_META: Record<AttentionKind, { label: string; sub: string; cls: string; dot: string; top: string; kicker: string }> = {
  act:     { label: 'Act',     sub: 'needs an owner this week',  cls: 'text-red-700 border-red-200 bg-red-50',       dot: 'bg-red-500',   top: 'border-t-red-500',   kicker: 'text-red-600' },
  prepare: { label: 'Prepare', sub: 'known moment ahead',        cls: 'text-amber-700 border-amber-200 bg-amber-50', dot: 'bg-amber-500', top: 'border-t-amber-400', kicker: 'text-amber-600' },
  watch:   { label: 'Watch',   sub: 'pattern forming, not fact', cls: 'text-gray-700 border-gray-300 bg-gray-100',   dot: 'bg-gray-400',  top: 'border-t-gray-400',  kicker: 'text-gray-500' },
}

export interface AttentionItem {
  kind: AttentionKind
  kicker: string
  headline: string
  why: string
  response: string
  owner?: string
  consult?: string
  due?: string
  signal?: Signal
  event?: TradeEvent
  whyRanked: string[]
}

function competitorSignals(data: SignalDataset): Signal[] {
  return data.signals.filter(s => laneEntityId(data, s.entityId) !== 'moba')
}

function firstSentence(text: string): string {
  const i = text.indexOf('. ')
  return i === -1 ? text : text.slice(0, i + 1)
}

/** At most three developments, one per kind, strongest first. */
export function attentionItems(data: SignalDataset): AttentionItem[] {
  const items: AttentionItem[] = []
  const comp = competitorSignals(data)
  const recent = comp.filter(s => daysBetween(s.date, data.asOf) <= 180)

  // ACT: the strongest recent critical, strategic accounts first.
  const actPool = sortForFeed(recent.filter(s => band(s) === 'critical'))
    .sort((a, b) => Number(!!b.touchesMobaAccount) - Number(!!a.touchesMobaAccount) || impactScore(b) - impactScore(a))
  const act = actPool[0]
  if (act) {
    const a = act.annotations.find(x => x.promotedToBriefing) ?? act.annotations[0]
    const { owner, consult } = suggestedOwner(act)
    items.push({
      kind: 'act',
      kicker: act.touchesMobaAccount
        ? `Strategic-account threat · ${REGION_LABELS[act.region]}`
        : `Competitive threat · ${REGION_LABELS[act.region]}`,
      headline: act.title,
      why: a ? firstSentence(a.means) : act.summary,
      response: a?.consider ?? 'Account owner confirms scope and customer situation.',
      owner, consult,
      due: addDays(data.asOf, 2),
      signal: act,
      whyRanked: whyRanked(data, act),
    })
  }

  // PREPARE: the nearest upcoming event with a story (an expected competitor
  // launch, or an attendance gap against priority competitors).
  const upcoming = data.events
    .filter(ev => ev.endDate >= data.asOf)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  const prepare = upcoming.find(ev =>
    ev.competitors.some(c => (c.sessions?.length ?? 0) > 0) ||
    (!ev.mobaExhibiting && ev.competitors.some(c => entityById(data, c.entityId)?.priority))
  )
  if (prepare) {
    const launcher = prepare.competitors.find(c => (c.sessions?.length ?? 0) > 0)
    const launcherE = launcher ? entityById(data, launcher.entityId) : undefined
    const gap = !prepare.mobaExhibiting
    items.push({
      kind: 'prepare',
      kicker: `Competitive event · ${prepare.name}`,
      headline: launcherE
        ? `${entityLabel(launcherE)}: ${launcher!.sessions![0]} at ${prepare.name}`
        : `${prepare.name}: competitors exhibit, Moba does not`,
      why: prepare.notes ?? `${prepare.location}, ${prepare.country}.`,
      response: gap
        ? 'Decide whether Moba attends, partners or activates locally.'
        : 'Prepare the Moba proof point and capture competitor messaging on site.',
      owner: gap ? `Events + ${REGION_OWNER[prepare.region]}` : 'Events + Product marketing',
      event: prepare,
      whyRanked: [
        launcherE ? 'Competitor launch expected' : 'Attendance gap against priority competitors',
        'Stand and session decisions are made months ahead',
        `${REGION_LABELS[prepare.region]} market moment`,
      ],
    })
  }

  // WATCH: the strongest recent inference that is not already the ACT item.
  const watchPool = recent
    .filter(s => s.inference && s.id !== act?.id && band(s) !== 'noise')
    .sort((a, b) => impactScore(b) - impactScore(a) || b.date.localeCompare(a.date))
  const watch = watchPool[0]
  if (watch) {
    const a = watch.annotations[0]
    items.push({
      kind: 'watch',
      kicker: `Capability signal · ${REGION_LABELS[watch.region]}`,
      headline: watch.title,
      why: a ? firstSentence(a.means) : firstSentence(watch.summary),
      response: a?.consider ?? 'Map the signal against the Moba roadmap before it becomes a public proof point.',
      signal: watch,
      whyRanked: whyRanked(data, watch),
    })
  }

  return items
}

/** The executive summary counts: N changes, N threats, N opportunities, N decisions. */
export function executiveCounts(data: SignalDataset) {
  const comp = competitorSignals(data).filter(s => daysBetween(s.date, data.asOf) <= 90)
  return {
    changes: comp.filter(s => band(s) !== 'noise').length,
    threats: comp.filter(s => s.disposition === 'threat').length,
    opportunities: comp.filter(s => s.disposition === 'opportunity').length,
    decisions: eventDecisions(data).filter(d => d.kind === 'decision').length + attentionItems(data).filter(i => i.kind === 'act').length,
  }
}

// ── Accounts at risk (review §4, sales lens) ─────────────────────────────────

export type RiskLevel = 'high' | 'medium' | 'watch'

export const RISK_META: Record<RiskLevel, { label: string; cls: string }> = {
  high:   { label: 'High',   cls: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  watch:  { label: 'Watch',  cls: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export interface AccountRisk {
  account: string
  region: Region
  competitor: string
  level: RiskLevel
  latest: Signal
  signals: Signal[]
}

export function accountsAtRisk(data: SignalDataset): AccountRisk[] {
  const byAccount = new Map<string, Signal[]>()
  for (const s of competitorSignals(data)) {
    if (!s.touchesMobaAccount) continue
    const list = byAccount.get(s.touchesMobaAccount) ?? []
    list.push(s)
    byAccount.set(s.touchesMobaAccount, list)
  }
  const order: RiskLevel[] = ['high', 'medium', 'watch']
  return [...byAccount.entries()].map(([account, signals]) => {
    const sorted = [...signals].sort((a, b) => b.date.localeCompare(a.date))
    const level: RiskLevel =
      signals.some(s => band(s) === 'critical') ? 'high'
      : signals.some(s => band(s) === 'notable' && s.status === 'verified') ? 'medium'
      : 'watch'
    const latest = sorted[0]
    const e = entityById(data, laneEntityId(data, latest.entityId))
    return { account, region: latest.region, competitor: e ? entityLabel(e) : latest.entityId, level, latest, signals: sorted }
  }).sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level))
}

// ── The positioning battlefield (review §9) ──────────────────────────────────

export type Pressure = 'high' | 'conceded' | 'emerging' | 'open'

export const PRESSURE_META: Record<Pressure, { label: string; cls: string; bar: string }> = {
  high:     { label: 'High pressure', cls: 'bg-red-50 text-red-700 border-red-200',           bar: 'bg-red-400' },
  conceded: { label: 'Conceded',      cls: 'bg-red-50 text-red-700 border-red-200',           bar: 'bg-red-300' },
  emerging: { label: 'Emerging',      cls: 'bg-amber-50 text-amber-700 border-amber-200',     bar: 'bg-amber-400' },
  open:     { label: 'Open',          cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-400' },
}

export interface BattlefieldRow {
  pillar: string
  pressure: Pressure
  recommendation: string
  invest: boolean
  claims: Claim[]
  contenders: string[]
}

function claimPressure(c: Claim): Pressure {
  if (c.status === 'contested') return 'high'
  if (c.status === 'conceded') return 'conceded'
  if (c.status === 'adjacent') return 'emerging'
  return 'open'
}

const PRESSURE_ORDER: Pressure[] = ['high', 'conceded', 'emerging', 'open']

export function battlefield(data: SignalDataset): { rows: BattlefieldRow[]; whitespace: Whitespace[] } {
  const byPillar = new Map<string, Claim[]>()
  for (const c of data.claims) {
    const list = byPillar.get(c.pillar) ?? []
    list.push(c)
    byPillar.set(c.pillar, list)
  }
  const rows = [...byPillar.entries()].map(([pillar, claims]) => {
    const pressure = claims.map(claimPressure).sort((a, b) => PRESSURE_ORDER.indexOf(a) - PRESSURE_ORDER.indexOf(b))[0]
    const eroding = claims.some(c => c.trend < 0)
    const strengthening = claims.some(c => c.trend > 0)
    const recommendation =
      pressure === 'high' ? (eroding ? 'Needs proof differentiation now' : 'Reframe or evidence the claim')
      : pressure === 'conceded' ? 'Revisit the evidence or retire the claim'
      : pressure === 'emerging' ? 'Defend now: quantify before they do'
      : strengthening ? 'Invest: the territory is moving our way'
      : 'Own the language before anyone contests it'
    const contenders = [...new Set(claims.flatMap(c => c.competitorClaims.map(cc => {
      const e = entityById(data, cc.entityId)
      return e ? e.name : cc.entityId
    })))]
    return { pillar, pressure, recommendation, invest: pressure === 'open', claims, contenders }
  })
  return {
    rows: rows.sort((a, b) => PRESSURE_ORDER.indexOf(a.pressure) - PRESSURE_ORDER.indexOf(b.pressure)),
    whitespace: data.whitespace,
  }
}

// ── Share-of-voice interpretation (review §13) ───────────────────────────────

export interface SovInsight {
  lines: string[]
  action?: string
}

export function sovInsight(data: SignalDataset): SovInsight | null {
  const social = data.social ?? []
  if (social.length === 0) return null
  // Latest period = the rows sharing the most recent periodStart.
  const latestStart = [...social].map(s => s.periodStart).sort().pop()!
  const latest = social.filter(s => s.periodStart === latestStart)
  const totalEng = latest.reduce((a, b) => a + b.engagements, 0)
  if (totalEng === 0) return null
  const name = (id: string) => { const e = entityById(data, id); return e ? e.name : id }
  const share = (id: string) => Math.round(100 * (latest.find(s => s.entityId === id)?.engagements ?? 0) / totalEng)
  const perPost = (id: string) => {
    const row = latest.find(s => s.entityId === id)
    return row && row.posts > 0 ? Math.round(row.engagements / row.posts) : 0
  }
  const moba = latest.find(s => s.entityId === 'moba')
  const comps = latest.filter(s => s.entityId !== 'moba').sort((a, b) => b.engagements - a.engagements)
  const top = comps[0]
  if (!moba || !top) return null

  const lines: string[] = []
  if (top.engagements > moba.engagements) {
    lines.push(`${name(top.entityId)} took ${share(top.entityId)}% of tracked engagement this period, against Moba's ${share('moba')}%.`)
  } else {
    lines.push(`Moba holds ${share('moba')}% of tracked engagement this period; ${name(top.entityId)} follows with ${share(top.entityId)}%.`)
  }
  const mobaEff = perPost('moba')
  const topEff = perPost(top.entityId)
  if (topEff > mobaEff) {
    lines.push(`${name(top.entityId)} is outperforming Moba on engagement efficiency: ${topEff} engagements per post vs ${mobaEff}.`)
  } else if (mobaEff > topEff && top.posts > moba.posts) {
    lines.push(`Moba earns more per post (${mobaEff} vs ${topEff}) but publishes less (${moba.posts} vs ${top.posts} posts): their volume is buying reach.`)
  }
  return {
    lines,
    action: top.engagements > moba.engagements || topEff > mobaEff
      ? `Review ${name(top.entityId)}'s three best-performing themes this period.`
      : undefined,
  }
}

// ── Event decisions (review §14) ─────────────────────────────────────────────

export interface EventDecision {
  kind: 'decision' | 'prepare'
  event: TradeEvent
  headline: string
  context: string
  question: string
  owner: string
}

export function eventDecisions(data: SignalDataset): EventDecision[] {
  const out: EventDecision[] = []
  const upcoming = data.events
    .filter(ev => ev.endDate >= data.asOf)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  for (const ev of upcoming) {
    const priority = ev.competitors.filter(c => entityById(data, c.entityId)?.priority)
    const names = (list: typeof ev.competitors) =>
      list.map(c => { const e = entityById(data, c.entityId); return e ? e.name : c.entityId }).join(' + ')
    if (!ev.mobaExhibiting && priority.length > 0) {
      out.push({
        kind: 'decision', event: ev,
        headline: `${ev.name}: ${names(ev.competitors)} attending, Moba absent`,
        context: ev.notes ?? `${REGION_LABELS[ev.region]} market moment with tracked competitors on the floor.`,
        question: 'Should Moba attend, partner or activate locally?',
        owner: `Events + ${REGION_OWNER[ev.region]}`,
      })
    } else if (ev.competitors.some(c => (c.sessions?.length ?? 0) > 0)) {
      const launcher = ev.competitors.find(c => (c.sessions?.length ?? 0) > 0)!
      out.push({
        kind: 'prepare', event: ev,
        headline: `${ev.name}: ${names([launcher])} · ${launcher.sessions![0]}`,
        context: ev.notes ?? 'Competitor stage moment on the calendar.',
        question: 'Prepare the Moba proof point and capture their wording on site.',
        owner: 'Events + Product marketing',
      })
    }
  }
  return out
}

// ── Data confidence (review §5): the evidence layer, one number in front ─────

export function dataConfidence(data: SignalDataset): { pct: number; ok: number; total: number; failed: number; stale: number } {
  const live = data.sources.filter(s => s.status !== 'proposed')
  const ok = live.filter(s => s.status === 'ok').length
  return {
    pct: live.length ? Math.round((100 * ok) / live.length) : 0,
    ok, total: live.length,
    failed: live.filter(s => s.status === 'failed').length,
    stale: live.filter(s => s.status === 'stale').length,
  }
}

// ── Region pulse (review §12): region → competitor → account → event ─────────

export interface RegionPulse {
  region: Region
  leaning: 'threat' | 'active' | 'quiet'
  count90d: number
  topCompetitor?: string
  accountSignal?: Signal
  nextEvent?: TradeEvent
}

export function regionPulse(data: SignalDataset): RegionPulse[] {
  const regions: Region[] = ['europe', 'americas', 'asia', 'mea']
  return regions.map(region => {
    const recent = competitorSignals(data).filter(s => s.region === region && daysBetween(s.date, data.asOf) <= 90)
    const counts = new Map<string, number>()
    for (const s of recent) {
      const lane = laneEntityId(data, s.entityId)
      counts.set(lane, (counts.get(lane) ?? 0) + 1)
    }
    const topLane = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    const topE = topLane ? entityById(data, topLane) : undefined
    const leaning: RegionPulse['leaning'] =
      recent.some(s => s.disposition === 'threat' || band(s) === 'critical') ? 'threat'
      : recent.length > 0 ? 'active' : 'quiet'
    const accountSignal = recent
      .filter(s => s.touchesMobaAccount)
      .sort((a, b) => b.date.localeCompare(a.date))[0]
    const nextEvent = data.events
      .filter(ev => ev.region === region && ev.endDate >= data.asOf)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
    return { region, leaning, count90d: recent.length, topCompetitor: topE ? entityLabel(topE) : undefined, accountSignal, nextEvent }
  })
}

// ── Universal search (review §18) ────────────────────────────────────────────

export interface SearchResults {
  signals: Signal[]
  events: TradeEvent[]
  claims: Claim[]
  whitespace: Whitespace[]
}

export function runSearch(data: SignalDataset, query: string): SearchResults | null {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return null
  const terms = q.split(/\s+/)
  const hit = (text: string) => {
    const t = text.toLowerCase()
    return terms.every(term => t.includes(term))
  }
  const signalText = (s: Signal) => {
    const e = entityById(data, s.entityId)
    const lane = entityById(data, laneEntityId(data, s.entityId))
    return [s.title, s.summary, e?.name, lane?.name, s.touchesMobaAccount, REGION_LABELS[s.region], s.category]
      .filter(Boolean).join(' ')
  }
  return {
    signals: sortForFeed(data.signals.filter(s => hit(signalText(s)))).slice(0, 12),
    events: data.events.filter(ev => hit(`${ev.name} ${ev.location} ${ev.country} ${ev.notes ?? ''}`)).slice(0, 6),
    claims: data.claims.filter(c =>
      hit(`${c.claim} ${c.pillar} ${c.competitorClaims.map(cc => `${cc.wording} ${cc.translation ?? ''}`).join(' ')}`)
    ).slice(0, 6),
    whitespace: data.whitespace.filter(w => hit(`${w.territory} ${w.rationale}`)).slice(0, 4),
  }
}

// ── Brief status (review §8): never show workflow emptiness ──────────────────

export function briefLine(data: SignalDataset): { headline: string; week?: string; empty: boolean } {
  if (data.brief) return { headline: data.brief.headline, week: data.brief.weekStart, empty: false }
  return { headline: 'No material change since the last brief.', empty: true }
}
