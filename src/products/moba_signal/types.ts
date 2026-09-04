// FILE: src/products/moba_signal/types.ts
// ─── Moba Signal — domain model ──────────────────────────────────────────────
//
// Competitive intelligence dashboard for Moba (marketing + innovation).
// See docs/PRD-moba-signal.md for the full specification.
//
// Design rule from the PRD (§8.2): the system holds a graph, not a feed.
// Every assertion carries provenance, confidence, who asserted it and whether a
// human reviewed it. Nothing is ever silently overwritten.

// ── Geography ─────────────────────────────────────────────────────────────────

export type Region = 'europe' | 'americas' | 'asia' | 'mea' | 'global'

export const REGION_LABELS: Record<Region, string> = {
  europe:   'Europe',
  americas: 'Americas',
  asia:     'Asia Pacific',
  mea:      'Middle East & Africa',
  global:   'Global',
}

// ── Entities ──────────────────────────────────────────────────────────────────

export type EntityType =
  | 'competitor'
  | 'brand'
  | 'product'
  | 'technology'
  | 'customer'
  | 'facility'
  | 'event'
  | 'market'

/**
 * Ownership is a required field on every entity (PRD §8.2 and appendix).
 * It drives a display label that renders wherever the entity name renders, so a
 * reader never has to remember who owns what: "Diamond (part of Moba)",
 * "Staalkat (part of Sanovo)".
 */
export type Ownership =
  | { kind: 'independent' }
  | { kind: 'moba' }
  | { kind: 'group'; parentId: string; parentName: string }

export interface Entity {
  id: string
  name: string
  type: EntityType
  ownership: Ownership
  /** Priority competitors drive alerting, timeline lanes and event monitoring. */
  priority?: boolean
  regions?: Region[]
  /** One line on why this entity is tracked. */
  note?: string
  addedOn: string
  /** Backfill state, so the timeline shows how deep history goes (PRD §8.3). */
  backfilledTo?: string
}

// ── Signals ───────────────────────────────────────────────────────────────────

export type SignalType =
  | 'launch'
  | 'win'
  | 'partnership'
  | 'personnel'
  | 'facility'
  | 'funding'
  | 'certification'
  | 'moba'

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  launch:        'Product launch',
  win:           'Win announced',
  partnership:   'Partnership',
  personnel:     'Personnel',
  facility:      'Facility',
  funding:       'Funding',
  certification: 'Certification',
  moba:          'Moba move',
}

export type Category =
  | 'grading'
  | 'processing'
  | 'detection'
  | 'digital'
  | 'service'
  | 'sustainability'
  | 'corporate'

export const CATEGORY_LABELS: Record<Category, string> = {
  grading:        'Grading',
  processing:     'Processing',
  detection:      'Detection & vision',
  digital:        'Digital & connected',
  service:        'Service network',
  sustainability: 'Sustainability',
  corporate:      'Corporate',
}

/** 3 = names a Moba account/claim/stronghold · 2 = our segment · 1 = adjacent */
export type Proximity = 1 | 2 | 3
/** 3 = capability or structural shift · 2 = product update, notable win · 1 = marketing */
export type Materiality = 1 | 2 | 3
/** 3 = primary source, analyst verified · 2 = trade press · 1 = social, rumour, inference */
export type Credibility = 1 | 2 | 3

export type VerificationStatus = 'verified' | 'unverified' | 'disputed' | 'superseded'

export type AgentName = 'collector' | 'verifier' | 'analyst' | 'positioning' | 'editor' | 'curator' | 'human'

/** Analyst decision label, set at approval: what kind of signal is this for Moba. */
export type Disposition = 'threat' | 'opportunity' | 'watch' | 'neutral'
export type RecommendedAction = 'ignore' | 'monitor' | 'investigate' | 'respond'

