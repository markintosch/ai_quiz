/**
 * LinkedIn Recruiter Scan — Bas Westland / e-people
 * ─────────────────────────────────────────────────────────────────────────────
 * 5 dimensions × 3 questions = 15 questions total
 * Each question scored 1–4. Dimension score = avg × 25 → 0–100
 *
 * Dimensions:
 *  1. profile      — Profiel & Positionering
 *  2. network      — Netwerk & Bereik
 *  3. content      — Content & Zichtbaarheid
 *  4. sourcing     — Sourcing & Search
 *  5. engagement   — Engagement & Conversie
 */

export type DimensionId = 'profile' | 'network' | 'content' | 'sourcing' | 'engagement'

export type Lang = 'nl' | 'en'

export interface Dimension {
  id:          DimensionId
  icon:        string
  name:        string
  description: string
  lowLabel:    string
  highLabel:   string
}

export interface Question {
  id:         string
  dimensionId: DimensionId
  text:        string
  options:     { value: 1 | 2 | 3 | 4; label: string }[]
}

export interface ProfileContent {
  DIMENSIONS: Dimension[]
  QUESTIONS:  Question[]
  ROLES:      { id: string; label: string; description: string }[]
}

// ── NL content ────────────────────────────────────────────────────────────────

const NL_DIMENSIONS: Dimension[] = [
  {
    id: 'profile', icon: '🪪',
    name: 'Profiel & Positionering',
    description: 'Hoe sterk is jouw LinkedIn-profiel ingericht voor recruitment? Maak je duidelijk wie je zoekt en waarom kandidaten naar jou toe komen?',
    lowLabel: 'Basis profiel',
    highLabel: 'Magneetprofiel',
  },
  {
    id: 'network', icon: '🌐',
    name: 'Netwerk & Bereik',
    description: 'Hoe groot en kwalitatief is jouw netwerk? Bereik je de juiste doelgroepen — actieve én passieve kandidaten?',
    lowLabel: 'Beperkt bereik',
    highLabel: 'Sterk netwerk',
  },
  {
    id: 'content', icon: '✍️',
    name: 'Content & Zichtbaarheid',
    description: 'Zet je LinkedIn actief in om jezelf te profileren? Zichtbaarheid trekt kandidaten aan nog voordat je ze benadert.',
    lowLabel: 'Nauwelijks actief',
    highLabel: 'Thought leader',
  },
  {
    id: 'sourcing', icon: '🔎',
    name: 'Sourcing & Search',
    description: "Hoe effectief gebruik je LinkedIn's zoekfuncties om kandidaten te vinden? Van Boolean search tot Recruiter Lite filters.",
    lowLabel: 'Standaard zoeken',
    highLabel: 'Expert sourcer',
  },
  {
    id: 'engagement', icon: '💬',
    name: 'Engagement & Conversie',
    description: 'Hoe goed converteren jouw benaderingen? Van InMail-openingsratio tot het omzetten van een reactie in een echt gesprek.',
    lowLabel: 'Lage respons',
    highLabel: 'Hoge conversie',
  },
]

