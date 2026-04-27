// AI-benchmark for marketing & sales — research instrument
// Languages: NL primary. EN/FR/DE currently fall back to NL — translation pass next round.

export type Lang = 'nl' | 'en' | 'fr' | 'de'
export const LANGS: Lang[] = ['nl', 'en', 'fr', 'de']

export type Dimension = {
  id: 'adoption' | 'workflow' | 'outcome' | 'data' | 'skill' | 'governance'
  icon: string
  name: string
  description: string
}

export type Archetype = {
  id: 'pragmatist' | 'power_user' | 'curious_skeptic' | 'strategist' | 'lagging_builder' | 'shadow_operator'
  emoji: string
  name: string
  identity: string
}

export type LangContent = {
  // nav
  navName:     string
  navTagline:  string
  navCta:      string

  // hero
  heroBadge:   string
  heroH1a:     string
  heroH1b:     string
  heroIntro:   string  // longer framing paragraph
  heroSub:     string  // promise / what you get
  heroCta1:    string
  heroCta2:    string
  trustLine:   string

  // proof / community
  proofN:        string  // template, {n} replaced at render
  proofSubtitle: string

  // section labels
  dimensionsLabel: string
  dimensionsTitle: string
  archetypesLabel: string
  archetypesTitle: string
  shareLabel:      string
  shareTitle:      string
  shareBody:       string

  // taxonomies
  DIMENSIONS: Dimension[]
  ARCHETYPES: Archetype[]

  // footer
  footerLine:  string
  reportLine:  string
}

// ── NL (primary) ─────────────────────────────────────────────────────────────
const NL: LangContent = {
  navName:    'AI-benchmark',
  navTagline: 'voor marketing & sales',
  navCta:     'Start de benchmark →',

  heroBadge:  'Onafhankelijk onderzoek · door Mark de Kock',
  heroH1a:    'Hoe gebruik jij AI in',
  heroH1b:    'marketing & sales — écht?',
  heroIntro:  'We gebruiken steeds vaker AI-tools. Van eenvoudige chat op een instapaccount tot dure videobewerking of sales-funnel tools. En elke dag lijkt er een nieuwe tool bij te komen. Waar steek je nou je tijd in om het gebruik te leren? Wat nou als je vakgenoten je de weg wijzen in wat wél werkt?',
  heroSub:    'Vergelijk je werkwijze, je tools en je impact met die van vele andere marketeers en sales-professionals. Deel jouw inzichten en krijg een beeld van de markt in een overzichtelijk dashboard.',
  heroCta1:   'Start de benchmark →',
  heroCta2:   'Hoe het werkt',
  trustLine:  '18 vragen · ~6 minuten · Gratis · Persoonlijk dashboard direct na invullen',

  proofN:        '{n} marketeers en sellers hebben al meegedaan',
  proofSubtitle: 'Jouw antwoorden bouwen mee aan het grootste onafhankelijke beeld van AI-gebruik in BeNeLux.',

  dimensionsLabel: '6 Dimensies',
  dimensionsTitle: 'Waarop we je benchmarken',
  archetypesLabel: '6 Archetypes',
  archetypesTitle: 'Welk type AI-gebruiker ben jij?',
  shareLabel:      'De reden om mee te doen',
  shareTitle:      'Je krijgt geen score. Je krijgt context.',
  shareBody:       'Een score van 73 is een nummer. "Maar 19% van sellers in jouw segment gebruikt Clay — jij wel" is een identiteit. Het persoonlijke dashboard laat per vraag zien hoe je je verhoudt tot je peers, met een filter waarmee je wisselt tussen "iedereen", "alleen sales", "mijn industrie", "mijn bedrijfsgrootte".',

  DIMENSIONS: [
    { id: 'adoption',   icon: '🧭', name: 'Adoptie',                description: 'Welke tools je gebruikt en hoe vaak.' },
    { id: 'workflow',   icon: '⚙️', name: 'Workflow-integratie',     description: 'Losse tabs of ingebed in je stack.' },
    { id: 'outcome',    icon: '📈', name: 'Outcome & ROI',           description: 'Tijdwinst, kwaliteit, conversie.' },
    { id: 'data',       icon: '📚', name: 'Data-readiness',          description: 'CRM-hygiëne, ICP, content library.' },
    { id: 'skill',      icon: '🎓', name: 'Skill & vertrouwen',      description: 'Vaardigheid van jou en je team.' },
    { id: 'governance', icon: '🛡️', name: 'Governance & beleid',     description: 'Richtlijnen, kwaliteitscontrole, brand voice.' },
  ],

  ARCHETYPES: [
    { id: 'pragmatist',      emoji: '🎯', name: 'Pragmatist',      identity: 'Gebruikt AI waar het concreet helpt — geen theater.' },
    { id: 'power_user',      emoji: '⚡', name: 'Power User',       identity: 'Bouwt eigen workflows, haalt 5× tijdwinst uit z\'n stack.' },
    { id: 'curious_skeptic', emoji: '🤔', name: 'Curious Skeptic',  identity: 'Probeert alles, vertrouwt nog niets blind. Gezond.' },
    { id: 'strategist',      emoji: '🧠', name: 'Strategist',       identity: 'Stuurt op governance, ROI en team-adoptie. Lange lijn.' },
    { id: 'lagging_builder', emoji: '🛠️', name: 'Lagging Builder',  identity: 'Achterstand, maar bouwt nu actief op. Inhaalslag bezig.' },
    { id: 'shadow_operator', emoji: '🥷', name: 'Shadow Operator',  identity: 'Gebruikt AI dagelijks, organisatie weet van niks.' },
  ],

  footerLine: 'Gehost door Mark de Kock · markdekock.com',
  reportLine: 'Aggregaat-rapport: State of AI in Marketing & Sales 2026',
}

// ── EN/FR/DE: TODO translate next pass — fall back to NL for now ─────────────
const EN: LangContent = NL
const FR: LangContent = NL
const DE: LangContent = NL

export const CONTENT: Record<Lang, LangContent> = { nl: NL, en: EN, fr: FR, de: DE }

export function getContent(lang: Lang): LangContent {
  return CONTENT[lang] ?? NL
}