export const DISPOSITION_META: Record<Disposition, { label: string; badge: string }> = {
  threat:      { label: 'Threat',      badge: 'bg-red-50 text-red-700 border-red-200' },
  opportunity: { label: 'Opportunity', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  watch:       { label: 'Watch',       badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  neutral:     { label: 'Neutral',     badge: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export interface Reply {
  id: string
  author: string
  role: string
  createdAt: string
  body: string
}

/**
 * The structured "so what" (PRD §7). Three prompts rather than a free-text box,
 * because a structured prompt is what keeps the annotation habit alive past
 * month two. Annotations are immutable to the agent and versioned.
 */
export interface Annotation {
  id: string
  author: string
  role: string
  createdAt: string
  means: string
  consider: string
  whoNeedsToKnow: string
  promotedToBriefing: boolean
  replies: Reply[]
}

export interface Signal {
  id: string
  /** ISO date of the underlying event, not of collection. */
  date: string
  entityId: string
  /** Secondary entities this item attaches to: markets, products, customers. */
  linkedEntityIds: string[]
  title: string
  summary: string
  type: SignalType
  region: Region
  category: Category
  proximity: Proximity
  materiality: Materiality
  credibility: Credibility
  status: VerificationStatus
  /** Provenance — never optional (PRD §8.6). */
  sourceId: string
  sourceUrl: string
  firstSeen: string
  lastConfirmed: string
  assertedBy: AgentName
  humanReviewed: boolean
  /** Marks the item as an inference rather than a reported fact. */
  inference?: boolean
  /** Claims in the Moba messaging house this item touches. */
  claimIds?: string[]
  /** Set when the item names or sits inside a Moba reference account or region. */
  touchesMobaAccount?: string
  /** Analyst decision labels, set at approval time. */
  disposition?: Disposition
  recommendedAction?: RecommendedAction
  annotations: Annotation[]
  /** Contributed by a human rather than collected by the agent (PRD §8.8). */
  contribution?: {
    contributor: string
    channel: ContributionChannel
    /** The one required line: why they sent it. */
    why: string
    confidential: boolean
  }
}

// ── Claims and positioning ────────────────────────────────────────────────────

export type ContestedStatus = 'uncontested' | 'adjacent' | 'contested' | 'conceded'

export const CONTESTED_LABELS: Record<ContestedStatus, string> = {
  uncontested: 'Uncontested',
  adjacent:    'Adjacent claim',
  contested:   'Directly contested',
  conceded:    'Conceded',
}

export interface CompetitorClaim {
  entityId: string
  /** Their wording, in the source language, plus a translation for display. */
  wording: string
  sourceLanguage?: string
  translation?: string
  sourceUrl: string
  lastSeen: string
}

export interface Claim {
  id: string
  claim: string
  /** Which part of the messaging house this row belongs to. */
  pillar: string
  status: ContestedStatus
  /** Change over the last two quarters: -1 eroding, 0 stable, 1 strengthening. */
  trend: -1 | 0 | 1
  competitorClaims: CompetitorClaim[]
  /** True while the messaging house is not final (hard dependency, PRD §12). */
  placeholder?: boolean
}

export interface Whitespace {
  id: string
  territory: string
  rationale: string
}

// ── Head to head ──────────────────────────────────────────────────────────────

export type AxisKey =
  | 'capacity'
  | 'processing'
  | 'detection'
  | 'digital'
  | 'service'
  | 'sustainability'

export interface ComparisonAxis {
  key: AxisKey | string
  label: string
  /** Axes proposed by the Positioning agent await analyst approval (PRD §8.3). */
  proposed?: boolean
  proposedRationale?: string
}

export interface ComparisonCell {
  axis: string
  moba: string
  competitor: string
  /** Analyst judgement: 1 Moba ahead, 0 par, -1 behind. Drives the advantage strip. */
  edge: -1 | 0 | 1
  /** Confidence in the competitor side of the cell. */
  confidence: Credibility
  lastVerified: string
}

export interface HeadToHead {
  entityId: string
  summary: string
  cells: ComparisonCell[]
}

// ── Events ────────────────────────────────────────────────────────────────────

export type EventStage = 't-90' | 't-60' | 't-30' | 't-7' | 'live' | 't+14' | 't+30' | 'closed'

export interface TradeEvent {
  id: string
  name: string
  location: string
  country: string
  region: Region
  startDate: string
  endDate: string
  mobaExhibiting: boolean
  /** Competitor presence as far as the exhibitor list has been published. */
  competitors: Array<{
    entityId: string
    standSqm?: number
    standSqmLastEdition?: number
    hall?: string
    sessions?: string[]
  }>
  /** Set when the source list is known to be partial. */
  exhibitorListStatus: 'published' | 'partial' | 'not-published'
  notes?: string
}

// ── Sources ───────────────────────────────────────────────────────────────────

export type SourceStatus = 'ok' | 'stale' | 'failed' | 'proposed'

export type SourceClass =
  | 'competitor-site'
  | 'trade-press'
  | 'patents'
  | 'events'
  | 'social'
  | 'jobs'
  | 'association'
  | 'customer'
  | 'human'

export interface Source {
  id: string
  name: string
  url: string
  sourceClass: SourceClass
  status: SourceStatus
  lastRun: string
  lastItem: string | null
  itemsLast30d: number
  scoredItemsLast90d: number
  /** Set when the run failed, so the panel can say what broke. */
  failureReason?: string
  language?: string
  /** Sitemap scanning state: how many pages the site lists, and additions. */
  sitemap?: {
    pages: number
    newLast30d: number
    checkedAt?: string
  }
}

// ── Contribution and approvals ────────────────────────────────────────────────

export type ContributionChannel = 'email' | 'photo' | 'url' | 'upload' | 'chat' | 'voice' | 'question'

export const CHANNEL_LABELS: Record<ContributionChannel, string> = {
  email:    'Forwarded email',
  photo:    'Photo capture',
  url:      'Pasted URL',
  upload:   'Uploaded document',
  chat:     'Teams channel',
  voice:    'Voice note',
  question: 'Question for the queue',
}

export type ProposalKind = 'source' | 'entity' | 'axis' | 'contribution' | 'claim-status'
export type ProposalState = 'pending' | 'accepted' | 'rejected'

export interface Proposal {
  id: string
  kind: ProposalKind
  title: string
  rationale: string
  proposedBy: AgentName
  proposedOn: string
  state: ProposalState
  /** Evidence pointer, so the analyst can check before accepting. */
  sourceUrl?: string
  /** Human contributions carry the required "why I am sending this" line. */
  why?: string
  contributor?: string
  channel?: ContributionChannel
  confidential?: boolean
}

// ── Open questions ────────────────────────────────────────────────────────────

export interface OpenQuestion {
  id: string
  question: string
  askedBy: string
  askedOn: string
  attempts: number
  lastAttempt: string
  state: 'open' | 'resolved'
  resolution?: string
}

// ── Context corpus ────────────────────────────────────────────────────────────

/**
 * Context is internal material that changes how everything else is read
 * (PRD §8.8). It is never scored and never appears in the feed. Each item has
 * an owner and a review date, and goes amber when the review date passes,
 * because a stale messaging house silently corrupts every claim assessment.
 */
export interface ContextItem {
  id: string
  name: string
  owner: string
  loadedOn: string
  reviewBy: string
  note?: string
}

// ── Weekly competitive brief (Editor agent drafts, analyst approves) ──────────

export interface BriefChange { entity: string; change: string }

export interface CompetitiveBrief {
  weekStart: string
  temperature: 'elevated' | 'normal' | 'quiet'
  headline: string
  whatHappened: string
  keyDevelopment: string
  whyItMatters: string
  mobaAdvantage: string
  marketingResponse: string
  salesResponse: string
  watchNext: string
  changes: BriefChange[]
  approvedBy?: string
  approvedAt?: string
}

// ── Share of voice (LinkedIn competitor analytics) ────────────────────────────

/** One period's totals for one entity, pages rolled up, namesakes excluded. */
export interface SocialStat {
  entityId: string
  periodStart: string
  periodEnd: string
  followers: number
  newFollowers: number
  engagements: number
  posts: number
}

// ── Brand & positioning paper (Positioning agent drafts, analyst approves) ────
//
// One edition per quarter, identical structure every time so editions compare.
// Every profile statement carries a source URL (provenance rule). The theme
// taxonomy is the comparability backbone: fixed after edition 1.

export const PAPER_THEMES = {
  integration:    'Integration & keten',
  foodsafety:     'Food safety & quality',
  capacity:       'Capacity & throughput',
  sustainability: 'Sustainability & energy',
  digital:        'Digitalisation & data',
  service:        'Service & uptime',
  welfare:        'Animal welfare',
  cost:           'Cost efficiency',
} as const
export type PaperThemeKey = keyof typeof PAPER_THEMES

/** One sourced statement: nothing enters a paper without a URL behind it. */
export interface PaperFact {
  text: string
  sourceUrl: string
}

/** 0 = absent from their messaging · 1 = mentioned · 2 = recurring · 3 = core theme */
export interface PaperThemeScore {
  score: 0 | 1 | 2 | 3
  evidence: PaperFact[]
}

export interface PaperProfile {
  entityId: string
  /** Facts only: HQ, ownership, segments, regions. */
  snapshot: PaperFact[]
  /** Their own words: tagline and the promise their copy keeps making. */
  tagline?: string
  positioningSummary: string
  /** Claims they repeat, quoted or tightly paraphrased. */
  claims: PaperFact[]
  themes: Partial<Record<PaperThemeKey, PaperThemeScore>>
  /** Who their copy speaks to. */
  audience: PaperFact[]
  /** What they lean on: installed base, technology names, certifications. */
  proofPoints: PaperFact[]
  /** Publishing behaviour, from the source stats and share-of-voice data. */
  channelBehaviour: string
}

/** Position on the fixed 2×2. 0–100 on both axes; the axes never change. */
export interface PaperMapPlacement {
  entityId: string
  /** Integration breadth: 0 = single machine, 100 = full line / keten. */
  x: number
  /** Innovation posture: 0 = proven & reliable, 100 = frontier & tech-led. */
  y: number
  rationale: string
}

export interface PaperClaimCollision {
  claim: string
  entityIds: string[]
  note: string
}

export interface PaperChange {
  entityId: string
  field: string
  change: string
}

export interface PositioningPaper {
  /** e.g. '2026-Q3'. One edition per quarter. */
  edition: string
  subjects: string[]
  generatedAt: string
  profiles: PaperProfile[]
  map: { placements: PaperMapPlacement[] }
  collisions: PaperClaimCollision[]
  /** Field-level differences vs the previous approved edition. Computed, not drafted. */
  changes: PaperChange[]
  /** The only opinionated section. Agent drafts, the analyst owns the wording. */
  implications: string
  approvedBy?: string
  approvedAt?: string
}

export const PAPER_AXES = {
  x: { label: 'Integration breadth', low: 'Single machine', high: 'Full line / keten' },
  y: { label: 'Innovation posture', low: 'Proven & reliable', high: 'Frontier & tech-led' },
} as const

// ── The dataset the dashboard renders ─────────────────────────────────────────

export interface SignalDataset {
  /** Everything is computed against this date so the prototype is deterministic. */
  asOf: string
  entities: Entity[]
  signals: Signal[]
  claims: Claim[]
  whitespace: Whitespace[]
  axes: ComparisonAxis[]
  headToHead: HeadToHead[]
  events: TradeEvent[]
  sources: Source[]
  proposals: Proposal[]
  questions: OpenQuestion[]
  context: ContextItem[]
  /** LinkedIn share-of-voice periods, entity-rolled. Empty until an export is imported. */
  social?: SocialStat[]
  /** Latest APPROVED weekly brief. Absent until the analyst approves one. */
  brief?: CompetitiveBrief
  /** Latest APPROVED brand & positioning paper. Absent until one is approved. */
  paper?: PositioningPaper
  /** Analyst-written headline. Immutable to the agent once set (PRD §8.6). */
  headlineOverride?: { text: string; author: string; writtenOn: string }
}
