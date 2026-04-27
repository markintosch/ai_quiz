// AI-benchmark for marketing & sales — research instrument
// Languages: NL primary. EN/FR/DE currently fall back to NL — translation pass next round.

export type Lang = 'nl' | 'en' | 'fr' | 'de'
export const LANGS: Lang[] = ['nl', 'en', 'fr', 'de']

// ── Taxonomies ────────────────────────────────────────────────────────────────
export type DimensionId =
  | 'adoption' | 'workflow' | 'outcome' | 'data' | 'skill' | 'governance' | 'sentiment'

export type Dimension = {
  id: Exclude<DimensionId, 'sentiment'>
  icon: string
  name: string
  description: string
}

export type ArchetypeId =
  | 'pragmatist' | 'power_user' | 'curious_skeptic'
  | 'strategist' | 'lagging_builder' | 'shadow_operator'

export type Archetype = {
  id:       ArchetypeId
  emoji:    string
  name:     string
  identity: string
}

export type Role = 'marketing' | 'sales' | 'hybrid'

// ── Questions ─────────────────────────────────────────────────────────────────
export type QuestionType = 'multiselect' | 'frequency' | 'weighted_mc' | 'likert' | 'single_select' | 'matrix'

export type Option = {
  id:     string
  label:  string
  weight?: number  // weighted_mc, single_select sentiment ranking
}

export type MatrixRow = {
  id:    string
  label: string
}

export type Question = {
  id:        string
  type:      QuestionType
  dimension: DimensionId
  text:      string
  hint?:     string
  options:   Option[]
  // multiselect-specific:
  saturation?: number   // count of selected options that = 100% score; default 3
  hasOther?:   boolean
  // matrix-specific: rows answered with the same option set; answer stored as
  // string[] indexed by rows. Scoring uses the LAST row (most recent timeframe).
  rows?:     MatrixRow[]
}

