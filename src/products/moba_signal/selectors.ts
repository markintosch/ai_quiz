// FILE: src/products/moba_signal/selectors.ts
// ─── Moba Signal — scoring model and derived views ───────────────────────────
//
// Pure functions over the dataset. The impact model is the three-factor score
// from the PRD (§6): proximity + materiality + credibility, with display rules
// driven by the total. The rule that keeps it honest: an item can never be
// Critical on credibility 1. A loud rumour stays amber until someone verifies.

import type {
  Entity, Region, Signal, SignalDataset, Source,
} from './types'

// ── Ownership display rule ────────────────────────────────────────────────────
// Renders wherever the entity name renders: "Diamond (part of Moba)",
// "Staalkat (part of Sanovo)". Not a note in a description field.

export function entityLabel(e: Entity): string {
  if (e.ownership.kind === 'moba' && e.name !== 'Moba') return `${e.name} (part of Moba)`
  if (e.ownership.kind === 'group') return `${e.name} (part of ${e.ownership.parentName})`
  return e.name
}

export function entityById(data: SignalDataset, id: string): Entity | undefined {
  return data.entities.find(e => e.id === id)
}

/** Group rollup: a Staalkat win aggregates under Sanovo; Moba brands under Moba. */
export function laneEntityId(data: SignalDataset, entityId: string): string {
  const e = entityById(data, entityId)
  if (!e) return entityId
  if (e.ownership.kind === 'moba') return 'moba'
  if (e.ownership.kind === 'group') return e.ownership.parentId
  return e.id
}

// ── Impact score and display band ─────────────────────────────────────────────

export type Band = 'critical' | 'notable' | 'context' | 'noise'

export function impactScore(s: Signal): number {
  return s.proximity + s.materiality + s.credibility
}

export function band(s: Signal): Band {
  const score = impactScore(s)
  // Honesty rule: never Critical on credibility 1
  if (score >= 8 && s.credibility > 1) return 'critical'
  if (score >= 5) return 'notable'
  if (score >= 3) return 'context'
  return 'noise'
}

