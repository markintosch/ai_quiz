// ── Growth Flywheel Scan — by Wouter Blok ────────────────────────────────────
// 8 Performance Pillars × 2 diagnostic statements = 16 scored statements.
// Plus 2 profiling questions (role, stage) that drive seniority and routing.
// Agree/disagree scale 0–3. Deterministic tier + service routing (PRD v2).
//
// This product is self-contained, like /marketing_scan. It is intentionally a
// SEPARATE build from marketing_scan so the two designs can be compared.

export type Locale = 'en' | 'nl' | 'de'

export type PillarId =
  | 'business_targets'
  | 'audiences'
  | 'investment'
  | 'creative'
  | 'customer_experience'
  | 'data'
  | 'experimentation'
  | 'automation'

export type TierKey    = 'stalled' | 'turning' | 'spinning' | 'velocity'
export type ServiceKey = 'growth_audit' | 'fractional_cmo' | 'advisory' | 'workshop'
export type RoleId     = 'founder' | 'exec' | 'manager' | 'specialist'
export type StageId    = 'early' | 'scaling' | 'established' | 'transition'

export interface Pillar      { id: PillarId; name: string; blurb: string; icon: string }
export interface Statement   { id: string; pillarId: PillarId; text: string }
export interface Option      { id: string; label: string }
export interface TierDef     { key: TierKey; label: string; read: string }
export interface ServiceDef  { key: ServiceKey; name: string; cta: string }

// ── Static structure (locale-independent) ───────────────────────────────────
// Pillar order is the display order. Tie-break order for "weakest pillar" is
// defined separately below (most actionable entry point for Wouter first).

export const PILLAR_ORDER: PillarId[] = [
  'business_targets', 'audiences', 'investment', 'creative',
  'customer_experience', 'data', 'experimentation', 'automation',
]

export const WEAKEST_TIEBREAK: PillarId[] = [
  'automation', 'data', 'experimentation', 'investment',
  'audiences', 'creative', 'business_targets', 'customer_experience',
]

// Statement ids map 2 per pillar. Order within a pillar is display order.
const STATEMENT_PILLARS: Record<string, PillarId> = {
  BT1: 'business_targets', BT2: 'business_targets',
  AU1: 'audiences',        AU2: 'audiences',
  IN1: 'investment',       IN2: 'investment',
  CR1: 'creative',         CR2: 'creative',
  CX1: 'customer_experience', CX2: 'customer_experience',
  DA1: 'data',             DA2: 'data',
  EX1: 'experimentation',  EX2: 'experimentation',
  AT1: 'automation',       AT2: 'automation',
}

const ICONS: Record<PillarId, string> = {
  business_targets: '🎯', audiences: '👥', investment: '💰', creative: '🎨',
  customer_experience: '⭐', data: '📊', experimentation: '🧪', automation: '⚡',
}

export const TIER_BANDS: { key: TierKey; min: number; max: number }[] = [
  { key: 'stalled',  min: 0,  max: 39  },
  { key: 'turning',  min: 40, max: 59  },
  { key: 'spinning', min: 60, max: 79  },
  { key: 'velocity', min: 80, max: 100 },
]

const SENIOR_ROLES: RoleId[] = ['founder', 'exec']

// ── Localised content ───────────────────────────────────────────────────────

interface LocaleContent {
  pillars:    Record<PillarId, { name: string; blurb: string }>
  statements: Record<string, string>
  roles:      Record<RoleId, string>
  stages:     Record<StageId, string>
  roleQuestion:  string
  stageQuestion: string
  scale:      [string, string, string, string]   // value 0..3
  tiers:      Record<TierKey, { label: string; read: string }>
  services:   Record<ServiceKey, { name: string; cta: string }>
  reasoning: {
    fractional_cmo_transition: string
    growth_audit_low:   string
    advisory_high:      string
    workshop_practitioner: string
    growth_audit_fallback: string
  }
}

