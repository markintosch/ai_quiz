// ─────────────────────────────────────────────────────────────────────────────
// Oncology Market Readiness Assessment — Static Data
// Kirk & Blackbeard | PRD v1.0 | Synthesised from spec (no JSON attachments)
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ──────────────────────────────────────────────────────────────────

export interface Market {
  id: string
  name: string
  flag: string
  region: string
  archetype: string // PRD §5.5 gap profile label
}

export interface Dimension {
  id: string
  name: string
  short: string
  description: string
  roles: string[] // which roles primarily assess this
}

export interface Question {
  id: string
  dimensionId: string
  text: string
  lowAnchor: string  // describes score 1
  highAnchor: string // describes score 4
}

export interface GTMRule {
  id: string
  condition: (gtm: GTMState, scores: DimScores) => boolean
  severity: 'HIGH RISK' | 'MISALIGNED' | 'CAPABILITY GAP' | 'BLIND SPOT' | 'LOW PRIORITY' | 'OVERREACH'
  flag: string
  action: string
}

export interface PlaybookArchetype {
  profile: string
  headline: string
  focus: string
  topActions: string[]
  example: string
}

export interface GTMState {
  launchPhase: 'pre_launch' | 'soft_launch' | 'full_launch' | 'mature' | ''
  segments: string[]
  channel: 'direct' | 'distributor' | 'hybrid' | 'digital' | ''
  budget: number   // EUR thousands
  keyAccounts: number
  priorities: string[]
  timeline: string
}

export type DimScores = Record<string, number>

// ── Markets ────────────────────────────────────────────────────────────────

export const MARKETS: Market[] = [
  { id: 'de', name: 'Germany',         flag: '🇩🇪', region: 'DACH',     archetype: 'High Competitive Lock-in' },
  { id: 'fr', name: 'France',          flag: '🇫🇷', region: 'Western',  archetype: 'High Clinical + Low Reimbursement' },
  { id: 'uk', name: 'United Kingdom',  flag: '🇬🇧', region: 'Northern', archetype: 'Acceleration Mode' },
  { id: 'nl', name: 'Netherlands',     flag: '🇳🇱', region: 'Benelux',  archetype: 'Developing — Balanced' },
  { id: 'es', name: 'Spain',           flag: '🇪🇸', region: 'Southern', archetype: 'Low Clinical + High Reimbursement' },
  { id: 'it', name: 'Italy',           flag: '🇮🇹', region: 'Southern', archetype: 'Foundation Building' },
  { id: 'ch', name: 'Switzerland',     flag: '🇨🇭', region: 'DACH',     archetype: 'Developing — Strong' },
  { id: 'be', name: 'Belgium',         flag: '🇧🇪', region: 'Benelux',  archetype: 'Low Commercial Readiness' },
  { id: 'at', name: 'Austria',         flag: '🇦🇹', region: 'DACH',     archetype: 'Developing — Balanced' },
  { id: 'no', name: 'Nordics',         flag: '🇸🇪', region: 'Northern', archetype: 'Developing — Strong Growth' },
]

// ── Dimensions ─────────────────────────────────────────────────────────────

export const DIMENSIONS: Dimension[] = [
  {
    id: 'clinical',
    name: 'Clinical Adoption Maturity',
    short: 'Clinical',
    description: 'How far clinicians are in adopting new diagnostic technologies',
    roles: ['Medical Affairs', 'Country Head'],
  },
  {
    id: 'reimbursement',
    name: 'Reimbursement & Access',
    short: 'Reimbursement',
    description: 'Maturity of the reimbursement landscape for oncology diagnostics',
    roles: ['Market Access', 'Country Head'],
  },
  {
    id: 'stakeholder',
    name: 'Stakeholder Alignment',
    short: 'Stakeholders',
    description: 'Whether DMU stakeholders are aligned on adopting new diagnostics',
    roles: ['Country Head', 'Market Access'],
  },
  {
    id: 'competitive',
    name: 'Competitive Positioning',
    short: 'Competitive',
    description: 'Current competitive landscape and lock-in risk',
    roles: ['Sales Director', 'Country Head'],
  },
  {
    id: 'commercial',
    name: 'Commercial Team Readiness',
    short: 'Commercial',
    description: 'Whether the local team can execute and accelerate',
    roles: ['Sales Director', 'Regional Head'],
  },
  {
    id: 'evidence',
    name: 'Data & Evidence Gap',
    short: 'Evidence',
    description: 'What clinical or health-economic evidence is still missing',
    roles: ['Medical Affairs', 'Market Access'],
  },
]