// ── Content per language ──────────────────────────────────────────────────────
export type LangContent = {
  // nav
  navName:     string
  navTagline:  string
  navCta:      string

  // hero
  heroBadge:   string
  heroH1a:     string
  heroH1b:     string
  heroIntro:   string
  heroSub:     string
  heroCta1:    string
  heroCta2:    string
  trustLine:   string

  // personal quote
  quoteLabel:  string
  quoteBody:   string
  quoteAuthor: string
  quoteRole:   string

  // proof
  proofN:        string
  proofSubtitle: string

  // sections
  dimensionsLabel: string
  dimensionsTitle: string
  archetypesLabel: string
  archetypesTitle: string
  shareLabel:      string
  shareTitle:      string
  shareBody:       string

  DIMENSIONS:    Dimension[]
  ARCHETYPES:    Archetype[]

  // start (intro form)
  startBadge:        string
  startH1:           string
  startBody:         string
  startRoleLabel:    string
  startSeniorityLbl: string
  startIndustryLbl:  string
  startCompanySize:  string
  startRegionLbl:    string
  startNameLbl:      string
  startEmailLbl:     string
  startConsentLbl:   string
  startSubmit:       string
  startSubmitting:   string
  startError:        string
  startBack:         string

  // questions step
  qProgress:    string  // template "{n} van {total}"
  qSubmit:      string
  qSubmitting:  string
  qBack:        string
  qNext:        string
  qOtherLabel:  string

  // role labels
  ROLES:        { id: Role; label: string; description: string }[]
  SENIORITIES:  { id: string; label: string }[]
  INDUSTRIES:   { id: string; label: string }[]
  COMPANY_SIZES:{ id: string; label: string }[]
  REGIONS:      { id: string; label: string }[]

  // questions (computed via getQuestions)
  // results
  resultsBadge:      string
  resultsArchTitle:  string
  resultsArchBody:   string
  resultsScoreLbl:   string
  resultsDimsTitle:  string
  resultsCompareTtl: string
  resultsCompareBody:string
  resultsShareTitle: string
  resultsShareBody:  string
  resultsCtaCalendly:string

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

  quoteLabel:  'Waarom ik dit doe',
  quoteBody:   'Ik geloof in de kracht van mijn vakgenoten die mij de weg wijzen naar slimmere keuzes in het gebruik van AI-tools. Om die inzichten op te halen en gelijk te delen met de mensen die er zelf aan bijdragen, lijkt mij de beste manier om iedereen verder te helpen in één van de snelst innoverende fases van mijn werkend bestaan.',
  quoteAuthor: 'Mark de Kock',
  quoteRole:   'Mentor · markdekock.com',

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
    { id: 'power_user',      emoji: '⚡', name: 'Power User',       identity: "Bouwt eigen workflows, haalt 5× tijdwinst uit z'n stack." },
    { id: 'curious_skeptic', emoji: '🤔', name: 'Curious Skeptic',  identity: 'Probeert alles, vertrouwt nog niets blind. Gezond.' },
    { id: 'strategist',      emoji: '🧠', name: 'Strategist',       identity: 'Stuurt op governance, ROI en team-adoptie. Lange lijn.' },
    { id: 'lagging_builder', emoji: '🛠️', name: 'Lagging Builder',  identity: 'Achterstand, maar bouwt nu actief op. Inhaalslag bezig.' },
    { id: 'shadow_operator', emoji: '🥷', name: 'Shadow Operator',  identity: 'Gebruikt AI dagelijks, organisatie weet van niks.' },
  ],

  startBadge:        'Stap 1 van 2 · ~30 seconden',
  startH1:           'Wie ben je, en in welke wereld werk je?',
  startBody:         'We gebruiken deze antwoorden om jouw resultaat te vergelijken met de juiste peergroep. Niets wordt gedeeld zonder je naam erbij — alleen geaggregeerd in het rapport.',
  startRoleLabel:    'Wat is je hoofdrol?',
  startSeniorityLbl: 'Seniority',
  startIndustryLbl:  'Industrie',
  startCompanySize:  'Bedrijfsgrootte',
  startRegionLbl:    'Regio',
  startNameLbl:      'Je naam',
  startEmailLbl:     'E-mailadres (voor je dashboard)',
  startConsentLbl:   'Stuur me het aggregaat-rapport zodra het verschijnt.',
  startSubmit:       'Naar de vragen →',
  startSubmitting:   'Even geduld…',
  startError:        'Vul alle verplichte velden in.',
  startBack:         '← Terug',

  qProgress:   'Vraag {n} van {total}',
  qSubmit:     'Toon mijn dashboard →',
  qSubmitting: 'We berekenen je resultaat…',
  qBack:       '← Terug',
  qNext:       'Volgende →',
  qOtherLabel: 'Anders, namelijk…',

  ROLES: [
    { id: 'marketing', label: 'Marketing',          description: 'Content, demand gen, brand, web, lifecycle, ops.' },
    { id: 'sales',     label: 'Sales',              description: 'Prospecting, AE/closing, CS, enablement.' },
    { id: 'hybrid',    label: 'Hybride',            description: 'RevOps, founder, GTM-lead, full-funnel.' },
  ],
  SENIORITIES: [
    { id: 'ic',        label: 'IC / Specialist'      },
    { id: 'manager',   label: 'Manager'              },
    { id: 'director',  label: 'Director'             },
    { id: 'vp',        label: 'VP / C-level'         },
    { id: 'founder',   label: 'Founder / Owner'      },
  ],
  INDUSTRIES: [
    { id: 'saas',           label: 'SaaS / software'              },
    { id: 'agency',         label: 'Agency / consultancy'         },
    { id: 'ecommerce',      label: 'E-commerce / retail'          },
    { id: 'finance',        label: 'Finance / insurance'          },
    { id: 'healthcare',     label: 'Healthcare / life sciences'   },
    { id: 'industry',       label: 'Industry / manufacturing'     },
    { id: 'media',          label: 'Media / publishing'           },
    { id: 'education',      label: 'Education'                    },
    { id: 'public',         label: 'Public sector / non-profit'   },
    { id: 'other',          label: 'Anders'                       },
  ],
  COMPANY_SIZES: [
    { id: '1',           label: 'Solo (1)'           },
    { id: '2_10',        label: '2–10'               },
    { id: '11_50',       label: '11–50'              },
    { id: '51_200',      label: '51–200'             },
    { id: '201_1000',    label: '201–1.000'          },
    { id: '1001_plus',   label: '1.000+'             },
  ],
  REGIONS: [
    { id: 'nl',         label: 'Nederland'            },
    { id: 'be',         label: 'België'               },
    { id: 'lu',         label: 'Luxemburg'            },
    { id: 'de',         label: 'Duitsland'            },
    { id: 'eu_other',   label: 'Rest van EU'          },
    { id: 'world',      label: 'Buiten EU'            },
  ],

  resultsBadge:      'Jouw AI-benchmark resultaat',
  resultsArchTitle:  'Je archetype',
  resultsArchBody:   'Op basis van je antwoorden val je in dit profiel. Het zegt iets over je manier van werken — niet je waarde als professional.',
  resultsScoreLbl:   'AI Fluency Index',
  resultsDimsTitle:  'Score per dimensie',
  resultsCompareTtl: 'Hoe je je verhoudt',
  resultsCompareBody:'Per-vraag vergelijking met je peergroep ontgrendelt zodra we minstens 30 respondenten in jouw segment hebben. Op dit moment ben je één van de eersten — bedankt.',
  resultsShareTitle: 'Help je vakgenoten ook verder',
  resultsShareBody:  'Hoe meer mensen meedoen, hoe scherper het beeld wordt. Deel de benchmark met collega\'s die ook benieuwd zijn waar ze staan.',
  resultsCtaCalendly:'Praat 1-op-1 met Mark over je resultaat',

  footerLine: 'Gehost door Mark de Kock · markdekock.com',
  reportLine: 'Aggregaat-rapport: State of AI in Marketing & Sales 2026',
}