const EN: LocaleContent = {
  pillars: {
    business_targets:    { name: 'Business Targets',     blurb: 'One clear growth target the whole organisation is accountable to.' },
    audiences:           { name: 'Audiences',            blurb: 'Knowing who your high-value customers are, and reaching them on purpose.' },
    investment:          { name: 'Investment',           blurb: 'Budget that follows a growth model, defended by incremental return.' },
    creative:            { name: 'Creative',             blurb: 'Work that does a job in the funnel and balances brand with performance.' },
    customer_experience: { name: 'Customer Experience',  blurb: 'The journey after the click, treated as part of growth.' },
    data:                { name: 'Data',                 blurb: 'Numbers you trust, measured for incrementality, not last click.' },
    experimentation:     { name: 'Experimentation',      blurb: 'A consistent test cadence with learnings that compound.' },
    automation:          { name: 'Automation',           blurb: 'You set the boundaries; the platforms do not spend on their own goals.' },
  },
  statements: {
    BT1: 'We have one clear growth target that every channel and team is accountable to, not a pile of disconnected KPIs.',
    BT2: 'Our targets are tied to incremental business growth, not vanity metrics or platform-reported numbers.',
    AU1: 'We know exactly who our high-value customers are and can reach them, instead of letting the platforms decide who to target.',
    AU2: 'We can tell the difference between audiences who would convert anyway and audiences we genuinely need to win.',
    IN1: 'Budget decisions follow a clear growth model, not gut feel or last year plus ten percent.',
    IN2: 'We can defend every euro of spend by its incremental return, not its last-click ROAS.',
    CR1: 'Our creative is built to do a job in the funnel, not just to look good or win awards.',
    CR2: 'We balance brand building and performance instead of trading one off against the other.',
    CX1: 'The experience after the click (landing, onboarding, retention) is treated as part of growth, not someone else’s problem.',
    CX2: 'We act on the full customer journey, not just the first conversion.',
    DA1: 'Our data is clean enough that we trust the numbers in our dashboards.',
    DA2: 'We measure incrementality (holdouts, MMM, geo-tests), not just last-click or platform-reported conversions.',
    EX1: 'We run a consistent experimentation cadence with documented learnings.',
    EX2: 'Big budget and strategy decisions are validated by a test before we scale them.',
    AT1: 'We control our automation (bidding, audiences); the platforms do not optimise for their own goals on our budget.',
    AT2: 'We set the boundaries for tools like Performance Max (exclusions, incrementality thresholds) instead of trusting their aggregated targets.',
  },
  roles: {
    founder:    'Founder / CEO / owner',
    exec:       'C-level or VP (CMO, CRO, VP Growth)',
    manager:    'Marketing manager / team lead',
    specialist: 'Specialist / individual contributor',
  },
  stages: {
    early:       'Early stage / startup, still finding fit',
    scaling:     'Scaling fast, processes straining',
    established: 'Established, optimising a mature engine',
    transition:  'In transition (merger, pivot, new leadership)',
  },
  roleQuestion:  'What best describes your role?',
  stageQuestion: 'Where is your company right now?',
  scale: ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'],
  tiers: {
    stalled:  { label: 'a stalled flywheel',     read: 'The engine is not turning. Effort goes in, little compounds out.' },
    turning:  { label: 'turning',                read: 'It moves when you push, but it does not yet hold momentum.' },
    spinning: { label: 'spinning',               read: 'Real momentum. The gaps are now specific, not structural.' },
    velocity: { label: 'at flywheel velocity',   read: 'The system compounds. The job is to protect and sharpen it.' },
  },
  services: {
    growth_audit:   { name: 'Growth Flywheel Audit', cta: 'Book a growth audit' },
    fractional_cmo: { name: 'Fractional CMO',        cta: 'Talk about fractional leadership' },
    advisory:       { name: 'Advisory seat',         cta: 'Book an advisory call' },
    workshop:       { name: 'Brandformance Workshop', cta: 'Plan a team workshop' },
  },
  reasoning: {
    fractional_cmo_transition: 'You are steering through a transition. The flywheel does not need a report, it needs hands on the wheel.',
    growth_audit_low:      'Your flywheel is {tierLabel}. Before adding more spend or people, get a clear diagnosis of where it stalls, starting with {weakestPillar}.',
    advisory_high:         'You are {tierLabel}. You do not need rebuilding, you need a sharp outside sparring partner on {weakestPillar}.',
    workshop_practitioner: 'Your strongest lever is your team’s capability on {weakestPillar}. A focused Brandformance workshop moves the whole flywheel.',
    growth_audit_fallback: 'Start with a diagnosis of where your flywheel stalls, beginning with {weakestPillar}.',
  },
}