const NL_QUESTIONS: Question[] = [
  // ── Profiel & Positionering ──
  {
    id: 'p1', dimensionId: 'profile',
    text: 'Hoe omschrijf je de aanpak van jouw LinkedIn-headline?',
    options: [
      { value: 1, label: 'Alleen mijn functietitel' },
      { value: 2, label: 'Functietitel + bedrijfsnaam' },
      { value: 3, label: 'Titel + wie ik zoek of help' },
      { value: 4, label: 'Value proposition voor kandidaten en opdrachtgevers' },
    ],
  },
  {
    id: 'p2', dimensionId: 'profile',
    text: 'Hoe gebruik je de "About"-sectie van jouw profiel?',
    options: [
      { value: 1, label: 'Heb ik niet of nauwelijks ingevuld' },
      { value: 2, label: 'Kort stukje over mijn achtergrond' },
      { value: 3, label: 'Uitleg over wat ik doe voor kandidaten én klanten' },
      { value: 4, label: 'Duidelijke propositie met call-to-action en contactgegevens' },
    ],
  },
  {
    id: 'p3', dimensionId: 'profile',
    text: 'Hoe proactief optimaliseer je jouw profiel?',
    options: [
      { value: 1, label: 'Nauwelijks — ik pas het zelden aan' },
      { value: 2, label: 'Af en toe als er iets verandert in mijn rol' },
      { value: 3, label: 'Periodiek — elk kwartaal of bij campagnes' },
      { value: 4, label: 'Continu — ik test en optimaliseer actief' },
    ],
  },

  // ── Netwerk & Bereik ──
  {
    id: 'n1', dimensionId: 'network',
    text: 'Hoe is jouw netwerk samengesteld op LinkedIn?',
    options: [
      { value: 1, label: 'Voornamelijk collega\'s en vrienden' },
      { value: 2, label: 'Mix van collega\'s, klanten en enkele kandidaten' },
      { value: 3, label: 'Gericht opgebouwd: veel IT/internet-professionals in mijn sector' },
      { value: 4, label: 'Strategisch netwerk: 2e graads bereik van 500k+ in mijn doelgroep' },
    ],
  },
  {
    id: 'n2', dimensionId: 'network',
    text: 'Hoe actief bouw je jouw netwerk uit?',
    options: [
      { value: 1, label: 'Ik accepteer wie ik ken en stuur zelden verzoeken' },
      { value: 2, label: 'Af en toe — bij nieuwe opdrachten of events' },
      { value: 3, label: 'Wekelijks — gericht mensen uit mijn doelgroep connecten' },
      { value: 4, label: 'Dagelijks — actieve netwerkcampagne met gepersonaliseerde berichten' },
    ],
  },
  {
    id: 'n3', dimensionId: 'network',
    text: "Hoe gebruik je LinkedIn's \"People Also Viewed\" en aanbevelingen?",
    options: [
      { value: 1, label: 'Nooit bewust' },
      { value: 2, label: 'Soms als ik toevallig een goed profiel zie' },
      { value: 3, label: 'Regelmatig als aanvulling op mijn zoekstrategie' },
      { value: 4, label: 'Standaard onderdeel van mijn sourcing-workflow' },
    ],
  },

  // ── Content & Zichtbaarheid ──
  {
    id: 'c1', dimensionId: 'content',
    text: 'Hoe vaak post je zelf content op LinkedIn?',
    options: [
      { value: 1, label: 'Zelden of nooit' },
      { value: 2, label: 'Af en toe — een paar keer per maand' },
      { value: 3, label: '1–2 keer per week, met eigen inzichten' },
      { value: 4, label: 'Dagelijks of meerdere keren per week — bewuste contentstrategie' },
    ],
  },
  {
    id: 'c2', dimensionId: 'content',
    text: 'Wat voor content deel je typisch?',
    options: [
      { value: 1, label: 'Alleen vacatures' },
      { value: 2, label: 'Vacatures + af en toe een bedrijfsupdate' },
      { value: 3, label: 'Mix van vacatures, sector-nieuws en eigen mening' },
      { value: 4, label: 'Educatief, persoonlijk en thought leadership — vacatures zijn bijzaak' },
    ],
  },
  {
    id: 'c3', dimensionId: 'content',
    text: 'Hoe reageer je op interactie met jouw content?',
    options: [
      { value: 1, label: 'Nauwelijks — ik kijk er niet actief naar' },
      { value: 2, label: 'Soms, als ik toevallig een reactie zie' },
      { value: 3, label: 'Ik beantwoord reacties, maar niet altijd direct' },
      { value: 4, label: 'Altijd — interactie is een bewust onderdeel van mijn netwerken' },
    ],
  },

  // ── Sourcing & Search ──
  {
    id: 's1', dimensionId: 'sourcing',
    text: "Hoe gebruik je LinkedIn's zoekfilters bij het vinden van kandidaten?",
    options: [
      { value: 1, label: 'Alleen functietitel en locatie' },
      { value: 2, label: 'Titel, locatie, branche en verbindingsgraad' },
      { value: 3, label: 'Uitgebreide filters + Boolean-strings in het zoekveld' },
      { value: 4, label: 'Volledige Boolean-zoekopdrachten + Recruiter Lite/Pro filters' },
    ],
  },
  {
    id: 's2', dimensionId: 'sourcing',
    text: 'Hoe bewaak je jouw talentpipeline op LinkedIn?',
    options: [
      { value: 1, label: 'Ik heb geen actieve pipeline' },
      { value: 2, label: 'Ik sla interessante profielen op als ik ze tegenkom' },
      { value: 3, label: 'Georganiseerde lijsten per rol of sector' },
      { value: 4, label: 'Actief onderhouden pipeline met follow-up reminders' },
    ],
  },
  {
    id: 's3', dimensionId: 'sourcing',
    text: 'Hoe gebruik je Alumni-zoekfuncties en groepen voor sourcing?',
    options: [
      { value: 1, label: 'Nooit' },
      { value: 2, label: 'Wist niet dat dit kon of heb het nauwelijks geprobeerd' },
      { value: 3, label: 'Gebruik ik af en toe als aanvulling' },
      { value: 4, label: 'Standaard onderdeel van mijn sourcing-toolkit' },
    ],
  },

  // ── Engagement & Conversie ──
  {
    id: 'e1', dimensionId: 'engagement',
    text: 'Hoe schrijf je een benaderings-InMail of connectieverzoek?',
    options: [
      { value: 1, label: 'Standaard template, zelden gepersonaliseerd' },
      { value: 2, label: 'Ik pas de naam aan, maar de tekst is generiek' },
      { value: 3, label: 'Ik personaliseer op basis van profiel en recente activiteit' },
      { value: 4, label: 'Hyper-gepersonaliseerd: specifiek, relevant, altijd een haak vanuit hun profiel' },
    ],
  },
  {
    id: 'e2', dimensionId: 'engagement',
    text: 'Wat is jouw gemiddelde responspercentage op benaderingen?',
    options: [
      { value: 1, label: 'Minder dan 10%' },
      { value: 2, label: '10–20%' },
      { value: 3, label: '20–35%' },
      { value: 4, label: 'Meer dan 35%' },
    ],
  },
  {
    id: 'e3', dimensionId: 'engagement',
    text: 'Hoe nurture je kandidaten die nu niet beschikbaar zijn?',
    options: [
      { value: 1, label: 'Niet actief — ik wacht tot ze weer in beeld komen' },
      { value: 2, label: 'Af en toe een like op hun posts' },
      { value: 3, label: 'Periodiek contact + waardevolle content delen' },
      { value: 4, label: 'Gestructureerd nurturing-proces: regelmatig, relevant, menselijk' },
    ],
  },
]