// EN/FR/DE: TODO translate next pass
const EN: LangContent = NL
const FR: LangContent = NL
const DE: LangContent = NL

export const CONTENT: Record<Lang, LangContent> = { nl: NL, en: EN, fr: FR, de: DE }

export function getContent(lang: Lang): LangContent {
  return CONTENT[lang] ?? NL
}

// ── Question bank (NL primary; same structure for all langs for now) ─────────
// IDs: q1..q13 shared core; q14m/q15m/q16m marketing-only; q14s/q15s/q16s sales;
// q14h/q15h/q16h hybrid; q17/q18 sentiment.

const FREQ_AI_USE: Option[] = [
  { id: 'never',     label: 'Nooit'                       },
  { id: 'monthly',   label: 'Maandelijks'                 },
  { id: 'weekly',    label: 'Wekelijks'                   },
  { id: 'daily',     label: 'Dagelijks'                   },
  { id: 'multi_day', label: 'Meerdere keren per dag'      },
]

const FREQ_TIME_SAVED: Option[] = [
  { id: 'lt1',  label: 'Minder dan 1 uur'  },
  { id: '1_3',  label: '1–3 uur'           },
  { id: '4_8',  label: '4–8 uur'           },
  { id: '8_15', label: '8–15 uur'          },
  { id: '15p',  label: '15+ uur'           },
]

const FREQ_PCT: Option[] = [
  { id: 'p0',    label: '0%'         },
  { id: 'p25',   label: '<25%'       },
  { id: 'p50',   label: '25–50%'     },
  { id: 'p75',   label: '50–75%'     },
  { id: 'p100',  label: '75%+'       },
]