export const BAND_META: Record<Band, { label: string; dot: string; badge: string }> = {
  critical: { label: 'Critical', dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200' },
  notable:  { label: 'Notable',  dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  context:  { label: 'Context',  dot: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-600 border-gray-200' },
  noise:    { label: 'Noise',    dot: 'bg-gray-300',   badge: 'bg-gray-50 text-gray-400 border-gray-200' },
}

// ── Date helpers (everything relative to data.asOf, never the wall clock) ─────

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

function withinDays(data: SignalDataset, date: string, days: number): boolean {
  const d = daysBetween(date, data.asOf)
  return d >= 0 && d < days
}

// ── Tier 1: status bar numbers, each against its baseline ─────────────────────

export interface StatusMetric {
  key: string
  label: string
  value: number | string
  baseline: string
  /** 'up-bad' | 'up-good' | 'flat' — colours the delta correctly per metric */
  tone: 'alert' | 'watch' | 'ok'
}

function isCompetitorSignal(data: SignalDataset, s: Signal): boolean {
  return laneEntityId(data, s.entityId) !== 'moba'
}

export function statusMetrics(data: SignalDataset): StatusMetric[] {
  const comp = data.signals.filter(s => isCompetitorSignal(data, s))

  // Announcements last 7 days vs rolling 12-week weekly average
  const last7 = comp.filter(s => withinDays(data, s.date, 7)).length
  const last84 = comp.filter(s => withinDays(data, s.date, 84)).length
  const weeklyAvg = Math.round((last84 / 12) * 10) / 10

  // Announced wins, last 30 vs prior 30
  const wins30 = comp.filter(s => s.type === 'win' && withinDays(data, s.date, 30)).length
  const winsPrior30 = comp.filter(s =>
    s.type === 'win' && !withinDays(data, s.date, 30) && withinDays(data, s.date, 60)
  ).length

  // Contested claims
  const contested = data.claims.filter(c => c.status === 'contested' || c.status === 'conceded').length
  const totalClaims = data.claims.length

  // New technology signals, last 30 days
  const tech30 = comp.filter(s =>
    (s.category === 'detection' || s.category === 'digital') && withinDays(data, s.date, 30)
  ).length
  const techPrior30 = comp.filter(s =>
    (s.category === 'detection' || s.category === 'digital') &&
    !withinDays(data, s.date, 30) && withinDays(data, s.date, 60)
  ).length

  // Days since last verified competitor move per priority region
  const regions: Region[] = ['asia', 'europe', 'americas']
  const staleness = regions.map(r => {
    const latest = comp
      .filter(s => s.region === r && s.status === 'verified')
      .map(s => s.date).sort().pop()
    return { r, days: latest ? daysBetween(latest, data.asOf) : 999 }
  })
  const worst = staleness.reduce((a, b) => (b.days > a.days ? b : a))

  // Source health
  const live = data.sources.filter(s => s.status !== 'proposed')
  const ok = live.filter(s => s.status === 'ok').length

  return [
    { key: 'announcements', label: 'Competitor announcements, 7d', value: last7,
      baseline: `vs ${weeklyAvg}/wk 12-wk avg`, tone: last7 > weeklyAvg * 1.5 ? 'alert' : last7 > weeklyAvg ? 'watch' : 'ok' },
    { key: 'wins', label: 'Announced wins, 30d', value: wins30,
      baseline: `vs ${winsPrior30} prior 30d`, tone: wins30 > winsPrior30 ? 'alert' : 'ok' },
    { key: 'contested', label: 'Contested claims', value: contested,
      baseline: `of ${totalClaims} in messaging house`, tone: contested >= 3 ? 'alert' : contested > 0 ? 'watch' : 'ok' },
    { key: 'tech', label: 'New tech signals, 30d', value: tech30,
      baseline: `vs ${techPrior30} prior 30d`, tone: tech30 > techPrior30 ? 'watch' : 'ok' },
    { key: 'regions', label: `Quietest region: ${worst.r}`, value: `${worst.days}d`,
      baseline: 'since last verified move', tone: worst.days > 30 ? 'watch' : 'ok' },
    { key: 'sources', label: 'Sources healthy', value: `${ok}/${live.length}`,
      baseline: ok === live.length ? 'all reporting' : `${live.length - ok} degraded or failed`,
      tone: live.length - ok >= 2 ? 'watch' : ok === live.length ? 'ok' : 'watch' },
  ]
}

// ── Tier 2: headline ──────────────────────────────────────────────────────────

export function headline(data: SignalDataset): { text: string; author: string | null } {
  if (data.headlineOverride) {
    return { text: data.headlineOverride.text, author: data.headlineOverride.author }
  }
  // Auto-generated fallback, written the way an analyst would open a briefing
  const criticals = data.signals.filter(s => band(s) === 'critical' && withinDays(data, s.date, 30))
  const contested = data.claims.filter(c => c.status === 'contested')
  const parts: string[] = []
  if (criticals.length > 0) parts.push(`${criticals.length} critical item${criticals.length > 1 ? 's' : ''} in the last 30 days.`)
  if (contested.length > 0) parts.push(`${contested.length} messaging-house claim${contested.length > 1 ? 's are' : ' is'} directly contested.`)
  if (parts.length === 0) parts.push('No critical movement in the last 30 days. Watch items only.')
  return { text: parts.join(' '), author: null }
}

// ── Feed sorting: critical first, then recency ────────────────────────────────

const BAND_ORDER: Record<Band, number> = { critical: 0, notable: 1, context: 2, noise: 3 }

export function sortForFeed(signals: Signal[]): Signal[] {
  return [...signals].sort((a, b) => {
    const d = BAND_ORDER[band(a)] - BAND_ORDER[band(b)]
    if (d !== 0) return d
    return b.date.localeCompare(a.date)
  })
}

// ── Event radar helpers ───────────────────────────────────────────────────────

export type EventPhase = { stage: string; note: string }

export function eventPhase(data: SignalDataset, startDate: string, endDate: string): EventPhase {
  const toStart = daysBetween(data.asOf, startDate)
  const afterEnd = daysBetween(endDate, data.asOf)
  if (afterEnd > 30) return { stage: 'Closed', note: 'harvest complete' }
  if (afterEnd > 14) return { stage: 'T+30', note: 'year-on-year comparison due' }
  if (afterEnd >= 0) return { stage: 'T+14', note: 'announcement harvest running' }
  if (toStart <= 0) return { stage: 'Live', note: 'daily digest active' }
  if (toStart <= 7) return { stage: 'T-7', note: 'press release watch' }
  if (toStart <= 30) return { stage: 'T-30', note: 'pre-event brief due' }
  if (toStart <= 60) return { stage: 'T-60', note: 'stand and session sweep' }
  if (toStart <= 90) return { stage: 'T-90', note: 'exhibitor list watch' }
  return { stage: 'Watching', note: `${toStart} days out` }
}

// ── Source health summary ─────────────────────────────────────────────────────

export function sourceStatusMeta(s: Source): { label: string; cls: string } {
  switch (s.status) {
    case 'ok':     return { label: 'OK',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'stale':  return { label: 'Stale',   cls: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'failed': return { label: 'Failed',  cls: 'bg-red-50 text-red-700 border-red-200' }
    default:       return { label: 'Proposed', cls: 'bg-gray-100 text-gray-600 border-gray-200' }
  }
}

// ── Formatting ────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fmtDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : ''))
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function fmtMonth(iso: string): string {
  const d = new Date(iso.length === 7 ? iso + '-01T00:00:00Z' : iso)
  return `${MONTHS[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`
}