const NL_ROLES = [
  { id: 'recruiter', label: 'Recruiter', description: 'Je werft kandidaten voor opdrachtgevers of je eigen organisatie' },
  { id: 'hr', label: 'HR Professional', description: 'Je combineert recruitment met bredere HR-taken' },
  { id: 'sales', label: 'Sales / BD', description: 'Je gebruikt LinkedIn primair voor business development' },
  { id: 'manager', label: 'Manager / Leidinggevende', description: 'Je zoekt soms zelf kandidaten voor je team' },
]

// ── EN content ────────────────────────────────────────────────────────────────

const EN_DIMENSIONS: Dimension[] = [
  {
    id: 'profile', icon: '🪪',
    name: 'Profile & Positioning',
    description: 'How well is your LinkedIn profile set up for recruitment? Do you clearly communicate who you\'re looking for and why candidates should come to you?',
    lowLabel: 'Basic profile',
    highLabel: 'Magnet profile',
  },
  {
    id: 'network', icon: '🌐',
    name: 'Network & Reach',
    description: 'How large and high-quality is your network? Are you reaching the right audiences — both active and passive candidates?',
    lowLabel: 'Limited reach',
    highLabel: 'Strong network',
  },
  {
    id: 'content', icon: '✍️',
    name: 'Content & Visibility',
    description: 'Do you actively use LinkedIn to build your personal brand? Visibility attracts candidates before you even reach out.',
    lowLabel: 'Barely active',
    highLabel: 'Thought leader',
  },
  {
    id: 'sourcing', icon: '🔎',
    name: 'Sourcing & Search',
    description: 'How effectively do you use LinkedIn\'s search capabilities to find candidates? From Boolean search to Recruiter Lite filters.',
    lowLabel: 'Basic search',
    highLabel: 'Expert sourcer',
  },
  {
    id: 'engagement', icon: '💬',
    name: 'Engagement & Conversion',
    description: 'How well do your outreach efforts convert? From InMail open rates to turning a response into a real conversation.',
    lowLabel: 'Low response',
    highLabel: 'High conversion',
  },
]