const SHARED_CORE: Question[] = [
  {
    id: 'q1', type: 'multiselect', dimension: 'adoption', saturation: 3,
    text: 'Welke AI-assistenten gebruik je minstens wekelijks?',
    options: [
      { id: 'chatgpt',     label: 'ChatGPT'              },
      { id: 'claude',      label: 'Claude'               },
      { id: 'gemini',      label: 'Gemini'               },
      { id: 'copilot',     label: 'Copilot (M365/GitHub)' },
      { id: 'perplexity',  label: 'Perplexity'           },
      { id: 'mistral',     label: 'Mistral / Le Chat'    },
      { id: 'grok',        label: 'Grok'                 },
      { id: 'none',        label: 'Nog geen'             },
    ],
  },
  {
    id: 'q2', type: 'multiselect', dimension: 'adoption', saturation: 4, hasOther: true,
    text: 'Welke gespecialiseerde AI-tools zitten in jouw marketing- of sales-stack?',
    options: [
      { id: 'notion_ai',   label: 'Notion AI'           },
      { id: 'jasper',      label: 'Jasper'              },
      { id: 'copyai',      label: 'Copy.ai'             },
      { id: 'writer',      label: 'Writer'              },
      { id: 'surfer',      label: 'Surfer SEO'          },
      { id: 'canva_magic', label: 'Canva Magic Studio'  },
      { id: 'midjourney',  label: 'Midjourney'          },
      { id: 'firefly',     label: 'Adobe Firefly'       },
      { id: 'descript',    label: 'Descript'            },
      { id: 'synthesia',   label: 'Synthesia'           },
      { id: 'clay',        label: 'Clay'                },
      { id: 'apollo',      label: 'Apollo'              },
      { id: 'lavender',    label: 'Lavender'            },
      { id: 'gong',        label: 'Gong'                },
      { id: 'outreach',    label: 'Outreach'            },
      { id: 'salesloft',   label: 'Salesloft'           },
      { id: 'hubspot_ai',  label: 'HubSpot AI (Breeze)' },
      { id: 'einstein',    label: 'Salesforce Einstein' },
      { id: 'zapier_ai',   label: 'Zapier AI / Agents'  },
      { id: 'fathom',      label: 'Fathom / Granola / Otter' },
      { id: 'none',        label: 'Geen / niets'        },
    ],
  },
  {
    id: 'q3', type: 'frequency', dimension: 'adoption',
    text: 'Hoe vaak zet je AI in voor je werk?',
    options: FREQ_AI_USE,
  },
  {
    id: 'q4', type: 'multiselect', dimension: 'workflow', saturation: 4,
    text: 'Waar gebruik je AI vandaag voor?',
    hint: 'Kies wat geldt.',
    options: [
      { id: 'research',     label: 'Research'                          },
      { id: 'draft',        label: 'Schrijven (concept)'               },
      { id: 'finalize',     label: 'Schrijven (eindversie)'            },
      { id: 'summarize',    label: 'Samenvatten'                       },
      { id: 'translate',    label: 'Vertalen'                          },
      { id: 'imagery',      label: 'Beeld / video'                     },
      { id: 'analytics',    label: 'Data-analyse'                      },
      { id: 'code',         label: 'Code / formules'                   },
      { id: 'ideation',     label: 'Ideation / brainstorm'             },
      { id: 'customer',     label: 'Klant- of leadcontact'             },
      { id: 'none',         label: 'Niets van bovenstaande'            },
    ],
  },
  {
    id: 'q5', type: 'multiselect', dimension: 'workflow',
    text: 'Hoe zit AI in je workflow?',
    hint: 'Meerdere antwoorden mogelijk — kies wat geldt.',
    options: [
      { id: 'standalone', label: 'Losstaande tools / browser-tabs',    weight: 1 },
      { id: 'integrated', label: 'Geïntegreerd in CRM / CMS / inbox',  weight: 2 },
      { id: 'custom_gpt', label: 'Eigen prompts of GPTs',              weight: 3 },
      { id: 'agents',     label: 'Agents / workflows die zelfstandig stappen doen', weight: 4 },
      { id: 'in_house',   label: 'Custom in-house build',              weight: 4 },
    ],
  },
  {
    id: 'q6', type: 'frequency', dimension: 'outcome',
    text: 'Hoeveel tijd bespaar je per week dankzij AI?',
    options: FREQ_TIME_SAVED,
  },
  {
    id: 'q7', type: 'multiselect', dimension: 'outcome', saturation: 3,
    text: 'Welke meetbare resultaten zie je al?',
    options: [
      { id: 'output',     label: 'Meer output'                         },
      { id: 'quality',    label: 'Hogere kwaliteit'                    },
      { id: 'speed',      label: 'Snellere doorlooptijd'               },
      { id: 'conversion', label: 'Hogere conversie'                    },
      { id: 'cost',       label: 'Lagere kosten'                       },
      { id: 'insights',   label: 'Nieuwe inzichten uit data'           },
      { id: 'none',       label: 'Nog niet meetbaar'                   },
    ],
  },
  {
    id: 'q8', type: 'weighted_mc', dimension: 'data',
    text: 'Hoe zou je de hygiëne van je CRM/data beschrijven?',
    options: [
      { id: 'chaos',     label: 'Chaos',                  weight: 0 },
      { id: 'mediocre',  label: 'Matig',                  weight: 1 },
      { id: 'workable',  label: 'Werkbaar',               weight: 2 },
      { id: 'tidy',      label: 'Netjes',                 weight: 3 },
      { id: 'sot',       label: 'Single source of truth', weight: 4 },
    ],
  },
  {
    id: 'q9', type: 'multiselect', dimension: 'data', saturation: 3,
    text: 'Wat heb je gedocumenteerd dat AI kan gebruiken?',
    hint: 'Documenten of kennis die AI als context kan inzetten.',
    options: [
      { id: 'icp',         label: 'ICP / persona\'s'              },
      { id: 'voice',       label: 'Brand voice / tone'            },
      { id: 'library',     label: 'Content library'               },
      { id: 'playbooks',   label: 'Sales playbooks'               },
      { id: 'positioning', label: 'Productpositionering'          },
      { id: 'cases',       label: 'Casestudy-bibliotheek'         },
      { id: 'none',        label: 'Niets gedocumenteerd'          },
    ],
  },
  {
    id: 'q10', type: 'matrix', dimension: 'skill',
    text: 'Hoe vaardig was je met AI op deze momenten?',
    hint: 'Geef per moment je inschatting — dat laat zien hoe je trajectorie eruitziet.',
    rows: [
      { id: 'm12', label: '12 maanden geleden' },
      { id: 'm6',  label: '6 maanden geleden'  },
      { id: 'm3',  label: '3 maanden geleden'  },
    ],
    options: [
      { id: 'never',       label: 'Niet / nooit gebruikt', weight: 0 },
      { id: 'beginner',    label: 'Beginner',              weight: 1 },
      { id: 'comfortable', label: 'Comfortabel',           weight: 2 },
      { id: 'experienced', label: 'Ervaren',               weight: 3 },
      { id: 'expert',      label: 'Expert',                weight: 4 },
    ],
  },
  {
    id: 'q11', type: 'weighted_mc', dimension: 'skill',
    text: 'Heeft je team gestructureerde AI-training gehad?',
    options: [
      { id: 'no',          label: 'Nee',                                weight: 0 },
      { id: 'informal',    label: 'Informeel (kennisdeling intern)',    weight: 1 },
      { id: 'one_off',     label: 'Eenmalige workshop',                 weight: 2 },
      { id: 'ongoing',     label: 'Doorlopend programma',               weight: 3 },
      { id: 'continuous',  label: 'Continue learning loop met meetpunten', weight: 4 },
    ],
  },
  {
    id: 'q12', type: 'weighted_mc', dimension: 'governance',
    text: 'Hoe ga je om met output van AI?',
    options: [
      { id: 'cp',          label: 'Copy-paste',                                weight: 0 },
      { id: 'light',       label: 'Lichte review',                             weight: 1 },
      { id: 'strict',      label: 'Strenge review',                            weight: 2 },
      { id: 'editor',      label: 'AI als startpunt, mens als eindredacteur',  weight: 3 },
      { id: 'kpi',         label: "Gevalideerd via meetbare KPI's",            weight: 4 },
    ],
  },
  {
    id: 'q13', type: 'weighted_mc', dimension: 'governance',
    text: 'Zijn er duidelijke richtlijnen voor AI-gebruik in je organisatie?',
    options: [
      { id: 'none',        label: 'Geen',                                weight: 0 },
      { id: 'informal',    label: 'Informele afspraken',                 weight: 1 },
      { id: 'wip',         label: 'In ontwikkeling',                     weight: 2 },
      { id: 'policy',      label: 'Bestaat als beleid',                  weight: 3 },
      { id: 'enforced',    label: 'Wordt actief gehandhaafd',            weight: 4 },
    ],
  },
]

