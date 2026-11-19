// FILE: src/products/moba_signal/profile.ts
// ─── Moba Signal — company profile model ─────────────────────────────────────
//
// A profile is the standing, researched picture of one competitor group,
// rendered as its own tab on the Signal page. It sits next to the scored
// dataset, never inside it:
//
//   - The scored items (data.signals) stay the system of record for "what
//     happened". The profile tab reads them live, filtered to the group.
//   - The profile adds what the item model cannot hold: the newsroom digest
//     as read by a researcher, corporate and legal structure, owned channels,
//     communication guardrails, and the input plan for closing gaps.
//
// Same trust rules as the rest of Signal: every statement carries a source
// URL, a verification state and the date it was researched. Unverified stays
// labelled until someone opens the source and confirms it.

import type { Signal, SignalDataset } from './types'
import { laneEntityId } from './selectors'

/** verified = a person read the source · snippet = read from search results only · unconfirmed = found, not yet traced to an official page */
export type Verification = 'verified' | 'snippet' | 'unconfirmed'

export const VERIFICATION_META: Record<Verification, { label: string; cls: string; hint: string }> = {
  verified:    { label: 'Verified',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', hint: 'A person opened the source and confirmed the statement.' },
  snippet:     { label: 'From search', cls: 'bg-amber-50 text-amber-700 border-amber-200',       hint: 'Read from search results and syndicated copies. Open the source before quoting it.' },
  unconfirmed: { label: 'Unconfirmed', cls: 'bg-gray-100 text-gray-600 border-gray-200',         hint: 'Found, but not yet traced to an official page.' },
}

export type NewsTopic = 'product' | 'partnership' | 'footprint' | 'corporate' | 'legal' | 'channel'

export const NEWS_TOPIC_LABELS: Record<NewsTopic, string> = {
  product:     'Product',
  partnership: 'Partnership',
  footprint:   'Footprint',
  corporate:   'Corporate',
  legal:       'Legal & IP',
  channel:     'Channel',
}

/** One item in the researched newsroom digest. */
export interface NewsDigestItem {
  id: string
  /** ISO date of publication; undated items carry the date first seen. */
  date: string
  undated?: boolean
  title: string
  summary: string
  topic: NewsTopic
  /** The internal read: why a Moba colleague should care. Interpretation, labelled as such. */
  forMoba: string
  sourceUrl: string
  /** Secondary coverage, when the trade press picked it up. */
  alsoCovered?: { label: string; url: string }[]
  verification: Verification
  /** Marks the item the tab leads with. */
  headline?: boolean
}

export interface ProfileFact {
  label: string
  /** Indent level in the structure tree: 0 ultimate owner, 3 operating subsidiary. */
  depth?: number
  value: string
  sourceUrl?: string
  verification: Verification
}

export interface SocialChannel {
  platform: string
  handle: string
  /** Absent when no official account was found. */
  url?: string
  /** What the channel is used for, as far as observed. */
  use: string
  verification: Verification
  /** How Signal reads this channel today, or why it does not. */
  collection: string
}

export interface LegalMatter {
  id: string
  title: string
  status: string
  date?: string
  detail: string
  /** What internal Moba people should and should not do about it. */
  guidance: string
  sourceUrl?: string
  verification: Verification
  severity: 'high' | 'medium' | 'low'
}

export interface CommsRule {
  rule: string
  why: string
  /** The legal basis, named so legal counsel can check it quickly. */
  basis: string
}

export interface InputSource {
  name: string
  url?: string
  kind: 'online' | 'upload'
  feeds: string
  /** live = already collected · proposed = in the curator queue · idea = not yet proposed */
  state: 'live' | 'proposed' | 'idea'
  legalNote?: string
}

export interface ChangedPicture {
  title: string
  detail: string
  /** Which Signal module needs updating as a result. */
  affects: string
  sourceUrl?: string
}

/** A dated appearance the research found, independent of the sample event calendar. */
export interface ProfileEvent {
  name: string
  startDate: string
  endDate: string
  location: string
  note: string
  sourceUrl: string
  verification: Verification
}

export interface CompanyProfile {
  entityId: string
  name: string
  researchedOn: string
  researchedBy: string
  oneLiner: string
  facts: ProfileFact[]
  structure: ProfileFact[]
  digest: NewsDigestItem[]
  changed: ChangedPicture[]
  upcoming: ProfileEvent[]
  socials: SocialChannel[]
  legal: LegalMatter[]
  commsRules: CommsRule[]
  collectionRules: CommsRule[]
  inputs: InputSource[]
  /** Gaps the researcher could not close, shown so silence is not read as calm. */
  gaps: string[]
}

// ── Selectors ─────────────────────────────────────────────────────────────────

/** Every scored item that rolls up into the profile's group (Staalkat included). */
export function groupSignals(data: SignalDataset, entityId: string): Signal[] {
  return data.signals
    .filter(s => laneEntityId(data, s.entityId) === entityId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

/** Entity ids in the group: the parent plus every brand that rolls up into it. */
export function groupEntityIds(data: SignalDataset, entityId: string): string[] {
  return data.entities.filter(e => laneEntityId(data, e.id) === entityId).map(e => e.id)
}

/** A dataset narrowed to one group, for reusing the standard modules (timeline, head to head). */
export function groupDataset(data: SignalDataset, entityId: string): SignalDataset {
  const ids = new Set(groupEntityIds(data, entityId))
  return {
    ...data,
    // Moba's own moves stay in, so the timeline keeps our lane for contrast.
    signals: data.signals.filter(s => ids.has(s.entityId) || laneEntityId(data, s.entityId) === 'moba'),
    headToHead: data.headToHead.filter(h => ids.has(h.entityId)),
    events: data.events.filter(ev => ev.competitors.some(c => ids.has(c.entityId))),
  }
}

export type LatestEntry =
  | { kind: 'signal'; date: string; signal: Signal }
  | { kind: 'digest'; date: string; item: NewsDigestItem }

/**
 * The tab's lead list: scored items and newsroom digest in one chronology,
 * newest first. Each entry keeps its origin so the reader always knows
 * whether an item went through scoring and review or is researcher reading.
 */
export function latestFromGroup(data: SignalDataset, profile: CompanyProfile): LatestEntry[] {
  const fromSignals: LatestEntry[] = groupSignals(data, profile.entityId).map(s => ({ kind: 'signal', date: s.date, signal: s }))
  const fromDigest: LatestEntry[] = profile.digest.map(item => ({ kind: 'digest', date: item.date, item }))
  // Undated digest items carry the research date; they go last, not first.
  const undated = (e: LatestEntry) => (e.kind === 'digest' && e.item.undated ? 1 : 0)
  return [...fromSignals, ...fromDigest].sort((a, b) => undated(a) - undated(b) || b.date.localeCompare(a.date))
}

/** The later of the dataset date and the research date: relative ages count from here. */
export function profileAsOf(data: SignalDataset, profile: CompanyProfile): string {
  return data.asOf > profile.researchedOn ? data.asOf : profile.researchedOn
}

// ── Evidence: every source the tab relies on ──────────────────────────────────

export interface EvidenceSource {
  url: string
  host: string
  /** Where on the tab the source is cited, e.g. "Newsroom digest". */
  usedIn: string[]
  /** How many statements cite it. */
  citations: number
  /** The weakest verification among the statements that cite it. */
  verification: Verification
  /** Publisher class, for grouping. */
  publisher: 'company' | 'trade-press' | 'registry' | 'partner' | 'other' | 'scored'
}

const RANK: Record<Verification, number> = { verified: 2, snippet: 1, unconfirmed: 0 }

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function publisherOf(host: string, entityId: string): EvidenceSource['publisher'] {
  if (host.includes(entityId) || host.includes('linkedin.com') || host.includes('youtube.com')) return 'company'
  if (/wattagnet|thepoultrysite|poultryworld|agribiz|invision|vivasia|avinews/.test(host)) return 'trade-press'
  if (/opencorporates|estatistik|justia|greyb|espacenet|epo\.org|virk|kvk|tmdn|thornico/.test(host)) return 'registry'
  if (/eggfarmers|getcracking|farmmarketer|matrixspec/.test(host)) return 'partner'
  return 'other'
}

export const PUBLISHER_LABELS: Record<EvidenceSource['publisher'], string> = {
  company:       'Sanovo\'s own channels',
  'trade-press': 'Trade press',
  registry:      'Registries, owner and IP data',
  partner:       'Partners and associations',
  other:         'Other',
  scored:        'Cited by scored items',
}

/** Every source URL behind the profile tab, deduplicated, weakest verification kept. */
export function profileEvidence(data: SignalDataset, profile: CompanyProfile): EvidenceSource[] {
  const map = new Map<string, EvidenceSource>()
  const add = (url: string | undefined, usedIn: string, v: Verification, scored = false) => {
    if (!url) return
    const cur = map.get(url)
    if (cur) {
      cur.citations += 1
      if (!cur.usedIn.includes(usedIn)) cur.usedIn.push(usedIn)
      if (RANK[v] < RANK[cur.verification]) cur.verification = v
      return
    }
    const host = hostOf(url)
    map.set(url, { url, host, usedIn: [usedIn], citations: 1, verification: v, publisher: scored ? 'scored' : publisherOf(host, profile.entityId) })
  }
  profile.digest.forEach(d => {
    add(d.sourceUrl, 'Newsroom digest', d.verification)
    d.alsoCovered?.forEach(c => add(c.url, 'Newsroom digest', d.verification))
  })
  profile.facts.forEach(f => add(f.sourceUrl, 'Company facts', f.verification))
  profile.structure.forEach(f => add(f.sourceUrl, 'Group structure', f.verification))
  profile.legal.forEach(l => add(l.sourceUrl, 'Legal', l.verification))
  profile.socials.forEach(c => add(c.url, 'Channels', c.verification))
  profile.changed.forEach(c => add(c.sourceUrl, 'What changed', 'snippet'))
  profile.upcoming.forEach(e => add(e.sourceUrl, 'Upcoming', e.verification))
  groupSignals(data, profile.entityId).forEach(s =>
    add(s.sourceUrl, 'Scored items', s.humanReviewed && s.status === 'verified' ? 'verified' : 'unconfirmed', true))
  const order = Object.keys(PUBLISHER_LABELS)
  return [...map.values()].sort((a, b) =>
    order.indexOf(a.publisher) - order.indexOf(b.publisher) || b.citations - a.citations || a.host.localeCompare(b.host))
}