const EN_QUESTIONS: Question[] = [
  {
    id: 'p1', dimensionId: 'profile',
    text: 'How would you describe your LinkedIn headline strategy?',
    options: [
      { value: 1, label: 'Just my job title' },
      { value: 2, label: 'Title + company name' },
      { value: 3, label: 'Title + who I look for or help' },
      { value: 4, label: 'Value proposition for both candidates and clients' },
    ],
  },
  {
    id: 'p2', dimensionId: 'profile',
    text: 'How do you use the "About" section on your profile?',
    options: [
      { value: 1, label: 'Not filled in or barely' },
      { value: 2, label: 'Short paragraph about my background' },
      { value: 3, label: 'Explains what I do for candidates and clients' },
      { value: 4, label: 'Clear proposition with call-to-action and contact details' },
    ],
  },
  {
    id: 'p3', dimensionId: 'profile',
    text: 'How proactively do you optimise your profile?',
    options: [
      { value: 1, label: 'Rarely — I almost never update it' },
      { value: 2, label: 'Occasionally when my role changes' },
      { value: 3, label: 'Regularly — every quarter or around campaigns' },
      { value: 4, label: 'Continuously — I actively test and optimise' },
    ],
  },
  {
    id: 'n1', dimensionId: 'network',
    text: 'How is your LinkedIn network composed?',
    options: [
      { value: 1, label: 'Mainly colleagues and friends' },
      { value: 2, label: 'Mix of colleagues, clients and a few candidates' },
      { value: 3, label: 'Deliberately built: many IT/internet professionals in my sector' },
      { value: 4, label: 'Strategic network: 2nd-degree reach of 500k+ in my target audience' },
    ],
  },
  {
    id: 'n2', dimensionId: 'network',
    text: 'How actively do you grow your network?',
    options: [
      { value: 1, label: 'I accept who I know and rarely send requests' },
      { value: 2, label: 'Occasionally — around new assignments or events' },
      { value: 3, label: 'Weekly — targeted outreach to people in my audience' },
      { value: 4, label: 'Daily — active networking with personalised messages' },
    ],
  },
  {
    id: 'n3', dimensionId: 'network',
    text: 'How do you use "People Also Viewed" and LinkedIn suggestions?',
    options: [
      { value: 1, label: 'Never consciously' },
      { value: 2, label: 'Sometimes when I happen to see a good profile' },
      { value: 3, label: 'Regularly as a supplement to my search strategy' },
      { value: 4, label: 'Standard part of my sourcing workflow' },
    ],
  },
  {
    id: 'c1', dimensionId: 'content',
    text: 'How often do you post your own content on LinkedIn?',
    options: [
      { value: 1, label: 'Rarely or never' },
      { value: 2, label: 'Occasionally — a few times per month' },
      { value: 3, label: '1–2 times per week with original insights' },
      { value: 4, label: 'Daily or multiple times a week — deliberate content strategy' },
    ],
  },
  {
    id: 'c2', dimensionId: 'content',
    text: 'What kind of content do you typically share?',
    options: [
      { value: 1, label: 'Only job postings' },
      { value: 2, label: 'Job postings + occasional company update' },
      { value: 3, label: 'Mix of vacancies, industry news and my own opinions' },
      { value: 4, label: 'Educational, personal and thought leadership — vacancies are secondary' },
    ],
  },
  {
    id: 'c3', dimensionId: 'content',
    text: 'How do you respond to engagement on your content?',
    options: [
      { value: 1, label: 'Barely — I don\'t actively monitor it' },
      { value: 2, label: 'Sometimes, if I happen to spot a comment' },
      { value: 3, label: 'I reply to comments, though not always immediately' },
      { value: 4, label: 'Always — engagement is a deliberate part of my networking' },
    ],
  },
  {
    id: 's1', dimensionId: 'sourcing',
    text: 'How do you use LinkedIn\'s search filters when finding candidates?',
    options: [
      { value: 1, label: 'Only job title and location' },
      { value: 2, label: 'Title, location, industry and connection degree' },
      { value: 3, label: 'Advanced filters + Boolean strings in the search field' },
      { value: 4, label: 'Full Boolean queries + Recruiter Lite/Pro filters' },
    ],
  },
  {
    id: 's2', dimensionId: 'sourcing',
    text: 'How do you manage your talent pipeline on LinkedIn?',
    options: [
      { value: 1, label: 'I don\'t have an active pipeline' },
      { value: 2, label: 'I save interesting profiles when I come across them' },
      { value: 3, label: 'Organised lists per role or sector' },
      { value: 4, label: 'Actively maintained pipeline with follow-up reminders' },
    ],
  },
  {
    id: 's3', dimensionId: 'sourcing',
    text: 'How do you use alumni search and groups for sourcing?',
    options: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Didn\'t know it was possible or barely tried' },
      { value: 3, label: 'I use it occasionally as a supplement' },
      { value: 4, label: 'Standard part of my sourcing toolkit' },
    ],
  },
  {
    id: 'e1', dimensionId: 'engagement',
    text: 'How do you write an outreach InMail or connection request?',
    options: [
      { value: 1, label: 'Standard template, rarely personalised' },
      { value: 2, label: 'I change the name but the text is generic' },
      { value: 3, label: 'I personalise based on profile and recent activity' },
      { value: 4, label: 'Hyper-personalised: specific, relevant, always tied to something in their profile' },
    ],
  },
  {
    id: 'e2', dimensionId: 'engagement',
    text: 'What is your average response rate to outreach?',
    options: [
      { value: 1, label: 'Less than 10%' },
      { value: 2, label: '10–20%' },
      { value: 3, label: '20–35%' },
      { value: 4, label: 'More than 35%' },
    ],
  },
  {
    id: 'e3', dimensionId: 'engagement',
    text: 'How do you nurture candidates who aren\'t available right now?',
    options: [
      { value: 1, label: 'Not actively — I wait until they\'re back on my radar' },
      { value: 2, label: 'Occasionally liking their posts' },
      { value: 3, label: 'Periodic contact + sharing relevant content' },
      { value: 4, label: 'Structured nurturing process: regular, relevant, human' },
    ],
  },
]