const NL: LocaleContent = {
  pillars: {
    business_targets:    { name: 'Business Targets',    blurb: 'Eén helder groeidoel waar de hele organisatie op afgerekend wordt.' },
    audiences:           { name: 'Doelgroepen',         blurb: 'Weten wie je waardevolle klanten zijn en ze bewust bereiken.' },
    investment:          { name: 'Investering',         blurb: 'Budget dat een groeimodel volgt en verdedigd wordt met incrementeel rendement.' },
    creative:            { name: 'Creatie',             blurb: 'Werk dat een rol speelt in de funnel en merk met performance verbindt.' },
    customer_experience: { name: 'Klantbeleving',       blurb: 'De reis na de klik, behandeld als onderdeel van groei.' },
    data:                { name: 'Data',                blurb: 'Cijfers die je vertrouwt, gemeten op incrementaliteit, niet op last click.' },
    experimentation:     { name: 'Experimenteren',      blurb: 'Een vast testritme met learnings die zich opstapelen.' },
    automation:          { name: 'Automatisering',      blurb: 'Jij stelt de grenzen; de platforms besteden niet aan hun eigen doelen.' },
  },
  statements: {
    BT1: 'We hebben één helder groeidoel waar elk kanaal en team op afgerekend wordt, geen stapel losse KPI’s.',
    BT2: 'Onze doelen zijn gekoppeld aan incrementele bedrijfsgroei, niet aan ijdelheidscijfers of platform-cijfers.',
    AU1: 'We weten precies wie onze waardevolle klanten zijn en kunnen ze bereiken, in plaats van de platforms te laten bepalen wie we targeten.',
    AU2: 'We zien het verschil tussen doelgroepen die toch wel converteren en doelgroepen die we echt moeten winnen.',
    IN1: 'Budgetbeslissingen volgen een helder groeimodel, niet onderbuikgevoel of vorig jaar plus tien procent.',
    IN2: 'We kunnen elke euro verdedigen op basis van incrementeel rendement, niet op last-click ROAS.',
    CR1: 'Onze creatie is gemaakt om een rol te spelen in de funnel, niet alleen om mooi te zijn of prijzen te winnen.',
    CR2: 'We balanceren merkbouw en performance in plaats van het een tegen het ander uit te ruilen.',
    CX1: 'De ervaring na de klik (landing, onboarding, retentie) is onderdeel van groei, niet andermans probleem.',
    CX2: 'We sturen op de volledige klantreis, niet alleen op de eerste conversie.',
    DA1: 'Onze data is schoon genoeg dat we de cijfers in onze dashboards vertrouwen.',
    DA2: 'We meten incrementaliteit (holdouts, MMM, geo-tests), niet alleen last-click of platform-cijfers.',
    EX1: 'We draaien een vast experimenteerritme met gedocumenteerde learnings.',
    EX2: 'Grote budget- en strategiebeslissingen worden eerst met een test gevalideerd voordat we opschalen.',
    AT1: 'We houden onze automatisering in de hand (bidding, audiences); de platforms optimaliseren niet voor hun eigen doelen met ons budget.',
    AT2: 'We stellen de grenzen voor tools als Performance Max (exclusions, incrementaliteitsdrempels) in plaats van te vertrouwen op hun geaggregeerde targets.',
  },
  roles: {
    founder:    'Oprichter / CEO / eigenaar',
    exec:       'C-level of VP (CMO, CRO, VP Growth)',
    manager:    'Marketingmanager / teamlead',
    specialist: 'Specialist / individuele bijdrager',
  },
  stages: {
    early:       'Vroege fase / startup, nog op zoek naar fit',
    scaling:     'Snel aan het opschalen, processen onder druk',
    established: 'Gevestigd, een volwassen motor aan het optimaliseren',
    transition:  'In transitie (fusie, pivot, nieuw leiderschap)',
  },
  roleQuestion:  'Wat omschrijft jouw rol het best?',
  stageQuestion: 'Waar staat je bedrijf nu?',
  scale: ['Helemaal oneens', 'Oneens', 'Eens', 'Helemaal eens'],
  tiers: {
    stalled:  { label: 'een stilstaande flywheel',  read: 'De motor draait niet. Er gaat moeite in, er komt weinig blijvends uit.' },
    turning:  { label: 'in beweging',               read: 'Hij beweegt als je duwt, maar houdt nog geen momentum vast.' },
    spinning: { label: 'op snelheid',               read: 'Echt momentum. De gaten zijn nu specifiek, niet structureel.' },
    velocity: { label: 'op vliegwielsnelheid',      read: 'Het systeem stapelt op. De taak is het te beschermen en te verscherpen.' },
  },
  services: {
    growth_audit:   { name: 'Growth Flywheel Audit', cta: 'Boek een growth audit' },
    fractional_cmo: { name: 'Fractional CMO',        cta: 'Praat over fractional leiderschap' },
    advisory:       { name: 'Advisory seat',         cta: 'Boek een advisory call' },
    workshop:       { name: 'Brandformance Workshop', cta: 'Plan een teamworkshop' },
  },
  reasoning: {
    fractional_cmo_transition: 'Je stuurt door een transitie. De flywheel heeft geen rapport nodig, maar handen aan het stuur.',
    growth_audit_low:      'Jouw flywheel is {tierLabel}. Voordat je meer budget of mensen toevoegt: krijg een heldere diagnose van waar hij hapert, te beginnen bij {weakestPillar}.',
    advisory_high:         'Je bent {tierLabel}. Je hoeft niets te herbouwen, je hebt een scherpe sparringpartner van buiten nodig op {weakestPillar}.',
    workshop_practitioner: 'Je sterkste hefboom is de capaciteit van je team op {weakestPillar}. Een gerichte Brandformance workshop zet de hele flywheel in beweging.',
    growth_audit_fallback: 'Begin met een diagnose van waar je flywheel hapert, te beginnen bij {weakestPillar}.',
  },
}