const ROLE_MARKETING: Question[] = [
  {
    id: 'q14m', type: 'weighted_mc', dimension: 'outcome',
    text: 'Hoe heeft AI je content-output veranderd?',
    options: [
      { id: 'none',     label: 'Geen verschil',           weight: 0 },
      { id: 'slight',   label: 'Iets meer',                weight: 1 },
      { id: 'double',   label: '~2× zoveel',               weight: 3 },
      { id: 'triple',   label: '3×+',                      weight: 4 },
      { id: 'quality',  label: 'Kwaliteit i.p.v. kwantiteit', weight: 3 },
    ],
  },
  {
    id: 'q15m', type: 'multiselect', dimension: 'adoption', saturation: 3, hasOther: true,
    text: 'Welke marketing-taken doe je nu met AI?',
    options: [
      { id: 'copy',          label: 'Copywriting'                 },
      { id: 'seo',           label: 'SEO research'                },
      { id: 'email',         label: 'E-mail campaigns'            },
      { id: 'social',        label: 'Social posts'                },
      { id: 'ads',           label: 'Ad creatives'                },
      { id: 'personalization',label: 'Personalisatie'             },
      { id: 'analytics',     label: 'Analytics / rapportage'      },
      { id: 'attribution',   label: 'Attributie'                  },
      { id: 'imagery',       label: 'Beeld / video'               },
      { id: 'none',          label: 'Geen'                        },
    ],
  },
  {
    id: 'q16m', type: 'frequency', dimension: 'workflow',
    text: 'Welk deel van je creatieve werk begint nu met AI?',
    hint: 'Drafts, ideeën, eerste versies — voordat jij of je team het verder uitwerkt.',
    options: FREQ_PCT,
  },
]