const EN_ROLES = [
  { id: 'recruiter', label: 'Recruiter', description: 'You recruit candidates for clients or your own organisation' },
  { id: 'hr', label: 'HR Professional', description: 'You combine recruitment with broader HR responsibilities' },
  { id: 'sales', label: 'Sales / BD', description: 'You primarily use LinkedIn for business development' },
  { id: 'manager', label: 'Manager / Team Lead', description: 'You occasionally source candidates for your own team' },
]

// ── Main accessor ─────────────────────────────────────────────────────────────

export function getProfileContent(lang: Lang): ProfileContent {
  if (lang === 'en') return { DIMENSIONS: EN_DIMENSIONS, QUESTIONS: EN_QUESTIONS, ROLES: EN_ROLES }
  return { DIMENSIONS: NL_DIMENSIONS, QUESTIONS: NL_QUESTIONS, ROLES: NL_ROLES }
}

// ── Score helpers ─────────────────────────────────────────────────────────────

export type AnswerMap = Partial<Record<string, 1 | 2 | 3 | 4>>

export function computeScores(answers: AnswerMap, lang: Lang) {
  const { DIMENSIONS, QUESTIONS } = getProfileContent(lang)

  return DIMENSIONS.map(dim => {
    const dimQs     = QUESTIONS.filter(q => q.dimensionId === dim.id)
    const scores    = dimQs.map(q => answers[q.id] ?? 0).filter(v => v > 0) as number[]
    const avg       = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const score100  = Math.round((avg / 4) * 100)
    return { ...dim, score: score100, avg }
  })
}

export type Tier = 'starter' | 'developing' | 'advanced' | 'expert'

export function getTier(score: number): Tier {
  if (score >= 80) return 'expert'
  if (score >= 60) return 'advanced'
  if (score >= 40) return 'developing'
  return 'starter'
}

export const TIER_META: Record<Tier, { label: string; labelNl: string; color: string; description: string; descriptionNl: string }> = {
  starter: {
    label: 'Starter',
    labelNl: 'Starter',
    color: '#EF4444',
    description: 'You\'re using LinkedIn as a basic directory. There\'s a lot of opportunity to grow your effectiveness.',
    descriptionNl: 'Je gebruikt LinkedIn als basisadresboek. Er is veel ruimte om je effectiviteit te vergroten.',
  },
  developing: {
    label: 'Developing',
    labelNl: 'In ontwikkeling',
    color: '#F59E0B',
    description: 'You have a solid foundation but there are clear dimensions where focus will pay off quickly.',
    descriptionNl: 'Je hebt een solide basis, maar er zijn duidelijke dimensies waar focus snel loont.',
  },
  advanced: {
    label: 'Advanced',
    labelNl: 'Gevorderd',
    color: '#10B981',
    description: 'You\'re using LinkedIn strategically. A few targeted improvements will take you to the top tier.',
    descriptionNl: 'Je gebruikt LinkedIn strategisch. Een paar gerichte verbeteringen brengen je naar het hoogste niveau.',
  },
  expert: {
    label: 'Expert',
    labelNl: 'Expert',
    color: '#0F7B55',
    description: 'You\'re a LinkedIn recruitment expert. Your profile and approach are a model for others.',
    descriptionNl: 'Je bent een LinkedIn recruitment-expert. Jouw profiel en aanpak zijn een voorbeeld voor anderen.',
  },
}