const DE: LocaleContent = {
  pillars: {
    business_targets:    { name: 'Business Targets',     blurb: 'Ein klares Wachstumsziel, an dem sich die ganze Organisation messen lässt.' },
    audiences:           { name: 'Zielgruppen',          blurb: 'Wissen, wer deine wertvollen Kunden sind, und sie gezielt erreichen.' },
    investment:          { name: 'Investment',           blurb: 'Budget, das einem Wachstumsmodell folgt und durch inkrementellen Ertrag belegt ist.' },
    creative:            { name: 'Kreation',             blurb: 'Arbeit, die im Funnel eine Aufgabe erfüllt und Marke mit Performance verbindet.' },
    customer_experience: { name: 'Customer Experience',  blurb: 'Die Reise nach dem Klick, als Teil von Wachstum behandelt.' },
    data:                { name: 'Daten',                blurb: 'Zahlen, denen du vertraust, gemessen auf Inkrementalität statt Last Click.' },
    experimentation:     { name: 'Experimente',          blurb: 'Ein fester Testrhythmus mit Erkenntnissen, die sich aufsummieren.' },
    automation:          { name: 'Automatisierung',      blurb: 'Du setzt die Grenzen; die Plattformen geben nicht für ihre eigenen Ziele aus.' },
  },
  statements: {
    BT1: 'Wir haben ein klares Wachstumsziel, an dem jeder Kanal und jedes Team gemessen wird, statt eines Haufens unverbundener KPIs.',
    BT2: 'Unsere Ziele sind an inkrementelles Geschäftswachstum gekoppelt, nicht an Vanity-Kennzahlen oder plattformeigene Zahlen.',
    AU1: 'Wir wissen genau, wer unsere wertvollen Kunden sind, und können sie erreichen, statt die Plattformen entscheiden zu lassen, wen wir targeten.',
    AU2: 'Wir erkennen den Unterschied zwischen Zielgruppen, die ohnehin konvertieren, und Zielgruppen, die wir wirklich gewinnen müssen.',
    IN1: 'Budgetentscheidungen folgen einem klaren Wachstumsmodell, nicht dem Bauchgefühl oder letztes Jahr plus zehn Prozent.',
    IN2: 'Wir können jeden Euro über seinen inkrementellen Ertrag verteidigen, nicht über den Last-Click-ROAS.',
    CR1: 'Unsere Kreation ist gebaut, um im Funnel eine Aufgabe zu erfüllen, nicht nur um gut auszusehen oder Preise zu gewinnen.',
    CR2: 'Wir bringen Markenaufbau und Performance in Balance, statt das eine gegen das andere einzutauschen.',
    CX1: 'Das Erlebnis nach dem Klick (Landing, Onboarding, Retention) gilt als Teil von Wachstum, nicht als Problem anderer.',
    CX2: 'Wir steuern die gesamte Customer Journey, nicht nur die erste Conversion.',
    DA1: 'Unsere Daten sind sauber genug, dass wir den Zahlen in unseren Dashboards vertrauen.',
    DA2: 'Wir messen Inkrementalität (Holdouts, MMM, Geo-Tests), nicht nur Last-Click oder plattformeigene Conversions.',
    EX1: 'Wir fahren einen festen Experimentier-Rhythmus mit dokumentierten Erkenntnissen.',
    EX2: 'Große Budget- und Strategieentscheidungen werden erst durch einen Test validiert, bevor wir skalieren.',
    AT1: 'Wir haben unsere Automatisierung im Griff (Bidding, Audiences); die Plattformen optimieren mit unserem Budget nicht für ihre eigenen Ziele.',
    AT2: 'Wir setzen die Grenzen für Tools wie Performance Max (Exclusions, Inkrementalitäts-Schwellen), statt ihren aggregierten Zielen zu vertrauen.',
  },
  roles: {
    founder:    'Gründer / CEO / Inhaber',
    exec:       'C-Level oder VP (CMO, CRO, VP Growth)',
    manager:    'Marketing-Manager / Teamlead',
    specialist: 'Spezialist / einzelner Mitarbeiter',
  },
  stages: {
    early:       'Frühe Phase / Startup, noch auf der Suche nach Fit',
    scaling:     'Schnelles Skalieren, Prozesse unter Druck',
    established: 'Etabliert, eine reife Maschine am Optimieren',
    transition:  'Im Umbruch (Fusion, Pivot, neue Führung)',
  },
  roleQuestion:  'Was beschreibt deine Rolle am besten?',
  stageQuestion: 'Wo steht dein Unternehmen gerade?',
  scale: ['Stimme gar nicht zu', 'Stimme nicht zu', 'Stimme zu', 'Stimme voll zu'],
  tiers: {
    stalled:  { label: 'ein stehendes Flywheel',          read: 'Die Maschine dreht sich nicht. Aufwand geht rein, wenig Bleibendes kommt raus.' },
    turning:  { label: 'in Bewegung',                     read: 'Es bewegt sich, wenn du schiebst, hält aber noch kein Momentum.' },
    spinning: { label: 'auf Touren',                      read: 'Echtes Momentum. Die Lücken sind jetzt spezifisch, nicht strukturell.' },
    velocity: { label: 'auf Flywheel-Geschwindigkeit',    read: 'Das System summiert sich auf. Die Aufgabe ist, es zu schützen und zu schärfen.' },
  },
  services: {
    growth_audit:   { name: 'Growth Flywheel Audit', cta: 'Growth-Audit buchen' },
    fractional_cmo: { name: 'Fractional CMO',        cta: 'Über Fractional-Leadership sprechen' },
    advisory:       { name: 'Advisory Seat',         cta: 'Advisory-Call buchen' },
    workshop:       { name: 'Brandformance Workshop', cta: 'Team-Workshop planen' },
  },
  reasoning: {
    fractional_cmo_transition: 'Du steuerst durch einen Umbruch. Das Flywheel braucht keinen Report, es braucht Hände am Steuer.',
    growth_audit_low:      'Dein Flywheel ist {tierLabel}. Bevor du mehr Budget oder Leute hinzufügst: hol dir eine klare Diagnose, wo es stockt, angefangen bei {weakestPillar}.',
    advisory_high:         'Du bist {tierLabel}. Du musst nichts neu bauen, du brauchst einen scharfen Sparringspartner von außen für {weakestPillar}.',
    workshop_practitioner: 'Dein stärkster Hebel ist die Fähigkeit deines Teams bei {weakestPillar}. Ein fokussierter Brandformance-Workshop bringt das ganze Flywheel in Bewegung.',
    growth_audit_fallback: 'Beginne mit einer Diagnose, wo dein Flywheel stockt, angefangen bei {weakestPillar}.',
  },
}