const ROLE_SALES: Question[] = [
  {
    id: 'q14s', type: 'multiselect', dimension: 'adoption', saturation: 3,
    text: 'Welke sales-taken doe je met AI?',
    options: [
      { id: 'research',  label: 'Prospect research'           },
      { id: 'outreach',  label: 'Outreach personalisatie'     },
      { id: 'coaching',  label: 'Call coaching'               },
      { id: 'notes',     label: 'Dealnotities'                },
      { id: 'objection', label: 'Objection prep'              },
      { id: 'proposal',  label: 'Proposals'                   },
      { id: 'forecast',  label: 'Forecasting'                 },
      { id: 'pipeline',  label: 'Pipeline hygiene'            },
      { id: 'none',      label: 'Geen'                        },
    ],
  },
  {
    id: 'q15s', type: 'frequency', dimension: 'workflow',
    text: 'Welk percentage van je outbound is AI-ondersteund?',
    options: FREQ_PCT,
  },
  {
    id: 'q16s', type: 'multiselect', dimension: 'workflow', saturation: 3,
    text: 'Hoe gebruik je AI rond een sales-gesprek?',
    options: [
      { id: 'prep',     label: 'Voorbereiding (account research)'    },
      { id: 'live',     label: 'Live notes'                          },
      { id: 'summary',  label: 'Samenvatting achteraf'               },
      { id: 'followup', label: 'Follow-up draft'                     },
      { id: 'next',     label: 'Next-step suggesties'                },
      { id: 'object',   label: 'Objection coaching'                  },
      { id: 'none',     label: 'Niets'                               },
    ],
  },
]