// ── Score colour helper ─────────────────────────────────────────────────────

export function scoreColour(score: number): { bg: string; text: string; label: string } {
  if (score >= 3.0) return { bg: '#10B981', text: '#fff', label: 'Ready' }
  if (score >= 2.3) return { bg: '#F59E0B', text: '#fff', label: 'Developing' }
  if (score >= 1.5) return { bg: '#EF4444', text: '#fff', label: 'Early' }
  return { bg: '#991B1B', text: '#fff', label: 'Critical' }
}

export function overallScore(scores: DimScores): number {
  const vals = Object.values(scores)
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

// ── Questions (6 dimensions × 4 questions = 24) ────────────────────────────

export const QUESTIONS: Question[] = [
  // Clinical Adoption Maturity
  {
    id: 'cl1', dimensionId: 'clinical',
    text: 'What is the current level of awareness of liquid biopsy / NGS-based diagnostics among oncologists in this market?',
    lowAnchor: 'Very limited — most oncologists are unfamiliar with the technology',
    highAnchor: 'Widely adopted — routinely ordered as part of standard clinical workup',
  },
  {
    id: 'cl2', dimensionId: 'clinical',
    text: 'How integrated are advanced diagnostic tests in national clinical treatment guidelines?',
    lowAnchor: 'Not mentioned or referenced in national guidelines',
    highAnchor: 'Fully integrated — mandatory for specific cancer care pathways',
  },
  {
    id: 'cl3', dimensionId: 'clinical',
    text: 'What is the typical time from diagnosis to advanced diagnostic testing at key accounts?',
    lowAnchor: 'Testing rarely ordered; significant delays when it is',
    highAnchor: 'Fast, standardised testing protocols embedded in clinical workflow',
  },
  {
    id: 'cl4', dimensionId: 'clinical',
    text: 'How engaged are key oncology opinion leaders with your diagnostic technology?',
    lowAnchor: 'No meaningful engagement; no clinical champions identified',
    highAnchor: 'Strong KOL network publishing data and driving guideline adoption',
  },

  // Reimbursement & Access
  {
    id: 're1', dimensionId: 'reimbursement',
    text: 'How clear and accessible is the reimbursement pathway for companion diagnostics in this market?',
    lowAnchor: 'No clear pathway; reimbursement not available',
    highAnchor: 'Clear, fast process with predictable timelines and outcomes',
  },
  {
    id: 're2', dimensionId: 'reimbursement',
    text: 'What is the current reimbursement status for your primary diagnostic test?',
    lowAnchor: 'Not reimbursed; full out-of-pocket or ad hoc hospital budget',
    highAnchor: 'Full national reimbursement with broad indication coverage',
  },
  {
    id: 're3', dimensionId: 'reimbursement',
    text: 'How active is the payer environment in evaluating new oncology diagnostics?',
    lowAnchor: 'Payers are not engaging; no active HTA processes underway',
    highAnchor: 'Progressive payer environment proactively adopting new evidence',
  },
  {
    id: 're4', dimensionId: 'reimbursement',
    text: 'How well understood is the health-economic value proposition by local payers?',
    lowAnchor: 'No health-economic data presented or accepted',
    highAnchor: 'Strong local HE evidence base; payers citing it in decisions',
  },

  // Stakeholder Alignment
  {
    id: 'st1', dimensionId: 'stakeholder',
    text: 'How well aligned are oncology, pathology, and procurement stakeholders on adopting new diagnostics?',
    lowAnchor: 'Significant internal conflict; divergent priorities across functions',
    highAnchor: 'Strong multidisciplinary alignment with joint implementation plans',
  },
  {
    id: 'st2', dimensionId: 'stakeholder',
    text: 'What is the involvement of hospital procurement / finance in diagnostic purchasing decisions?',
    lowAnchor: 'Procurement drives decisions without clinical input',
    highAnchor: 'Clinically-led procurement with strong value-based purchasing',
  },
  {
    id: 'st3', dimensionId: 'stakeholder',
    text: 'How engaged is market access / medical affairs in shaping the decision-making environment?',
    lowAnchor: 'No market access or medical affairs resource deployed in this market',
    highAnchor: 'Comprehensive stakeholder engagement programme yielding tangible results',
  },
  {
    id: 'st4', dimensionId: 'stakeholder',
    text: 'How aligned is the internal commercial team (sales, medical, market access) on priorities for this market?',
    lowAnchor: 'Teams operate in silos with conflicting priorities',
    highAnchor: 'Fully integrated commercial model with shared objectives and metrics',
  },

  // Competitive Positioning
  {
    id: 'co1', dimensionId: 'competitive',
    text: 'What is the perception of switching costs among target laboratories and hospitals?',
    lowAnchor: 'High switching costs; strong lock-in to existing solutions',
    highAnchor: 'Active desire to switch or diversify diagnostic suppliers',
  },
  {
    id: 'co2', dimensionId: 'competitive',
    text: 'How differentiated is your technology versus incumbent solutions in this market?',
    lowAnchor: 'Perceived as equivalent; no clear differentiation established',
    highAnchor: 'Recognised as the leading technology; competitor benchmarked against you',
  },
  {
    id: 'co3', dimensionId: 'competitive',
    text: 'How active are competitors in this market currently?',
    lowAnchor: 'Dominant competitors with long-term contracts and deep account relationships',
    highAnchor: 'Weak or absent competition; clear market leadership opportunity',
  },
  {
    id: 'co4', dimensionId: 'competitive',
    text: 'What is the market\'s familiarity with your brand and company?',
    lowAnchor: 'Brand is unknown or rarely mentioned in the market',
    highAnchor: 'Market-leading brand recognition; trusted across all stakeholder types',
  },

  // Commercial Team Readiness
  {
    id: 'cm1', dimensionId: 'commercial',
    text: 'How would you rate the quality and depth of relationships with key accounts in this market?',
    lowAnchor: 'Few or no established relationships with key accounts',
    highAnchor: 'Deep, trusted relationships across the full decision-making unit',
  },
  {
    id: 'cm2', dimensionId: 'commercial',
    text: 'How capable and experienced is the local sales team in oncology diagnostics?',
    lowAnchor: 'Team lacks oncology/diagnostics experience; steep learning curve',
    highAnchor: 'High-performing team recognised by customers as category experts',
  },
  {
    id: 'cm3', dimensionId: 'commercial',
    text: 'How well equipped is the team with sales tools, value messaging, and market access support?',
    lowAnchor: 'Relying on generic global templates; no local adaptation',
    highAnchor: 'Comprehensive localised toolkit; value dossier and ROI tools in place',
  },
  {
    id: 'cm4', dimensionId: 'commercial',
    text: 'What is the current commercial team headcount versus market opportunity?',
    lowAnchor: 'Significantly understaffed relative to market size and complexity',
    highAnchor: 'Well-staffed for the opportunity with clear scaling plan',
  },

  // Data & Evidence Gap
  {
    id: 'ev1', dimensionId: 'evidence',
    text: 'How available is local health-economic evidence for payer discussions in this market?',
    lowAnchor: 'No local HE data; entirely reliant on unadapted global data',
    highAnchor: 'Strong local HE evidence base accepted by payers and guideline bodies',
  },
  {
    id: 'ev2', dimensionId: 'evidence',
    text: 'How strong is the clinical evidence base for your test in this market\'s patient population?',
    lowAnchor: 'No market-specific clinical data; global data not always relevant',
    highAnchor: 'Robust local clinical evidence published and cited by local KOLs',
  },
  {
    id: 'ev3', dimensionId: 'evidence',
    text: 'What is the status of real-world evidence generation in this market?',
    lowAnchor: 'No RWE programme in place',
    highAnchor: 'Mature RWE programme with published outcomes data',
  },
  {
    id: 'ev4', dimensionId: 'evidence',
    text: 'How well does available evidence address the specific objections of local payers and clinicians?',
    lowAnchor: 'Key objections are unaddressed by available evidence',
    highAnchor: 'Proactive evidence package that directly addresses all known local objections',
  },
]

// ── Dummy scores (per PRD §5.5 archetypes) ─────────────────────────────────

export const DUMMY_SCORES: Record<string, DimScores> = {
  de: { clinical: 3.2, reimbursement: 2.8, stakeholder: 2.6, competitive: 2.1, commercial: 3.0, evidence: 2.7 },
  fr: { clinical: 3.0, reimbursement: 1.8, stakeholder: 2.4, competitive: 2.5, commercial: 2.8, evidence: 2.2 },
  uk: { clinical: 3.5, reimbursement: 3.2, stakeholder: 3.3, competitive: 2.9, commercial: 3.4, evidence: 3.1 },
  nl: { clinical: 2.8, reimbursement: 2.6, stakeholder: 2.9, competitive: 2.7, commercial: 2.5, evidence: 2.4 },
  es: { clinical: 1.9, reimbursement: 2.8, stakeholder: 2.2, competitive: 2.6, commercial: 2.1, evidence: 1.7 },
  it: { clinical: 1.8, reimbursement: 1.9, stakeholder: 1.7, competitive: 2.2, commercial: 1.9, evidence: 1.6 },
  ch: { clinical: 3.0, reimbursement: 2.9, stakeholder: 2.8, competitive: 2.5, commercial: 3.1, evidence: 2.6 },
  be: { clinical: 2.4, reimbursement: 2.3, stakeholder: 2.1, competitive: 2.6, commercial: 1.7, evidence: 2.0 },
  at: { clinical: 2.6, reimbursement: 2.4, stakeholder: 2.5, competitive: 2.3, commercial: 2.4, evidence: 2.2 },
  no: { clinical: 2.9, reimbursement: 3.0, stakeholder: 2.8, competitive: 2.4, commercial: 2.6, evidence: 2.5 },
}

// ── Sales data (EUR thousands, Q1 2024 – Q4 2025) ─────────────────────────

export const QUARTERS = ['Q1 24', 'Q2 24', 'Q3 24', 'Q4 24', 'Q1 25', 'Q2 25', 'Q3 25', 'Q4 25'] as const
export const QUARTER_KEYS = ['q1_24', 'q2_24', 'q3_24', 'q4_24', 'q1_25', 'q2_25', 'q3_25', 'q4_25'] as const
export type QuarterKey = typeof QUARTER_KEYS[number]

export const SALES_DATA: Record<string, Record<QuarterKey, number>> = {
  de: { q1_24: 890, q2_24: 920, q3_24: 955, q4_24: 1010, q1_25: 1050, q2_25: 1095, q3_25: 1140, q4_25: 1200 },
  fr: { q1_24: 620, q2_24: 640, q3_24: 660, q4_24: 695,  q1_25: 720,  q2_25: 745,  q3_25: 775,  q4_25: 810  },
  uk: { q1_24: 1050,q2_24: 1100,q3_24: 1160,q4_24: 1230, q1_25: 1290, q2_25: 1360, q3_25: 1430, q4_25: 1520 },
  nl: { q1_24: 310, q2_24: 325, q3_24: 340, q4_24: 360,  q1_25: 375,  q2_25: 395,  q3_25: 415,  q4_25: 440  },
  es: { q1_24: 280, q2_24: 295, q3_24: 305, q4_24: 320,  q1_25: 335,  q2_25: 350,  q3_25: 370,  q4_25: 390  },
  it: { q1_24: 260, q2_24: 270, q3_24: 285, q4_24: 300,  q1_25: 315,  q2_25: 330,  q3_25: 345,  q4_25: 365  },
  ch: { q1_24: 480, q2_24: 500, q3_24: 520, q4_24: 545,  q1_25: 565,  q2_25: 590,  q3_25: 615,  q4_25: 645  },
  be: { q1_24: 175, q2_24: 182, q3_24: 190, q4_24: 200,  q1_25: 208,  q2_25: 218,  q3_25: 228,  q4_25: 240  },
  at: { q1_24: 195, q2_24: 205, q3_24: 215, q4_24: 225,  q1_25: 235,  q2_25: 248,  q3_25: 260,  q4_25: 275  },
  no: { q1_24: 380, q2_24: 405, q3_24: 430, q4_24: 460,  q1_25: 495,  q2_25: 530,  q3_25: 565,  q4_25: 605  },
}

// ── Forecast / prognosis data (annual plan, EUR thousands) ────────────────
// Some markets overperform (UK, Nordics), some underperform (Italy, Spain, France)
export const FORECAST_DATA: Record<string, Record<QuarterKey, number>> = {
  de: { q1_24: 870, q2_24: 900, q3_24: 935, q4_24: 985,  q1_25: 1030, q2_25: 1075, q3_25: 1115, q4_25: 1175 },
  fr: { q1_24: 640, q2_24: 660, q3_24: 685, q4_24: 720,  q1_25: 750,  q2_25: 775,  q3_25: 810,  q4_25: 850  },
  uk: { q1_24: 980, q2_24: 1020,q3_24: 1075,q4_24: 1140, q1_25: 1195, q2_25: 1260, q3_25: 1325, q4_25: 1405 },
  nl: { q1_24: 320, q2_24: 335, q3_24: 352, q4_24: 370,  q1_25: 385,  q2_25: 405,  q3_25: 425,  q4_25: 450  },
  es: { q1_24: 300, q2_24: 318, q3_24: 330, q4_24: 348,  q1_25: 365,  q2_25: 385,  q3_25: 410,  q4_25: 435  },
  it: { q1_24: 280, q2_24: 295, q3_24: 312, q4_24: 330,  q1_25: 348,  q2_25: 368,  q3_25: 390,  q4_25: 415  },
  ch: { q1_24: 470, q2_24: 490, q3_24: 512, q4_24: 538,  q1_25: 562,  q2_25: 588,  q3_25: 614,  q4_25: 643  },
  be: { q1_24: 180, q2_24: 188, q3_24: 196, q4_24: 206,  q1_25: 215,  q2_25: 225,  q3_25: 235,  q4_25: 247  },
  at: { q1_24: 200, q2_24: 210, q3_24: 220, q4_24: 232,  q1_25: 244,  q2_25: 256,  q3_25: 268,  q4_25: 282  },
  no: { q1_24: 355, q2_24: 378, q3_24: 402, q4_24: 428,  q1_25: 455,  q2_25: 485,  q3_25: 515,  q4_25: 548  },
}

export function totalVariancePct(marketId: string): number {
  const a = SALES_DATA[marketId]; const f = FORECAST_DATA[marketId]
  if (!a || !f) return 0
  const actTotal = Object.values(a).reduce((s, v) => s + v, 0)
  const fcTotal  = Object.values(f).reduce((s, v) => s + v, 0)
  return Math.round(((actTotal - fcTotal) / fcTotal) * 100)
}

export function qVariancePct(marketId: string, qk: QuarterKey): number {
  const act = SALES_DATA[marketId]?.[qk] ?? 0
  const fc  = FORECAST_DATA[marketId]?.[qk] ?? 0
  if (!fc) return 0
  return Math.round(((act - fc) / fc) * 100)
}

export function yoyGrowth(marketId: string): number {
  const d = SALES_DATA[marketId]
  if (!d) return 0
  const y24 = d.q1_24 + d.q2_24 + d.q3_24 + d.q4_24
  const y25 = d.q1_25 + d.q2_25 + d.q3_25 + d.q4_25
  return Math.round(((y25 - y24) / y24) * 100)
}

// ── GTM Options ─────────────────────────────────────────────────────────────

export const LAUNCH_PHASES = [
  { value: 'pre_launch',  label: 'Pre-launch' },
  { value: 'soft_launch', label: 'Soft launch' },
  { value: 'full_launch', label: 'Full launch' },
  { value: 'mature',      label: 'Mature' },
]

export const CHANNELS = [
  { value: 'direct',      label: 'Direct sales' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'hybrid',      label: 'Hybrid' },
  { value: 'digital',     label: 'Digital-led' },
]

export const SEGMENTS = [
  'Academic medical centres',
  'Community hospitals',
  'Private labs',
  'Reference labs',
]

export const STRATEGIC_PRIORITIES = [
  'Market education',
  'Reimbursement lobbying',
  'KOL development',
  'Competitive displacement',
  'Team building',
  'Evidence generation',
]

export const DEFAULT_GTM: GTMState = {
  launchPhase: '',
  segments: [],
  channel: '',
  budget: 0,
  keyAccounts: 0,
  priorities: [],
  timeline: '',
}

// ── GTM Validation Rules (PRD §5.3) ────────────────────────────────────────

export const GTM_RULES: GTMRule[] = [
  {
    id: 'r1',
    condition: (g, s) => g.launchPhase === 'full_launch' && (s.clinical ?? 5) < 2.0,
    severity: 'HIGH RISK',
    flag: 'Market not ready for full launch',
    action: 'Downgrade to soft launch — invest in clinical education and KOL engagement first.',
  },
  {
    id: 'r2',
    condition: (g, s) => g.budget > 500 && (s.reimbursement ?? 5) < 2.0,
    severity: 'MISALIGNED',
    flag: 'Heavy investment in an unreimbursed market',
    action: 'Redirect budget to health-economics evidence generation and payer engagement.',
  },
  {
    id: 'r3',
    condition: (g, s) => g.channel === 'direct' && (s.commercial ?? 5) < 2.0,
    severity: 'CAPABILITY GAP',
    flag: 'Team not ready for direct execution',
    action: 'Consider a distributor partnership or invest in team capability before scaling direct sales.',
  },
  {
    id: 'r4',
    condition: (g, s) => g.priorities.includes('Competitive displacement') && (s.competitive ?? 0) > 3.0,
    severity: 'LOW PRIORITY',
    flag: 'Competitive displacement focus in a manageable competitive environment',
    action: 'Reallocate focus to dimensions with lower scores — competition is not the bottleneck.',
  },
  {
    id: 'r5',
    condition: (g, s) => g.keyAccounts > 20 && (s.stakeholder ?? 5) < 2.0,
    severity: 'OVERREACH',
    flag: 'Targeting too many accounts with fragmented stakeholder alignment',
    action: 'Focus on 5–10 reference accounts with aligned stakeholders before broadening coverage.',
  },
  {
    id: 'r6',
    condition: (g, s) => (s.evidence ?? 5) < 2.0 && !g.priorities.includes('Evidence generation'),
    severity: 'BLIND SPOT',
    flag: 'Critical evidence gap not addressed in strategic priorities',
    action: 'Add evidence generation as a top strategic priority — payer engagement will stall without it.',
  },
]

// ── Playbook Archetypes (PRD §5.5) ─────────────────────────────────────────

export const PLAYBOOK_ARCHETYPES: PlaybookArchetype[] = [
  {
    profile: 'High Clinical + Low Reimbursement',
    headline: 'Health Economics First',
    focus: 'Payer engagement, local evidence generation, HTA submissions',
    topActions: [
      'Commission a local health-economic impact study',
      'Engage national HTA body with an evidence dossier',
      'Partner with 2–3 academic centres for real-world outcomes data',
    ],
    example: 'France',
  },
  {
    profile: 'Low Clinical + High Reimbursement',
    headline: 'KOL Activation',
    focus: 'Clinical education, reference centre development, congress presence',
    topActions: [
      'Identify and engage 3 clinical champions at major cancer centres',
      'Sponsor clinical education sessions at key congresses',
      'Develop a tumour board presentation toolkit for local teams',
    ],
    example: 'Spain',
  },
  {
    profile: 'Low Commercial Readiness',
    headline: 'Team Investment',
    focus: 'Training, sales enablement, local market intelligence',
    topActions: [
      'Deliver intensive oncology diagnostics training programme',
      'Create localised value messaging and ROI tools',
      'Hire a medical science liaison with local oncology networks',
    ],
    example: 'Belgium',
  },
  {
    profile: 'High Competitive Lock-in',
    headline: 'Differentiation Play',
    focus: 'Switching cost reduction, clinical superiority data, installed base conversion',
    topActions: [
      'Develop a head-to-head clinical comparison data package',
      'Offer risk-free evaluation programme at 5 target accounts',
      'Map installed base vulnerability at key competitive accounts',
    ],
    example: 'Germany',
  },
  {
    profile: 'Foundation Building',
    headline: 'Build the Groundwork',
    focus: 'This market needs foundational work across all dimensions before acceleration',
    topActions: [
      'Establish a market presence through a single reference hospital',
      'Submit for national reimbursement — start the pathway process',
      'Hire a local country manager with existing market relationships',
    ],
    example: 'Italy',
  },
  {
    profile: 'Acceleration Mode',
    headline: 'Scale and Defend',
    focus: 'Invest in scaling commercial execution and competitive defence',
    topActions: [
      'Expand key account coverage — add 10 new strategic accounts',
      'Strengthen competitive moats through long-term contracts and service expansion',
      'Launch a patient advocacy and awareness programme',
    ],
    example: 'United Kingdom',
  },
]

export function getPlaybook(scores: DimScores): PlaybookArchetype {
  const avg = overallScore(scores)
  const cl = scores.clinical ?? 0
  const re = scores.reimbursement ?? 0
  const co = scores.competitive ?? 0
  const cm = scores.commercial ?? 0

  if (avg >= 3.0) return PLAYBOOK_ARCHETYPES[5] // Acceleration
  if (cl >= 2.5 && re < 2.0) return PLAYBOOK_ARCHETYPES[0] // HE First
  if (cl < 2.0 && re >= 2.5) return PLAYBOOK_ARCHETYPES[1] // KOL Activation
  if (cm < 2.0) return PLAYBOOK_ARCHETYPES[2] // Team Investment
  if (co < 2.0) return PLAYBOOK_ARCHETYPES[3] // Differentiation
  if (avg < 2.0) return PLAYBOOK_ARCHETYPES[4] // Foundation
  return PLAYBOOK_ARCHETYPES[2] // Default: Team Investment
}

// ── Roles ───────────────────────────────────────────────────────────────────

export const ROLES = [
  { id: 'regional_head',       label: 'Regional Head',         description: 'Strategic overview across all markets, resource allocation' },
  { id: 'country_head',        label: 'Country Head',          description: 'Market-specific assessment and local relationship nuance' },
  { id: 'medical_affairs',     label: 'Medical Affairs',       description: 'Clinical adoption and evidence gap perspective' },
  { id: 'market_access',       label: 'Market Access',         description: 'Reimbursement landscape and payer engagement' },
  { id: 'sales_director',      label: 'Sales Director',        description: 'Commercial team capability and competitive dynamics' },
  { id: 'commercial_strategy', label: 'Commercial Strategy',   description: 'GTM alignment, budget allocation, strategic priorities' },
]