const CONTENT: Record<Locale, LocaleContent> = { en: EN, nl: NL, de: DE }

export function normaliseLocale(raw: string | null | undefined): Locale {
  return raw === 'nl' || raw === 'de' ? raw : 'en'
}

// ── Locale accessor: returns assembled, typed content for the UI ─────────────
export function getContent(rawLocale: string) {
  const locale = normaliseLocale(rawLocale)
  const c = CONTENT[locale]

  const pillars: Pillar[] = PILLAR_ORDER.map(id => ({
    id, icon: ICONS[id], name: c.pillars[id].name, blurb: c.pillars[id].blurb,
  }))

  const statements: Statement[] = Object.keys(STATEMENT_PILLARS).map(id => ({
    id, pillarId: STATEMENT_PILLARS[id], text: c.statements[id],
  }))

  const roles:  Option[] = (Object.keys(c.roles)  as RoleId[]).map(id => ({ id, label: c.roles[id] }))
  const stages: Option[] = (Object.keys(c.stages) as StageId[]).map(id => ({ id, label: c.stages[id] }))

  const tiers = TIER_BANDS.map<TierDef>(b => ({ key: b.key, label: c.tiers[b.key].label, read: c.tiers[b.key].read }))
  const services = (Object.keys(c.services) as ServiceKey[]).map<ServiceDef>(k => ({ key: k, name: c.services[k].name, cta: c.services[k].cta }))

  return { locale, pillars, statements, roles, stages, tiers, services, scale: c.scale, labels: c }
}