const ROLE_HYBRID: Question[] = [
  {
    id: 'q14h', type: 'multiselect', dimension: 'adoption', saturation: 3,
    text: 'Welke processen heb je het sterkst geautomatiseerd met AI?',
    options: [
      { id: 'enrichment',label: 'Lead enrichment'           },
      { id: 'scoring',   label: 'Lead scoring'              },
      { id: 'outreach',  label: 'Outreach'                  },
      { id: 'reporting', label: 'Reporting'                 },
      { id: 'forecast',  label: 'Forecasting'               },
      { id: 'crm',       label: 'CRM hygiene'               },
      { id: 'content',   label: 'Content productie'         },
      { id: 'onboard',   label: 'Onboarding'                },
      { id: 'none',      label: 'Niets'                     },
    ],
  },
  {
    id: 'q15h', type: 'weighted_mc', dimension: 'governance',
    text: 'Hoe bestuur je AI-experimenten over teams heen?',
    options: [
      { id: 'adhoc',      label: 'Ad-hoc',                          weight: 0 },
      { id: 'silo',       label: 'Per team eigen koers',            weight: 1 },
      { id: 'guidelines', label: 'Centrale guidelines',             weight: 2 },
      { id: 'tiger',      label: 'Werkgroep / tiger team',          weight: 3 },
      { id: 'roadmap',    label: "AI-roadmap met KPI's",            weight: 4 },
    ],
  },
  {
    id: 'q16h', type: 'multiselect', dimension: 'outcome', saturation: 3,
    text: 'Waar levert AI de meeste meetbare ROI op in je organisatie?',
    options: [
      { id: 'cac',       label: 'Acquisitiekosten'              },
      { id: 'velocity',  label: 'Pipeline velocity'             },
      { id: 'content',   label: 'Content-output'                },
      { id: 'retention', label: 'Klantretentie'                 },
      { id: 'productivity', label: 'Personeelsproductiviteit'   },
      { id: 'none',      label: 'Nog niet meetbaar'             },
    ],
  },
]

const SENTIMENT: Question[] = [
  {
    id: 'q17', type: 'multiselect', dimension: 'sentiment', saturation: 1,
    text: 'Welke blokkades houden meer AI-gebruik tegen (in je werk of team)?',
    hint: 'Meerdere antwoorden mogelijk.',
    options: [
      { id: 'time',       label: 'Geen tijd'                       },
      { id: 'strategy',   label: 'Geen strategie'                  },
      { id: 'data',       label: 'Data niet op orde'               },
      { id: 'compliance', label: 'Privacy / compliance'            },
      { id: 'skill',      label: 'Vaardigheden'                    },
      { id: 'leadership', label: 'Leiderschap niet aan boord'      },
      { id: 'budget',     label: 'Geen budget'                     },
      { id: 'none',       label: 'Geen blokkade'                   },
    ],
  },
  {
    id: 'q18', type: 'likert', dimension: 'sentiment',
    text: 'Hoe staat leiderschap in jouw organisatie tegenover AI?',
    options: [
      { id: 'block',     label: 'Actieve rem',         weight: 0 },
      { id: 'passive',   label: 'Passief',             weight: 1 },
      { id: 'curious',   label: 'Nieuwsgierig',        weight: 2 },
      { id: 'driver',    label: 'Aanjager',            weight: 3 },
      { id: 'roadmap',   label: 'Eigen roadmap',       weight: 4 },
    ],
  },
]

export function getQuestions(role: Role): Question[] {
  const roleSpecific =
    role === 'marketing' ? ROLE_MARKETING :
    role === 'sales'     ? ROLE_SALES     :
                           ROLE_HYBRID
  return [...SHARED_CORE, ...roleSpecific, ...SENTIMENT]
}

// Helper: number of "scoring" questions (excluding sentiment) for a given role
export function getScoringQuestions(role: Role): Question[] {
  return getQuestions(role).filter(q => q.dimension !== 'sentiment')
}