// ── Pure scoring + routing (PRD v2, section 7) ───────────────────────────────

export interface ScanResult {
  pillarScores: Record<PillarId, number>   // 0–6 each
  pillarPct:    Record<PillarId, number>   // 0–100 each
  total:        number                     // 0–48
  pct:          number                     // 0–100
  tier:         TierKey
  weakestPillar: PillarId
  service:      ServiceKey
}

export function pillarScore(answers: Record<string, number>, pillarId: PillarId): number {
  const ids = Object.keys(STATEMENT_PILLARS).filter(id => STATEMENT_PILLARS[id] === pillarId)
  return ids.reduce((sum, id) => sum + (answers[id] ?? 0), 0)   // 2 statements × 0–3 = 0–6
}

export function tierForPct(pct: number): TierKey {
  return (TIER_BANDS.find(b => pct >= b.min && pct <= b.max)?.key) ?? 'stalled'
}

export function weakestPillarOf(pillarPct: Record<PillarId, number>): PillarId {
  const min = Math.min(...PILLAR_ORDER.map(p => pillarPct[p]))
  // Tie-break: first pillar in WEAKEST_TIEBREAK that sits at the minimum.
  return WEAKEST_TIEBREAK.find(p => pillarPct[p] === min) ?? WEAKEST_TIEBREAK[0]
}

export function routeService(role: RoleId, stage: StageId, tier: TierKey): ServiceKey {
  const senior = SENIOR_ROLES.includes(role)
  if (stage === 'transition' && senior)                          return 'fractional_cmo'
  if ((tier === 'stalled' || tier === 'turning') && senior)      return 'growth_audit'
  if ((tier === 'spinning' || tier === 'velocity') && senior)    return 'advisory'
  if (!senior)                                                   return 'workshop'
  return 'growth_audit'
}

export function computeResult(
  answers: Record<string, number>,
  role: RoleId,
  stage: StageId,
): ScanResult {
  const pillarScores = {} as Record<PillarId, number>
  const pillarPct    = {} as Record<PillarId, number>
  PILLAR_ORDER.forEach(p => {
    const s = pillarScore(answers, p)
    pillarScores[p] = s
    pillarPct[p]    = Math.round((s / 6) * 100)
  })
  const total = PILLAR_ORDER.reduce((sum, p) => sum + pillarScores[p], 0)
  const pct   = Math.round((total / 48) * 100)
  const tier  = tierForPct(pct)
  const weakestPillar = weakestPillarOf(pillarPct)
  const service = routeService(role, stage, tier)
  return { pillarScores, pillarPct, total, pct, tier, weakestPillar, service }
}

// Render a reasoning template with the localised tier label + pillar name.
export function reasoningFor(
  rawLocale: string,
  result: ScanResult,
  role: RoleId,
  stage: StageId,
): string {
  const locale = normaliseLocale(rawLocale)
  const c = CONTENT[locale]
  const tierLabel     = c.tiers[result.tier].label
  const weakestPillar = c.pillars[result.weakestPillar].name
  const senior = SENIOR_ROLES.includes(role)

  let tpl: string
  if (stage === 'transition' && senior)                          tpl = c.reasoning.fractional_cmo_transition
  else if ((result.tier === 'stalled' || result.tier === 'turning') && senior) tpl = c.reasoning.growth_audit_low
  else if ((result.tier === 'spinning' || result.tier === 'velocity') && senior) tpl = c.reasoning.advisory_high
  else if (!senior)                                             tpl = c.reasoning.workshop_practitioner
  else                                                          tpl = c.reasoning.growth_audit_fallback

  return tpl.replace('{tierLabel}', tierLabel).replace('{weakestPillar}', weakestPillar)
}

// Booking deep-link. Replace BOOKING_URL with Wouter's real appointment link.
// PRD: append recommended service as a query param so context is pre-set.
export const BOOKING_URL = 'https://www.linkedin.com/in/wouterblok/' // TODO: real booking link
export function bookingHref(service: ServiceKey, locale: Locale): string {
  const sep = BOOKING_URL.includes('?') ? '&' : '?'
  return `${BOOKING_URL}${sep}service=${service}&lang=${locale}`
}
