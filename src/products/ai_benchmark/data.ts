// AI-benchmark for marketing & sales — research instrument
// Languages: NL primary; EN, FR, DE fully translated.
// Translations are conservative; idioms native to each language. Reword as needed.

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
  weight?: number
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
  saturation?: number
  hasOther?:   boolean
  rows?:       MatrixRow[]
}

// Structural definition (language-agnostic) — shape, weights, saturation, etc.
type QuestionStructure = {
  id:          string
  type:        QuestionType
  dimension:   DimensionId
  saturation?: number
  hasOther?:   boolean
  options:     { id: string; weight?: number }[]
  rowIds?:     string[]
}

// Per-language text for one question
type QuestionStrings = {
  text:    string
  hint?:   string
  options: Record<string, string>
  rows?:   Record<string, string>
}

// ── Per-language UI content ─────────────────────────────────────────────────
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
  proofVague:    string  // shown when usingMock or N too low to claim a number
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
  qProgress:    string
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

  // LiveCounter — fuzzy text shown when N too low to claim a number
  liveVagueLabel: string
}

// ════════════════════════════════════════════════════════════════════════════
// NL — Master language
// ════════════════════════════════════════════════════════════════════════════
const NL: LangContent = {
  navName:    'AI-benchmark',
  navTagline: 'voor marketing & sales',
  navCta:     'Start de benchmark →',

  heroBadge:  'Onafhankelijk onderzoek · door Mark de Kock',
  heroH1a:    'Hoe gebruik jij AI in',
  heroH1b:    'marketing & sales, écht?',
  heroIntro:  'We gebruiken steeds vaker AI-tools. Van eenvoudige chat op een instapaccount tot dure videobewerking of sales-funnel tools. En elke dag lijkt er een nieuwe tool bij te komen. Waar steek je nou je tijd in om het gebruik te leren? Wat nou als je vakgenoten je de weg wijzen in wat wél werkt?',
  heroSub:    'Vergelijk je werkwijze, je tools en je impact met die van vele andere marketeers en sales-professionals. Deel jouw inzichten en krijg een beeld van de markt in een overzichtelijk dashboard.',
  heroCta1:   'Start de benchmark →',
  heroCta2:   'Hoe het werkt',
  trustLine:  '18 vragen · ~6 minuten · Gratis · Persoonlijk dashboard direct na invullen',

  quoteLabel:  'Waarom ik dit doe',
  quoteBody:   'Ik geloof in de kracht van mijn vakgenoten die mij de weg wijzen naar slimmere keuzes in het gebruik van AI-tools. Om die inzichten op te halen en gelijk te delen met de mensen die er zelf aan bijdragen, lijkt mij de beste manier om iedereen verder te helpen in één van de snelst innoverende fases van mijn werkend bestaan.',
  quoteAuthor: 'Mark de Kock',
  quoteRole:   'Marketing consultant · markdekock.com',

  proofN:        '{n} marketeers en sellers hebben al meegedaan',
  proofVague:    'Een groeiende groep marketeers en sellers doet mee',
  proofSubtitle: 'Jouw antwoorden bouwen mee aan het grootste onafhankelijke beeld van AI-gebruik in BeNeLux.',

  dimensionsLabel: '6 Dimensies',
  dimensionsTitle: 'Waarop we je benchmarken',
  archetypesLabel: '6 Archetypes',
  archetypesTitle: 'Welk type AI-gebruiker ben jij?',
  shareLabel:      'De reden om mee te doen',
  shareTitle:      'Je krijgt geen score. Je krijgt context.',
  shareBody:       'Een score van 73 is een nummer. "Slechts 19% van sellers in jouw segment gebruikt Clay, en jij wel" is een identiteit. Het persoonlijke dashboard laat per vraag zien hoe je je verhoudt tot je peers, met een filter om te wisselen tussen iedereen, alleen sales, jouw industrie of jouw bedrijfsgrootte.',

  DIMENSIONS: [
    { id: 'adoption',   icon: '🧭', name: 'Adoptie',                description: 'Welke tools je gebruikt en hoe vaak.' },
    { id: 'workflow',   icon: '⚙️', name: 'Workflow-integratie',     description: 'Losse tabs of ingebed in je stack.' },
    { id: 'outcome',    icon: '📈', name: 'Outcome & ROI',           description: 'Tijdwinst, kwaliteit, conversie.' },
    { id: 'data',       icon: '📚', name: 'Data-readiness',          description: 'CRM-hygiëne, ICP, content library.' },
    { id: 'skill',      icon: '🎓', name: 'Skill & vertrouwen',      description: 'Vaardigheid van jou en je team.' },
    { id: 'governance', icon: '🛡️', name: 'Governance & beleid',     description: 'Richtlijnen, kwaliteitscontrole, brand voice.' },
  ],

  ARCHETYPES: [
    { id: 'pragmatist',      emoji: '🎯', name: 'Pragmatist',      identity: 'Zet AI in waar het concreet helpt. Geen theater.' },
    { id: 'power_user',      emoji: '⚡', name: 'Power User',       identity: "Bouwt eigen workflows en haalt 5× tijdwinst uit z'n stack." },
    { id: 'curious_skeptic', emoji: '🤔', name: 'Curious Skeptic',  identity: 'Probeert alles, vertrouwt nog niets blind. Gezond dus.' },
    { id: 'strategist',      emoji: '🧠', name: 'Strategist',       identity: 'Stuurt op governance, ROI en team-adoptie. Speelt voor de lange lijn.' },
    { id: 'lagging_builder', emoji: '🛠️', name: 'Lagging Builder',  identity: 'Achterstand, maar bouwt nu actief op. Inhaalslag is bezig.' },
    { id: 'shadow_operator', emoji: '🥷', name: 'Shadow Operator',  identity: 'Gebruikt AI dagelijks. Organisatie weet van niks.' },
  ],

  startBadge:        'Stap 1 van 2 · ~30 seconden',
  startH1:           'Wie ben je, en in welke wereld werk je?',
  startBody:         'We gebruiken deze antwoorden om jouw resultaat te vergelijken met de juiste peergroep. Niets wordt gedeeld onder jouw naam. Alleen anoniem en geaggregeerd in het rapport.',
  startRoleLabel:    'Wat is je hoofdrol?',
  startSeniorityLbl: 'Seniority',
  startIndustryLbl:  'Industrie',
  startCompanySize:  'Bedrijfsgrootte',
  startRegionLbl:    'Regio',
  startNameLbl:      'Je naam',
  startEmailLbl:     'E-mailadres (verplicht — voor je dashboard-link)',
  startConsentLbl:   'Ja, ik wil incidenteel e-mails ontvangen van Mark de Kock over de AI-benchmark, het aggregaat-rapport en relevante updates over AI in marketing & sales. Ik kan me op elk moment uitschrijven.',
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
    { id: 'finance',        label: 'Finance / verzekeringen'      },
    { id: 'healthcare',     label: 'Healthcare / life sciences'   },
    { id: 'industry',       label: 'Industrie / productie'        },
    { id: 'media',          label: 'Media / publishing'           },
    { id: 'education',      label: 'Onderwijs'                    },
    { id: 'public',         label: 'Publieke sector / non-profit' },
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
  resultsArchBody:   'Op basis van je antwoorden val je in dit profiel. Het zegt iets over je manier van werken, niet over je waarde als professional.',
  resultsScoreLbl:   'AI Fluency Index',
  resultsDimsTitle:  'Score per dimensie',
  resultsCompareTtl: 'Hoe je je verhoudt',
  resultsCompareBody:'Per-vraag vergelijking met je peergroep ontgrendelt zodra we minstens 30 respondenten in jouw segment hebben. Op dit moment ben je één van de eersten. Bedankt daarvoor.',
  resultsShareTitle: 'Help je vakgenoten ook verder',
  resultsShareBody:  "Hoe meer mensen meedoen, hoe scherper het beeld wordt. Deel de benchmark met collega's die ook benieuwd zijn waar ze staan.",
  resultsCtaCalendly:'Praat 1-op-1 met Mark over je resultaat',

  footerLine: 'Gehost door Mark de Kock · markdekock.com',
  reportLine: 'Aggregaat-rapport: State of AI in Marketing & Sales 2026',

  liveVagueLabel: 'Groeiende groep professionals',
}

// ════════════════════════════════════════════════════════════════════════════
// EN — English
// ════════════════════════════════════════════════════════════════════════════
const EN: LangContent = {
  navName:    'AI-benchmark',
  navTagline: 'for marketing & sales',
  navCta:     'Start the benchmark →',

  heroBadge:  'Independent research · by Mark de Kock',
  heroH1a:    'How do you actually use AI',
  heroH1b:    'in marketing & sales?',
  heroIntro:  "We're using more AI tools all the time. From a basic chat account to expensive video editing or sales-funnel tools. New ones appear every day. Where do you spend your time learning? What if your peers showed you what really works?",
  heroSub:    'Compare your approach, your tools and your impact with hundreds of other marketers and sales professionals. Share your insights and get a clear picture of the market in one dashboard.',
  heroCta1:   'Start the benchmark →',
  heroCta2:   'How it works',
  trustLine:  '18 questions · ~6 minutes · Free · Personal dashboard right after submitting',

  quoteLabel:  'Why I do this',
  quoteBody:   'I believe in the strength of my peers showing me smarter choices for using AI tools. Pulling those insights together and sharing them straight back with the people who contributed seems to me the best way to help everyone forward in one of the fastest-innovating phases of my working life.',
  quoteAuthor: 'Mark de Kock',
  quoteRole:   'Marketing consultant · markdekock.com',

  proofN:        '{n} marketers and sellers have already taken part',
  proofVague:    'A growing group of marketers and sellers is taking part',
  proofSubtitle: "Your answers help build the largest independent picture of AI use in BeNeLux.",

  dimensionsLabel: '6 Dimensions',
  dimensionsTitle: 'What we benchmark you on',
  archetypesLabel: '6 Archetypes',
  archetypesTitle: 'What kind of AI user are you?',
  shareLabel:      'The reason to take part',
  shareTitle:      "You don't get a score. You get context.",
  shareBody:       'A score of 73 is a number. "Only 19% of sellers in your segment use Clay — and you do" is an identity. The personal dashboard shows per question how you compare to your peers, with a filter to switch between everyone, sales only, your industry, or your company size.',

  DIMENSIONS: [
    { id: 'adoption',   icon: '🧭', name: 'Adoption',           description: 'Which tools you use, and how often.' },
    { id: 'workflow',   icon: '⚙️', name: 'Workflow integration', description: 'Loose tabs or embedded in your stack.' },
    { id: 'outcome',    icon: '📈', name: 'Outcome & ROI',       description: 'Time saved, quality, conversion.' },
    { id: 'data',       icon: '📚', name: 'Data readiness',      description: 'CRM hygiene, ICP, content library.' },
    { id: 'skill',      icon: '🎓', name: 'Skill & confidence',  description: 'How capable you and your team are.' },
    { id: 'governance', icon: '🛡️', name: 'Governance & policy', description: 'Guidelines, quality control, brand voice.' },
  ],

  ARCHETYPES: [
    { id: 'pragmatist',      emoji: '🎯', name: 'Pragmatist',      identity: 'Uses AI where it concretely helps. No theatre.' },
    { id: 'power_user',      emoji: '⚡', name: 'Power User',       identity: "Builds custom workflows. Squeezes 5× time savings out of the stack." },
    { id: 'curious_skeptic', emoji: '🤔', name: 'Curious Skeptic',  identity: 'Tries everything, trusts nothing blindly. Healthy stance.' },
    { id: 'strategist',      emoji: '🧠', name: 'Strategist',       identity: 'Steers on governance, ROI and team adoption. Long game.' },
    { id: 'lagging_builder', emoji: '🛠️', name: 'Lagging Builder',  identity: 'Behind the curve, but actively catching up.' },
    { id: 'shadow_operator', emoji: '🥷', name: 'Shadow Operator',  identity: 'Uses AI daily. The organisation has no idea.' },
  ],

  startBadge:        'Step 1 of 2 · ~30 seconds',
  startH1:           'Who are you, and what world do you work in?',
  startBody:         "We use these answers to compare your result to the right peer group. Nothing is shared under your name. Only anonymously and aggregated in the report.",
  startRoleLabel:    'What is your main role?',
  startSeniorityLbl: 'Seniority',
  startIndustryLbl:  'Industry',
  startCompanySize:  'Company size',
  startRegionLbl:    'Region',
  startNameLbl:      'Your name',
  startEmailLbl:     'Email address (required — for your dashboard link)',
  startConsentLbl:   "Yes, I'd like to occasionally receive emails from Mark de Kock about the AI-benchmark, the aggregate report and relevant updates about AI in marketing & sales. I can unsubscribe at any time.",
  startSubmit:       'On to the questions →',
  startSubmitting:   'One moment…',
  startError:        'Please fill in all required fields.',
  startBack:         '← Back',

  qProgress:   'Question {n} of {total}',
  qSubmit:     'Show my dashboard →',
  qSubmitting: 'Calculating your result…',
  qBack:       '← Back',
  qNext:       'Next →',
  qOtherLabel: 'Other, namely…',

  ROLES: [
    { id: 'marketing', label: 'Marketing',     description: 'Content, demand gen, brand, web, lifecycle, ops.' },
    { id: 'sales',     label: 'Sales',         description: 'Prospecting, AE/closing, CS, enablement.' },
    { id: 'hybrid',    label: 'Hybrid',        description: 'RevOps, founder, GTM lead, full-funnel.' },
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
    { id: 'other',          label: 'Other'                        },
  ],
  COMPANY_SIZES: [
    { id: '1',           label: 'Solo (1)'           },
    { id: '2_10',        label: '2–10'               },
    { id: '11_50',       label: '11–50'              },
    { id: '51_200',      label: '51–200'             },
    { id: '201_1000',    label: '201–1,000'          },
    { id: '1001_plus',   label: '1,000+'             },
  ],
  REGIONS: [
    { id: 'nl',         label: 'Netherlands'          },
    { id: 'be',         label: 'Belgium'              },
    { id: 'lu',         label: 'Luxembourg'           },
    { id: 'de',         label: 'Germany'              },
    { id: 'eu_other',   label: 'Rest of EU'           },
    { id: 'world',      label: 'Outside EU'           },
  ],

  resultsBadge:      'Your AI-benchmark result',
  resultsArchTitle:  'Your archetype',
  resultsArchBody:   "Based on your answers you fit this profile. It says something about how you work, not about your value as a professional.",
  resultsScoreLbl:   'AI Fluency Index',
  resultsDimsTitle:  'Score per dimension',
  resultsCompareTtl: 'How you compare',
  resultsCompareBody:'Per-question comparison with your peer group unlocks once we have at least 30 respondents in your segment. Right now you are one of the first. Thanks for that.',
  resultsShareTitle: 'Help your peers move forward too',
  resultsShareBody:  'The more people take part, the sharper the picture gets. Share the benchmark with colleagues who are curious where they stand too.',
  resultsCtaCalendly:'Talk 1-on-1 with Mark about your result',

  footerLine: 'Hosted by Mark de Kock · markdekock.com',
  reportLine: 'Aggregate report: State of AI in Marketing & Sales 2026',

  liveVagueLabel: 'Growing group of professionals',
}

// ════════════════════════════════════════════════════════════════════════════
// FR — Français
// ════════════════════════════════════════════════════════════════════════════
const FR: LangContent = {
  navName:    'AI-benchmark',
  navTagline: 'pour le marketing & la vente',
  navCta:     'Lancer le benchmark →',

  heroBadge:  'Étude indépendante · par Mark de Kock',
  heroH1a:    'Comment utilises-tu vraiment',
  heroH1b:    "l'IA en marketing & vente ?",
  heroIntro:  "On utilise de plus en plus d'outils IA. D'un simple chat sur un compte d'entrée à des outils coûteux de montage vidéo ou de tunnel de vente. Et chaque jour, un nouvel outil apparaît. Où places-tu ton temps pour apprendre à les utiliser ? Et si tes pairs te montraient ce qui fonctionne vraiment ?",
  heroSub:    "Compare ta façon de travailler, tes outils et ton impact à ceux de centaines d'autres pros du marketing et de la vente. Partage tes insights et obtiens une vision claire du marché dans un tableau de bord.",
  heroCta1:   'Lancer le benchmark →',
  heroCta2:   'Comment ça marche',
  trustLine:  '18 questions · ~6 minutes · Gratuit · Tableau de bord personnel directement après soumission',

  quoteLabel:  'Pourquoi je fais ça',
  quoteBody:   "Je crois en la force de mes pairs pour me montrer des choix plus intelligents dans l'utilisation des outils IA. Recueillir ces insights et les partager directement avec les personnes qui y contribuent me semble la meilleure façon d'aider tout le monde à avancer dans l'une des phases d'innovation les plus rapides de ma vie professionnelle.",
  quoteAuthor: 'Mark de Kock',
  quoteRole:   'Consultant marketing · markdekock.com',

  proofN:        '{n} marketeurs et commerciaux ont déjà participé',
  proofVague:    'Un groupe grandissant de marketeurs et commerciaux participe',
  proofSubtitle: "Tes réponses contribuent à la plus grande image indépendante de l'usage de l'IA au BeNeLux.",

  dimensionsLabel: '6 Dimensions',
  dimensionsTitle: 'Sur quoi nous te benchmarkons',
  archetypesLabel: '6 Archétypes',
  archetypesTitle: "Quel type d'utilisateur d'IA es-tu ?",
  shareLabel:      'La raison de participer',
  shareTitle:      "Tu n'obtiens pas un score. Tu obtiens du contexte.",
  shareBody:       "Un score de 73 est un chiffre. \"Seulement 19% des commerciaux de ton segment utilisent Clay, et toi oui\" est une identité. Le tableau de bord personnel montre par question comment tu te compares à tes pairs, avec un filtre pour basculer entre tout le monde, sales uniquement, ton industrie ou ta taille d'entreprise.",

  DIMENSIONS: [
    { id: 'adoption',   icon: '🧭', name: 'Adoption',                 description: 'Quels outils tu utilises et à quelle fréquence.' },
    { id: 'workflow',   icon: '⚙️', name: 'Intégration au workflow', description: 'Onglets séparés ou intégrés à ton stack.' },
    { id: 'outcome',    icon: '📈', name: 'Résultats & ROI',          description: 'Gain de temps, qualité, conversion.' },
    { id: 'data',       icon: '📚', name: 'Préparation des données',  description: 'Hygiène CRM, ICP, bibliothèque de contenu.' },
    { id: 'skill',      icon: '🎓', name: 'Compétence & confiance',   description: 'Niveau de maîtrise toi et ton équipe.' },
    { id: 'governance', icon: '🛡️', name: 'Gouvernance & politique', description: 'Règles, contrôle qualité, voix de marque.' },
  ],

  ARCHETYPES: [
    { id: 'pragmatist',      emoji: '🎯', name: 'Pragmatist',      identity: "Utilise l'IA là où elle aide concrètement. Pas de théâtre." },
    { id: 'power_user',      emoji: '⚡', name: 'Power User',       identity: "Construit ses propres workflows. Tire 5× de gain de temps de son stack." },
    { id: 'curious_skeptic', emoji: '🤔', name: 'Curious Skeptic',  identity: 'Essaie tout, ne fait confiance à rien aveuglément. Sain.' },
    { id: 'strategist',      emoji: '🧠', name: 'Strategist',       identity: "Pilote sur la gouvernance, le ROI et l'adoption d'équipe. Vue long terme." },
    { id: 'lagging_builder', emoji: '🛠️', name: 'Lagging Builder',  identity: 'En retard, mais rattrape activement. Course en cours.' },
    { id: 'shadow_operator', emoji: '🥷', name: 'Shadow Operator',  identity: "Utilise l'IA tous les jours. L'organisation n'en sait rien." },
  ],

  startBadge:        'Étape 1 sur 2 · ~30 secondes',
  startH1:           'Qui es-tu, et dans quel monde travailles-tu ?',
  startBody:         "Nous utilisons ces réponses pour comparer ton résultat au bon groupe de pairs. Rien n'est partagé sous ton nom. Uniquement de manière anonyme et agrégée dans le rapport.",
  startRoleLabel:    'Quel est ton rôle principal ?',
  startSeniorityLbl: 'Séniorité',
  startIndustryLbl:  'Secteur',
  startCompanySize:  "Taille d'entreprise",
  startRegionLbl:    'Région',
  startNameLbl:      'Ton prénom',
  startEmailLbl:     'Adresse e-mail (obligatoire — pour le lien de ton tableau de bord)',
  startConsentLbl:   "Oui, je souhaite recevoir occasionnellement des e-mails de Mark de Kock sur l'AI-benchmark, le rapport agrégé et les mises à jour pertinentes sur l'IA en marketing & vente. Je peux me désinscrire à tout moment.",
  startSubmit:       'Vers les questions →',
  startSubmitting:   'Un instant…',
  startError:        'Merci de remplir tous les champs obligatoires.',
  startBack:         '← Retour',

  qProgress:   'Question {n} sur {total}',
  qSubmit:     'Afficher mon tableau de bord →',
  qSubmitting: 'Calcul de ton résultat…',
  qBack:       '← Retour',
  qNext:       'Suivant →',
  qOtherLabel: 'Autre, à savoir…',

  ROLES: [
    { id: 'marketing', label: 'Marketing',  description: 'Contenu, demand gen, marque, web, lifecycle, ops.' },
    { id: 'sales',     label: 'Vente',      description: 'Prospection, AE/closing, CS, enablement.' },
    { id: 'hybrid',    label: 'Hybride',    description: 'RevOps, fondateur, lead GTM, full-funnel.' },
  ],
  SENIORITIES: [
    { id: 'ic',        label: 'IC / Spécialiste'     },
    { id: 'manager',   label: 'Manager'              },
    { id: 'director',  label: 'Directeur'            },
    { id: 'vp',        label: 'VP / C-level'         },
    { id: 'founder',   label: 'Fondateur / Owner'    },
  ],
  INDUSTRIES: [
    { id: 'saas',           label: 'SaaS / logiciel'              },
    { id: 'agency',         label: 'Agence / conseil'             },
    { id: 'ecommerce',      label: 'E-commerce / retail'          },
    { id: 'finance',        label: 'Finance / assurance'          },
    { id: 'healthcare',     label: 'Santé / sciences de la vie'   },
    { id: 'industry',       label: 'Industrie / production'       },
    { id: 'media',          label: 'Médias / édition'             },
    { id: 'education',      label: 'Éducation'                    },
    { id: 'public',         label: 'Secteur public / associatif'  },
    { id: 'other',          label: 'Autre'                        },
  ],
  COMPANY_SIZES: [
    { id: '1',           label: 'Solo (1)'           },
    { id: '2_10',        label: '2–10'               },
    { id: '11_50',       label: '11–50'              },
    { id: '51_200',      label: '51–200'             },
    { id: '201_1000',    label: '201–1 000'          },
    { id: '1001_plus',   label: '1 000+'             },
  ],
  REGIONS: [
    { id: 'nl',         label: 'Pays-Bas'             },
    { id: 'be',         label: 'Belgique'             },
    { id: 'lu',         label: 'Luxembourg'           },
    { id: 'de',         label: 'Allemagne'            },
    { id: 'eu_other',   label: "Reste de l'UE"        },
    { id: 'world',      label: "Hors UE"              },
  ],

  resultsBadge:      'Ton résultat AI-benchmark',
  resultsArchTitle:  'Ton archétype',
  resultsArchBody:   "Sur la base de tes réponses, tu corresponds à ce profil. Cela dit quelque chose de ta façon de travailler, pas de ta valeur en tant que professionnel.",
  resultsScoreLbl:   'AI Fluency Index',
  resultsDimsTitle:  'Score par dimension',
  resultsCompareTtl: 'Comment tu te compares',
  resultsCompareBody:"La comparaison par question avec ton groupe de pairs se débloque dès que nous avons au moins 30 répondants dans ton segment. Pour l'instant tu es l'un des premiers. Merci pour cela.",
  resultsShareTitle: 'Aide tes pairs à avancer aussi',
  resultsShareBody:  'Plus de personnes participent, plus le portrait devient net. Partage le benchmark avec des collègues curieux de savoir où ils en sont.',
  resultsCtaCalendly:'Échange en 1-à-1 avec Mark sur ton résultat',

  footerLine: 'Hébergé par Mark de Kock · markdekock.com',
  reportLine: 'Rapport agrégé : State of AI in Marketing & Sales 2026',

  liveVagueLabel: 'Groupe grandissant de professionnels',
}

// ════════════════════════════════════════════════════════════════════════════
// DE — Deutsch
// ════════════════════════════════════════════════════════════════════════════
const DE: LangContent = {
  navName:    'AI-benchmark',
  navTagline: 'für Marketing & Sales',
  navCta:     'Benchmark starten →',

  heroBadge:  'Unabhängige Studie · von Mark de Kock',
  heroH1a:    'Wie nutzt du KI in',
  heroH1b:    'Marketing & Sales — wirklich?',
  heroIntro:  'Wir nutzen immer mehr KI-Tools. Vom einfachen Chat-Account bis zu teuren Video-Editing- oder Sales-Funnel-Tools. Und jeden Tag kommt ein neues dazu. Wo investierst du deine Zeit, um sie zu lernen? Was, wenn deine Fachkollegen dir zeigen, was wirklich funktioniert?',
  heroSub:    'Vergleiche deine Arbeitsweise, deine Tools und deine Wirkung mit denen vieler anderer Marketing- und Sales-Profis. Teile deine Erkenntnisse und bekomme ein klares Bild des Marktes in einem übersichtlichen Dashboard.',
  heroCta1:   'Benchmark starten →',
  heroCta2:   'So funktioniert es',
  trustLine:  '18 Fragen · ~6 Minuten · Kostenlos · Persönliches Dashboard direkt nach dem Absenden',

  quoteLabel:  'Warum ich das mache',
  quoteBody:   "Ich glaube an die Stärke meiner Fachkollegen, die mir den Weg zu klügeren Entscheidungen bei der Nutzung von KI-Tools zeigen. Diese Erkenntnisse einzusammeln und direkt mit den Menschen zu teilen, die selbst dazu beitragen, scheint mir der beste Weg, um alle in einer der am schnellsten innovierenden Phasen meines Berufslebens weiterzubringen.",
  quoteAuthor: 'Mark de Kock',
  quoteRole:   'Marketing-Berater · markdekock.com',

  proofN:        '{n} Marketeers und Seller haben bereits teilgenommen',
  proofVague:    'Eine wachsende Gruppe Marketeers und Seller macht mit',
  proofSubtitle: 'Deine Antworten tragen zum größten unabhängigen Bild der KI-Nutzung in BeNeLux bei.',

  dimensionsLabel: '6 Dimensionen',
  dimensionsTitle: 'Worauf wir dich benchmarken',
  archetypesLabel: '6 Archetypen',
  archetypesTitle: 'Welcher Typ KI-Nutzer bist du?',
  shareLabel:      'Der Grund mitzumachen',
  shareTitle:      'Du bekommst keinen Score. Du bekommst Kontext.',
  shareBody:       'Ein Score von 73 ist eine Zahl. „Nur 19 % der Seller in deinem Segment nutzen Clay — und du schon" ist eine Identität. Das persönliche Dashboard zeigt pro Frage, wie du im Vergleich zu deinen Peers stehst, mit einem Filter zum Wechseln zwischen alle, nur Sales, deine Branche oder deine Unternehmensgröße.',

  DIMENSIONS: [
    { id: 'adoption',   icon: '🧭', name: 'Adoption',              description: 'Welche Tools du nutzt und wie oft.' },
    { id: 'workflow',   icon: '⚙️', name: 'Workflow-Integration', description: 'Lose Tabs oder im Stack eingebettet.' },
    { id: 'outcome',    icon: '📈', name: 'Outcome & ROI',         description: 'Zeitersparnis, Qualität, Conversion.' },
    { id: 'data',       icon: '📚', name: 'Daten-Bereitschaft',    description: 'CRM-Hygiene, ICP, Content-Bibliothek.' },
    { id: 'skill',      icon: '🎓', name: 'Skill & Vertrauen',     description: 'Können von dir und deinem Team.' },
    { id: 'governance', icon: '🛡️', name: 'Governance & Policy',  description: 'Richtlinien, Qualitätskontrolle, Brand Voice.' },
  ],

  ARCHETYPES: [
    { id: 'pragmatist',      emoji: '🎯', name: 'Pragmatist',      identity: 'Setzt KI dort ein, wo sie konkret hilft. Kein Theater.' },
    { id: 'power_user',      emoji: '⚡', name: 'Power User',       identity: 'Baut eigene Workflows und holt 5× Zeitersparnis aus dem Stack.' },
    { id: 'curious_skeptic', emoji: '🤔', name: 'Curious Skeptic',  identity: 'Probiert alles aus, vertraut nichts blind. Gesund.' },
    { id: 'strategist',      emoji: '🧠', name: 'Strategist',       identity: 'Steuert auf Governance, ROI und Team-Adoption. Lange Linie.' },
    { id: 'lagging_builder', emoji: '🛠️', name: 'Lagging Builder',  identity: 'Hinterher, baut aber jetzt aktiv auf. Aufholjagd läuft.' },
    { id: 'shadow_operator', emoji: '🥷', name: 'Shadow Operator',  identity: 'Nutzt KI täglich. Die Organisation weiß von nichts.' },
  ],

  startBadge:        'Schritt 1 von 2 · ~30 Sekunden',
  startH1:           'Wer bist du, und in welcher Welt arbeitest du?',
  startBody:         "Wir nutzen diese Antworten, um dein Ergebnis mit der richtigen Peer-Gruppe zu vergleichen. Nichts wird unter deinem Namen geteilt. Nur anonym und aggregiert im Bericht.",
  startRoleLabel:    'Was ist deine Hauptrolle?',
  startSeniorityLbl: 'Seniorität',
  startIndustryLbl:  'Branche',
  startCompanySize:  'Unternehmensgröße',
  startRegionLbl:    'Region',
  startNameLbl:      'Dein Name',
  startEmailLbl:     'E-Mail-Adresse (Pflicht — für deinen Dashboard-Link)',
  startConsentLbl:   'Ja, ich möchte gelegentlich E-Mails von Mark de Kock zur AI-benchmark, dem aggregierten Bericht und relevanten Updates zu KI in Marketing & Sales erhalten. Ich kann mich jederzeit abmelden.',
  startSubmit:       'Zu den Fragen →',
  startSubmitting:   'Einen Moment…',
  startError:        'Bitte fülle alle Pflichtfelder aus.',
  startBack:         '← Zurück',

  qProgress:   'Frage {n} von {total}',
  qSubmit:     'Mein Dashboard anzeigen →',
  qSubmitting: 'Dein Ergebnis wird berechnet…',
  qBack:       '← Zurück',
  qNext:       'Weiter →',
  qOtherLabel: 'Sonstiges, nämlich…',

  ROLES: [
    { id: 'marketing', label: 'Marketing',  description: 'Content, Demand Gen, Brand, Web, Lifecycle, Ops.' },
    { id: 'sales',     label: 'Sales',      description: 'Prospecting, AE/Closing, CS, Enablement.' },
    { id: 'hybrid',    label: 'Hybrid',     description: 'RevOps, Founder, GTM-Lead, Full-Funnel.' },
  ],
  SENIORITIES: [
    { id: 'ic',        label: 'IC / Spezialist'      },
    { id: 'manager',   label: 'Manager'              },
    { id: 'director',  label: 'Director'             },
    { id: 'vp',        label: 'VP / C-Level'         },
    { id: 'founder',   label: 'Founder / Inhaber'    },
  ],
  INDUSTRIES: [
    { id: 'saas',           label: 'SaaS / Software'              },
    { id: 'agency',         label: 'Agentur / Beratung'           },
    { id: 'ecommerce',      label: 'E-Commerce / Retail'          },
    { id: 'finance',        label: 'Finanzen / Versicherung'      },
    { id: 'healthcare',     label: 'Healthcare / Life Sciences'   },
    { id: 'industry',       label: 'Industrie / Produktion'       },
    { id: 'media',          label: 'Medien / Publishing'          },
    { id: 'education',      label: 'Bildung'                      },
    { id: 'public',         label: 'Öffentlicher Sektor / NGO'    },
    { id: 'other',          label: 'Sonstiges'                    },
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
    { id: 'nl',         label: 'Niederlande'          },
    { id: 'be',         label: 'Belgien'              },
    { id: 'lu',         label: 'Luxemburg'            },
    { id: 'de',         label: 'Deutschland'          },
    { id: 'eu_other',   label: 'Restliche EU'         },
    { id: 'world',      label: 'Außerhalb der EU'     },
  ],

  resultsBadge:      'Dein AI-benchmark Ergebnis',
  resultsArchTitle:  'Dein Archetyp',
  resultsArchBody:   "Aufgrund deiner Antworten passt du in dieses Profil. Es sagt etwas über deine Arbeitsweise aus, nicht über deinen Wert als Professional.",
  resultsScoreLbl:   'AI Fluency Index',
  resultsDimsTitle:  'Score pro Dimension',
  resultsCompareTtl: 'Wie du im Vergleich stehst',
  resultsCompareBody:"Der Vergleich pro Frage mit deiner Peer-Gruppe wird freigeschaltet, sobald wir mindestens 30 Befragte in deinem Segment haben. Aktuell bist du einer der Ersten. Danke dafür.",
  resultsShareTitle: 'Hilf deinen Fachkollegen ebenfalls weiter',
  resultsShareBody:  'Je mehr Menschen teilnehmen, desto schärfer wird das Bild. Teile den Benchmark mit Kollegen, die auch wissen wollen, wo sie stehen.',
  resultsCtaCalendly:'1-zu-1 mit Mark über dein Ergebnis sprechen',

  footerLine: 'Gehostet von Mark de Kock · markdekock.com',
  reportLine: 'Aggregierter Bericht: State of AI in Marketing & Sales 2026',

  liveVagueLabel: 'Wachsende Gruppe Professionals',
}

export const CONTENT: Record<Lang, LangContent> = { nl: NL, en: EN, fr: FR, de: DE }

export function getContent(lang: Lang): LangContent {
  return CONTENT[lang] ?? NL
}

// ════════════════════════════════════════════════════════════════════════════
// Question structures (language-agnostic)
// ════════════════════════════════════════════════════════════════════════════

const SHARED_CORE_BASE: QuestionStructure[] = [
  { id: 'q1',  type: 'multiselect', dimension: 'adoption',   saturation: 3,
    options: [
      { id: 'chatgpt' }, { id: 'claude' }, { id: 'gemini' }, { id: 'copilot' },
      { id: 'perplexity' }, { id: 'mistral' }, { id: 'grok' }, { id: 'none' },
    ] },
  { id: 'q2',  type: 'multiselect', dimension: 'adoption',   saturation: 4, hasOther: true,
    options: [
      { id: 'notion_ai' }, { id: 'jasper' }, { id: 'copyai' }, { id: 'writer' },
      { id: 'surfer' }, { id: 'canva_magic' }, { id: 'midjourney' }, { id: 'firefly' },
      { id: 'descript' }, { id: 'synthesia' }, { id: 'clay' }, { id: 'apollo' },
      { id: 'lavender' }, { id: 'gong' }, { id: 'outreach' }, { id: 'salesloft' },
      { id: 'hubspot_ai' }, { id: 'einstein' }, { id: 'zapier_ai' }, { id: 'fathom' },
      { id: 'none' },
    ] },
  { id: 'q3',  type: 'frequency',   dimension: 'adoption',
    options: [{ id: 'never' }, { id: 'monthly' }, { id: 'weekly' }, { id: 'daily' }, { id: 'multi_day' }] },
  { id: 'q4',  type: 'multiselect', dimension: 'workflow',   saturation: 4,
    options: [
      { id: 'research' }, { id: 'draft' }, { id: 'finalize' }, { id: 'summarize' },
      { id: 'translate' }, { id: 'imagery' }, { id: 'analytics' }, { id: 'code' },
      { id: 'ideation' }, { id: 'customer' }, { id: 'none' },
    ] },
  { id: 'q5',  type: 'multiselect', dimension: 'workflow',
    options: [
      { id: 'standalone', weight: 1 }, { id: 'integrated', weight: 2 },
      { id: 'custom_gpt', weight: 3 }, { id: 'agents', weight: 4 }, { id: 'in_house', weight: 4 },
    ] },
  { id: 'q6',  type: 'frequency',   dimension: 'outcome',
    options: [{ id: 'lt1' }, { id: '1_3' }, { id: '4_8' }, { id: '8_15' }, { id: '15p' }] },
  { id: 'q7',  type: 'multiselect', dimension: 'outcome',    saturation: 3,
    options: [
      { id: 'output' }, { id: 'quality' }, { id: 'speed' }, { id: 'conversion' },
      { id: 'cost' }, { id: 'insights' }, { id: 'none' },
    ] },
  { id: 'q8',  type: 'weighted_mc', dimension: 'data',
    options: [
      { id: 'chaos', weight: 0 }, { id: 'mediocre', weight: 1 }, { id: 'workable', weight: 2 },
      { id: 'tidy', weight: 3 }, { id: 'sot', weight: 4 },
    ] },
  { id: 'q9',  type: 'multiselect', dimension: 'data',       saturation: 3,
    options: [
      { id: 'icp' }, { id: 'voice' }, { id: 'library' }, { id: 'playbooks' },
      { id: 'positioning' }, { id: 'cases' }, { id: 'none' },
    ] },
  { id: 'q10', type: 'matrix',      dimension: 'skill',
    rowIds: ['m12', 'm6', 'm3'],
    options: [
      { id: 'never', weight: 0 }, { id: 'beginner', weight: 1 }, { id: 'comfortable', weight: 2 },
      { id: 'experienced', weight: 3 }, { id: 'expert', weight: 4 },
    ] },
  { id: 'q11', type: 'weighted_mc', dimension: 'skill',
    options: [
      { id: 'no', weight: 0 }, { id: 'informal', weight: 1 }, { id: 'one_off', weight: 2 },
      { id: 'ongoing', weight: 3 }, { id: 'continuous', weight: 4 },
    ] },
  { id: 'q12', type: 'weighted_mc', dimension: 'governance',
    options: [
      { id: 'cp', weight: 0 }, { id: 'light', weight: 1 }, { id: 'strict', weight: 2 },
      { id: 'editor', weight: 3 }, { id: 'kpi', weight: 4 },
    ] },
  { id: 'q13', type: 'weighted_mc', dimension: 'governance',
    options: [
      { id: 'none', weight: 0 }, { id: 'informal', weight: 1 }, { id: 'wip', weight: 2 },
      { id: 'policy', weight: 3 }, { id: 'enforced', weight: 4 },
    ] },
]

const ROLE_MARKETING_BASE: QuestionStructure[] = [
  { id: 'q14m', type: 'weighted_mc', dimension: 'outcome',
    options: [
      { id: 'none', weight: 0 }, { id: 'slight', weight: 1 }, { id: 'double', weight: 3 },
      { id: 'triple', weight: 4 }, { id: 'quality', weight: 3 },
    ] },
  { id: 'q15m', type: 'multiselect', dimension: 'adoption', saturation: 3, hasOther: true,
    options: [
      { id: 'copy' }, { id: 'seo' }, { id: 'email' }, { id: 'social' }, { id: 'ads' },
      { id: 'personalization' }, { id: 'analytics' }, { id: 'attribution' },
      { id: 'imagery' }, { id: 'none' },
    ] },
  { id: 'q16m', type: 'frequency',  dimension: 'workflow',
    options: [{ id: 'p0' }, { id: 'p25' }, { id: 'p50' }, { id: 'p75' }, { id: 'p100' }] },
]

const ROLE_SALES_BASE: QuestionStructure[] = [
  { id: 'q14s', type: 'multiselect', dimension: 'adoption', saturation: 3,
    options: [
      { id: 'research' }, { id: 'outreach' }, { id: 'coaching' }, { id: 'notes' },
      { id: 'objection' }, { id: 'proposal' }, { id: 'forecast' }, { id: 'pipeline' },
      { id: 'none' },
    ] },
  { id: 'q15s', type: 'frequency',  dimension: 'workflow',
    options: [{ id: 'p0' }, { id: 'p25' }, { id: 'p50' }, { id: 'p75' }, { id: 'p100' }] },
  { id: 'q16s', type: 'multiselect', dimension: 'workflow', saturation: 3,
    options: [
      { id: 'prep' }, { id: 'live' }, { id: 'summary' }, { id: 'followup' },
      { id: 'next' }, { id: 'object' }, { id: 'none' },
    ] },
]

const ROLE_HYBRID_BASE: QuestionStructure[] = [
  { id: 'q14h', type: 'multiselect', dimension: 'adoption', saturation: 3,
    options: [
      { id: 'enrichment' }, { id: 'scoring' }, { id: 'outreach' }, { id: 'reporting' },
      { id: 'forecast' }, { id: 'crm' }, { id: 'content' }, { id: 'onboard' },
      { id: 'none' },
    ] },
  { id: 'q15h', type: 'weighted_mc', dimension: 'governance',
    options: [
      { id: 'adhoc', weight: 0 }, { id: 'silo', weight: 1 }, { id: 'guidelines', weight: 2 },
      { id: 'tiger', weight: 3 }, { id: 'roadmap', weight: 4 },
    ] },
  { id: 'q16h', type: 'multiselect', dimension: 'outcome', saturation: 3,
    options: [
      { id: 'cac' }, { id: 'velocity' }, { id: 'content' }, { id: 'retention' },
      { id: 'productivity' }, { id: 'none' },
    ] },
]

const SENTIMENT_BASE: QuestionStructure[] = [
  { id: 'q17', type: 'multiselect', dimension: 'sentiment', saturation: 1,
    options: [
      { id: 'time' }, { id: 'strategy' }, { id: 'data' }, { id: 'compliance' },
      { id: 'skill' }, { id: 'leadership' }, { id: 'budget' }, { id: 'none' },
    ] },
  { id: 'q18', type: 'likert', dimension: 'sentiment',
    options: [
      { id: 'block', weight: 0 }, { id: 'passive', weight: 1 }, { id: 'curious', weight: 2 },
      { id: 'driver', weight: 3 }, { id: 'roadmap', weight: 4 },
    ] },
]

// ════════════════════════════════════════════════════════════════════════════
// Per-language question text + option labels + matrix row labels
// ════════════════════════════════════════════════════════════════════════════

type QuestionTranslations = Record<string, QuestionStrings>

const Q_NL: QuestionTranslations = {
  q1: { text: 'Welke AI-assistenten gebruik je minstens wekelijks?',
        options: { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', copilot: 'Copilot (M365/GitHub)', perplexity: 'Perplexity', mistral: 'Mistral / Le Chat', grok: 'Grok', none: 'Nog geen' } },
  q2: { text: 'Welke gespecialiseerde AI-tools zitten in jouw marketing- of sales-stack?',
        options: { notion_ai: 'Notion AI', jasper: 'Jasper', copyai: 'Copy.ai', writer: 'Writer', surfer: 'Surfer SEO', canva_magic: 'Canva Magic Studio', midjourney: 'Midjourney', firefly: 'Adobe Firefly', descript: 'Descript', synthesia: 'Synthesia', clay: 'Clay', apollo: 'Apollo', lavender: 'Lavender', gong: 'Gong', outreach: 'Outreach', salesloft: 'Salesloft', hubspot_ai: 'HubSpot AI (Breeze)', einstein: 'Salesforce Einstein', zapier_ai: 'Zapier AI / Agents', fathom: 'Fathom / Granola / Otter', none: 'Geen / niets' } },
  q3: { text: 'Hoe vaak zet je AI in voor je werk?',
        options: { never: 'Nooit', monthly: 'Maandelijks', weekly: 'Wekelijks', daily: 'Dagelijks', multi_day: 'Meerdere keren per dag' } },
  q4: { text: 'Waar gebruik je AI vandaag voor?', hint: 'Kies wat geldt.',
        options: { research: 'Research', draft: 'Schrijven (concept)', finalize: 'Schrijven (eindversie)', summarize: 'Samenvatten', translate: 'Vertalen', imagery: 'Beeld / video', analytics: 'Data-analyse', code: 'Code / formules', ideation: 'Ideation / brainstorm', customer: 'Klant- of leadcontact', none: 'Niets van bovenstaande' } },
  q5: { text: 'Hoe zit AI in je workflow?', hint: 'Meerdere antwoorden mogelijk. Kies wat geldt.',
        options: { standalone: 'Losstaande tools / browser-tabs', integrated: 'Geïntegreerd in CRM / CMS / inbox', custom_gpt: 'Eigen prompts of GPTs', agents: 'Agents / workflows die zelfstandig stappen doen', in_house: 'Custom in-house build' } },
  q6: { text: 'Hoeveel tijd bespaar je per week dankzij AI?',
        options: { lt1: 'Minder dan 1 uur', '1_3': '1–3 uur', '4_8': '4–8 uur', '8_15': '8–15 uur', '15p': '15+ uur' } },
  q7: { text: 'Welke meetbare resultaten zie je al?',
        options: { output: 'Meer output', quality: 'Hogere kwaliteit', speed: 'Snellere doorlooptijd', conversion: 'Hogere conversie', cost: 'Lagere kosten', insights: 'Nieuwe inzichten uit data', none: 'Nog niet meetbaar' } },
  q8: { text: 'Hoe zou je de hygiëne van je CRM/data beschrijven?',
        options: { chaos: 'Chaos', mediocre: 'Matig', workable: 'Werkbaar', tidy: 'Netjes', sot: 'Single source of truth' } },
  q9: { text: 'Wat heb je gedocumenteerd dat AI kan gebruiken?', hint: 'Documenten of kennis die AI als context kan inzetten.',
        options: { icp: "ICP / persona's", voice: 'Brand voice / tone', library: 'Content library', playbooks: 'Sales playbooks', positioning: 'Productpositionering', cases: 'Casestudy-bibliotheek', none: 'Niets gedocumenteerd' } },
  q10: { text: 'Hoe vaardig was je met AI op deze momenten?', hint: 'Geef per moment je inschatting. Zo zien we hoe je trajectorie loopt.',
        options: { never: 'Niet / nooit gebruikt', beginner: 'Beginner', comfortable: 'Comfortabel', experienced: 'Ervaren', expert: 'Expert' },
        rows: { m12: '12 maanden geleden', m6: '6 maanden geleden', m3: '3 maanden geleden' } },
  q11: { text: 'Heeft je team gestructureerde AI-training gehad?',
        options: { no: 'Nee', informal: 'Informeel (kennisdeling intern)', one_off: 'Eenmalige workshop', ongoing: 'Doorlopend programma', continuous: 'Continue learning loop met meetpunten' } },
  q12: { text: 'Hoe ga je om met output van AI?',
        options: { cp: 'Copy-paste', light: 'Lichte review', strict: 'Strenge review', editor: 'AI als startpunt, mens als eindredacteur', kpi: "Gevalideerd via meetbare KPI's" } },
  q13: { text: 'Zijn er duidelijke richtlijnen voor AI-gebruik in je organisatie?',
        options: { none: 'Geen', informal: 'Informele afspraken', wip: 'In ontwikkeling', policy: 'Bestaat als beleid', enforced: 'Wordt actief gehandhaafd' } },
  q14m: { text: 'Hoe heeft AI je content-output veranderd?',
        options: { none: 'Geen verschil', slight: 'Iets meer', double: '~2× zoveel', triple: '3×+', quality: 'Kwaliteit i.p.v. kwantiteit' } },
  q15m: { text: 'Welke marketing-taken doe je nu met AI?',
        options: { copy: 'Copywriting', seo: 'SEO research', email: 'E-mail campaigns', social: 'Social posts', ads: 'Ad creatives', personalization: 'Personalisatie', analytics: 'Analytics / rapportage', attribution: 'Attributie', imagery: 'Beeld / video', none: 'Geen' } },
  q16m: { text: 'Welk deel van je creatieve werk begint nu met AI?', hint: 'Denk aan drafts, ideeën en eerste versies, voordat jij of je team het verder uitwerkt.',
        options: { p0: '0%', p25: '<25%', p50: '25–50%', p75: '50–75%', p100: '75%+' } },
  q14s: { text: 'Welke sales-taken doe je met AI?',
        options: { research: 'Prospect research', outreach: 'Outreach personalisatie', coaching: 'Call coaching', notes: 'Dealnotities', objection: 'Objection prep', proposal: 'Proposals', forecast: 'Forecasting', pipeline: 'Pipeline hygiene', none: 'Geen' } },
  q15s: { text: 'Welk percentage van je outbound is AI-ondersteund?',
        options: { p0: '0%', p25: '<25%', p50: '25–50%', p75: '50–75%', p100: '75%+' } },
  q16s: { text: 'Hoe gebruik je AI rond een sales-gesprek?',
        options: { prep: 'Voorbereiding (account research)', live: 'Live notes', summary: 'Samenvatting achteraf', followup: 'Follow-up draft', next: 'Next-step suggesties', object: 'Objection coaching', none: 'Niets' } },
  q14h: { text: 'Welke processen heb je het sterkst geautomatiseerd met AI?',
        options: { enrichment: 'Lead enrichment', scoring: 'Lead scoring', outreach: 'Outreach', reporting: 'Reporting', forecast: 'Forecasting', crm: 'CRM hygiene', content: 'Content productie', onboard: 'Onboarding', none: 'Niets' } },
  q15h: { text: 'Hoe bestuur je AI-experimenten over teams heen?',
        options: { adhoc: 'Ad-hoc', silo: 'Per team eigen koers', guidelines: 'Centrale guidelines', tiger: 'Werkgroep / tiger team', roadmap: "AI-roadmap met KPI's" } },
  q16h: { text: 'Waar levert AI de meeste meetbare ROI op in je organisatie?',
        options: { cac: 'Acquisitiekosten', velocity: 'Pipeline velocity', content: 'Content-output', retention: 'Klantretentie', productivity: 'Personeelsproductiviteit', none: 'Nog niet meetbaar' } },
  q17: { text: 'Welke blokkades houden meer AI-gebruik tegen (in je werk of team)?', hint: 'Meerdere antwoorden mogelijk.',
        options: { time: 'Geen tijd', strategy: 'Geen strategie', data: 'Data niet op orde', compliance: 'Privacy / compliance', skill: 'Vaardigheden', leadership: 'Leiderschap niet aan boord', budget: 'Geen budget', none: 'Geen blokkade' } },
  q18: { text: 'Hoe staat leiderschap in jouw organisatie tegenover AI?',
        options: { block: 'Actieve rem', passive: 'Passief', curious: 'Nieuwsgierig', driver: 'Aanjager', roadmap: 'Eigen roadmap' } },
}

const Q_EN: QuestionTranslations = {
  q1: { text: 'Which AI assistants do you use at least weekly?',
        options: { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', copilot: 'Copilot (M365/GitHub)', perplexity: 'Perplexity', mistral: 'Mistral / Le Chat', grok: 'Grok', none: 'None yet' } },
  q2: { text: 'Which specialised AI tools are in your marketing or sales stack?',
        options: { notion_ai: 'Notion AI', jasper: 'Jasper', copyai: 'Copy.ai', writer: 'Writer', surfer: 'Surfer SEO', canva_magic: 'Canva Magic Studio', midjourney: 'Midjourney', firefly: 'Adobe Firefly', descript: 'Descript', synthesia: 'Synthesia', clay: 'Clay', apollo: 'Apollo', lavender: 'Lavender', gong: 'Gong', outreach: 'Outreach', salesloft: 'Salesloft', hubspot_ai: 'HubSpot AI (Breeze)', einstein: 'Salesforce Einstein', zapier_ai: 'Zapier AI / Agents', fathom: 'Fathom / Granola / Otter', none: 'None / nothing' } },
  q3: { text: 'How often do you use AI in your work?',
        options: { never: 'Never', monthly: 'Monthly', weekly: 'Weekly', daily: 'Daily', multi_day: 'Multiple times a day' } },
  q4: { text: 'What do you use AI for today?', hint: 'Pick what applies.',
        options: { research: 'Research', draft: 'Writing (drafts)', finalize: 'Writing (final version)', summarize: 'Summarising', translate: 'Translating', imagery: 'Imagery / video', analytics: 'Data analysis', code: 'Code / formulas', ideation: 'Ideation / brainstorm', customer: 'Customer or lead contact', none: 'None of the above' } },
  q5: { text: 'How is AI embedded in your workflow?', hint: 'Multiple answers possible. Pick what applies.',
        options: { standalone: 'Standalone tools / browser tabs', integrated: 'Integrated into CRM / CMS / inbox', custom_gpt: 'Own prompts or GPTs', agents: 'Agents / workflows that act on their own', in_house: 'Custom in-house build' } },
  q6: { text: 'How much time per week do you save thanks to AI?',
        options: { lt1: 'Less than 1 hour', '1_3': '1–3 hours', '4_8': '4–8 hours', '8_15': '8–15 hours', '15p': '15+ hours' } },
  q7: { text: 'Which measurable results are you already seeing?',
        options: { output: 'More output', quality: 'Higher quality', speed: 'Faster turnaround', conversion: 'Higher conversion', cost: 'Lower cost', insights: 'New insights from data', none: 'Not yet measurable' } },
  q8: { text: 'How would you describe the hygiene of your CRM/data?',
        options: { chaos: 'Chaos', mediocre: 'Mediocre', workable: 'Workable', tidy: 'Tidy', sot: 'Single source of truth' } },
  q9: { text: 'What have you documented that AI can use?', hint: 'Documents or knowledge AI can use as context.',
        options: { icp: 'ICP / personas', voice: 'Brand voice / tone', library: 'Content library', playbooks: 'Sales playbooks', positioning: 'Product positioning', cases: 'Case-study library', none: 'Nothing documented' } },
  q10: { text: 'How skilled were you with AI at these moments?', hint: 'Give your estimate per moment so we can see your trajectory.',
        options: { never: 'Never used', beginner: 'Beginner', comfortable: 'Comfortable', experienced: 'Experienced', expert: 'Expert' },
        rows: { m12: '12 months ago', m6: '6 months ago', m3: '3 months ago' } },
  q11: { text: 'Has your team had structured AI training?',
        options: { no: 'No', informal: 'Informal (internal sharing)', one_off: 'One-off workshop', ongoing: 'Ongoing programme', continuous: 'Continuous learning loop with metrics' } },
  q12: { text: 'How do you handle AI output?',
        options: { cp: 'Copy-paste', light: 'Light review', strict: 'Strict review', editor: 'AI as starting point, human as final editor', kpi: 'Validated via measurable KPIs' } },
  q13: { text: 'Are there clear guidelines for AI use in your organisation?',
        options: { none: 'None', informal: 'Informal agreements', wip: 'In progress', policy: 'Exists as policy', enforced: 'Actively enforced' } },
  q14m: { text: 'How has AI changed your content output?',
        options: { none: 'No difference', slight: 'A bit more', double: '~2× as much', triple: '3×+', quality: 'Quality instead of quantity' } },
  q15m: { text: 'Which marketing tasks do you now do with AI?',
        options: { copy: 'Copywriting', seo: 'SEO research', email: 'Email campaigns', social: 'Social posts', ads: 'Ad creatives', personalization: 'Personalisation', analytics: 'Analytics / reporting', attribution: 'Attribution', imagery: 'Imagery / video', none: 'None' } },
  q16m: { text: 'What share of your creative work now starts in AI?', hint: 'Drafts, ideas, first versions — before you or your team take it further.',
        options: { p0: '0%', p25: '<25%', p50: '25–50%', p75: '50–75%', p100: '75%+' } },
  q14s: { text: 'Which sales tasks do you do with AI?',
        options: { research: 'Prospect research', outreach: 'Outreach personalisation', coaching: 'Call coaching', notes: 'Deal notes', objection: 'Objection prep', proposal: 'Proposals', forecast: 'Forecasting', pipeline: 'Pipeline hygiene', none: 'None' } },
  q15s: { text: 'What percentage of your outbound is AI-assisted?',
        options: { p0: '0%', p25: '<25%', p50: '25–50%', p75: '50–75%', p100: '75%+' } },
  q16s: { text: 'How do you use AI around a sales call?',
        options: { prep: 'Preparation (account research)', live: 'Live notes', summary: 'Summary afterwards', followup: 'Follow-up draft', next: 'Next-step suggestions', object: 'Objection coaching', none: 'None' } },
  q14h: { text: 'Which processes have you most strongly automated with AI?',
        options: { enrichment: 'Lead enrichment', scoring: 'Lead scoring', outreach: 'Outreach', reporting: 'Reporting', forecast: 'Forecasting', crm: 'CRM hygiene', content: 'Content production', onboard: 'Onboarding', none: 'None' } },
  q15h: { text: 'How do you govern AI experiments across teams?',
        options: { adhoc: 'Ad-hoc', silo: 'Each team its own course', guidelines: 'Central guidelines', tiger: 'Working group / tiger team', roadmap: 'AI roadmap with KPIs' } },
  q16h: { text: 'Where does AI deliver the most measurable ROI in your organisation?',
        options: { cac: 'Acquisition cost', velocity: 'Pipeline velocity', content: 'Content output', retention: 'Customer retention', productivity: 'Staff productivity', none: 'Not yet measurable' } },
  q17: { text: 'Which blockers hold back more AI use (in your work or team)?', hint: 'Multiple answers possible.',
        options: { time: 'No time', strategy: 'No strategy', data: 'Data not in order', compliance: 'Privacy / compliance', skill: 'Skills', leadership: 'Leadership not on board', budget: 'No budget', none: 'No blockers' } },
  q18: { text: 'How does leadership in your organisation feel about AI?',
        options: { block: 'Actively blocking', passive: 'Passive', curious: 'Curious', driver: 'Driver', roadmap: 'Has its own roadmap' } },
}

const Q_FR: QuestionTranslations = {
  q1: { text: "Quels assistants IA utilises-tu au moins une fois par semaine ?",
        options: { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', copilot: 'Copilot (M365/GitHub)', perplexity: 'Perplexity', mistral: 'Mistral / Le Chat', grok: 'Grok', none: 'Aucun pour le moment' } },
  q2: { text: 'Quels outils IA spécialisés font partie de ton stack marketing ou ventes ?',
        options: { notion_ai: 'Notion AI', jasper: 'Jasper', copyai: 'Copy.ai', writer: 'Writer', surfer: 'Surfer SEO', canva_magic: 'Canva Magic Studio', midjourney: 'Midjourney', firefly: 'Adobe Firefly', descript: 'Descript', synthesia: 'Synthesia', clay: 'Clay', apollo: 'Apollo', lavender: 'Lavender', gong: 'Gong', outreach: 'Outreach', salesloft: 'Salesloft', hubspot_ai: 'HubSpot AI (Breeze)', einstein: 'Salesforce Einstein', zapier_ai: 'Zapier AI / Agents', fathom: 'Fathom / Granola / Otter', none: 'Aucun / rien' } },
  q3: { text: 'À quelle fréquence utilises-tu l’IA dans ton travail ?',
        options: { never: 'Jamais', monthly: 'Mensuellement', weekly: 'Hebdomadairement', daily: 'Quotidiennement', multi_day: 'Plusieurs fois par jour' } },
  q4: { text: 'Pour quoi utilises-tu l’IA aujourd’hui ?', hint: 'Coche ce qui s’applique.',
        options: { research: 'Recherche', draft: 'Rédaction (brouillons)', finalize: 'Rédaction (version finale)', summarize: 'Résumés', translate: 'Traduction', imagery: 'Image / vidéo', analytics: 'Analyse de données', code: 'Code / formules', ideation: 'Idéation / brainstorming', customer: 'Contact client ou lead', none: 'Rien de ce qui précède' } },
  q5: { text: 'Comment l’IA est-elle intégrée à ton workflow ?', hint: 'Plusieurs réponses possibles. Coche ce qui s’applique.',
        options: { standalone: 'Outils séparés / onglets', integrated: 'Intégré au CRM / CMS / inbox', custom_gpt: 'Prompts ou GPT personnalisés', agents: 'Agents / workflows autonomes', in_house: 'Build interne sur mesure' } },
  q6: { text: 'Combien de temps économises-tu par semaine grâce à l’IA ?',
        options: { lt1: 'Moins d’1 heure', '1_3': '1–3 heures', '4_8': '4–8 heures', '8_15': '8–15 heures', '15p': '15+ heures' } },
  q7: { text: 'Quels résultats mesurables observes-tu déjà ?',
        options: { output: 'Plus de production', quality: 'Qualité supérieure', speed: 'Délais plus courts', conversion: 'Conversion plus élevée', cost: 'Coûts réduits', insights: 'Nouveaux insights tirés des données', none: 'Pas encore mesurable' } },
  q8: { text: 'Comment décrirais-tu l’hygiène de ton CRM / tes données ?',
        options: { chaos: 'Chaos', mediocre: 'Médiocre', workable: 'Acceptable', tidy: 'Propre', sot: 'Source unique de vérité' } },
  q9: { text: 'Qu’as-tu documenté que l’IA peut utiliser ?', hint: 'Documents ou connaissances exploitables comme contexte par l’IA.',
        options: { icp: 'ICP / personas', voice: 'Voix de marque / ton', library: 'Bibliothèque de contenu', playbooks: 'Playbooks de vente', positioning: 'Positionnement produit', cases: 'Bibliothèque de case studies', none: 'Rien de documenté' } },
  q10: { text: 'À quel point étais-tu compétent avec l’IA à ces moments ?', hint: 'Donne ton estimation à chaque moment pour tracer ta trajectoire.',
        options: { never: 'Jamais utilisé', beginner: 'Débutant', comfortable: 'À l’aise', experienced: 'Expérimenté', expert: 'Expert' },
        rows: { m12: 'Il y a 12 mois', m6: 'Il y a 6 mois', m3: 'Il y a 3 mois' } },
  q11: { text: 'Ton équipe a-t-elle suivi une formation IA structurée ?',
        options: { no: 'Non', informal: 'Informellement (partage interne)', one_off: 'Atelier ponctuel', ongoing: 'Programme continu', continuous: 'Boucle d’apprentissage continue avec métriques' } },
  q12: { text: 'Comment gères-tu les sorties de l’IA ?',
        options: { cp: 'Copier-coller', light: 'Relecture légère', strict: 'Relecture stricte', editor: 'IA comme point de départ, humain comme rédacteur final', kpi: 'Validé via KPIs mesurables' } },
  q13: { text: 'Y a-t-il des règles claires pour l’usage de l’IA dans ton organisation ?',
        options: { none: 'Aucune', informal: 'Accords informels', wip: 'En cours d’élaboration', policy: 'Existe en tant que politique', enforced: 'Activement appliquée' } },
  q14m: { text: 'Comment l’IA a-t-elle changé ta production de contenu ?',
        options: { none: 'Aucune différence', slight: 'Un peu plus', double: '~2× plus', triple: '3×+', quality: 'Qualité au lieu de quantité' } },
  q15m: { text: 'Quelles tâches marketing fais-tu maintenant avec l’IA ?',
        options: { copy: 'Copywriting', seo: 'Recherche SEO', email: 'Campagnes e-mail', social: 'Posts sociaux', ads: 'Créations publicitaires', personalization: 'Personnalisation', analytics: 'Analytics / reporting', attribution: 'Attribution', imagery: 'Image / vidéo', none: 'Aucune' } },
  q16m: { text: 'Quelle part de ton travail créatif commence maintenant avec l’IA ?', hint: 'Brouillons, idées, premières versions, avant que toi ou ton équipe ne reprenniez la main.',
        options: { p0: '0%', p25: '<25%', p50: '25–50%', p75: '50–75%', p100: '75%+' } },
  q14s: { text: 'Quelles tâches de vente fais-tu avec l’IA ?',
        options: { research: 'Prospect research', outreach: 'Personnalisation outbound', coaching: 'Call coaching', notes: 'Notes de deal', objection: 'Préparation aux objections', proposal: 'Propositions', forecast: 'Forecasting', pipeline: 'Hygiène du pipeline', none: 'Aucune' } },
  q15s: { text: 'Quel pourcentage de ton outbound est assisté par l’IA ?',
        options: { p0: '0%', p25: '<25%', p50: '25–50%', p75: '50–75%', p100: '75%+' } },
  q16s: { text: 'Comment utilises-tu l’IA autour d’un appel de vente ?',
        options: { prep: 'Préparation (account research)', live: 'Notes en direct', summary: 'Résumé après l’appel', followup: 'Brouillon de suivi', next: 'Suggestions de prochaine étape', object: 'Coaching sur objections', none: 'Rien' } },
  q14h: { text: 'Quels processus as-tu le plus fortement automatisés avec l’IA ?',
        options: { enrichment: 'Enrichissement de leads', scoring: 'Scoring de leads', outreach: 'Outreach', reporting: 'Reporting', forecast: 'Forecasting', crm: 'Hygiène CRM', content: 'Production de contenu', onboard: 'Onboarding', none: 'Rien' } },
  q15h: { text: 'Comment gouvernes-tu les expériences IA entre équipes ?',
        options: { adhoc: 'Ad-hoc', silo: 'Chaque équipe sa propre voie', guidelines: 'Guidelines centrales', tiger: 'Groupe de travail / tiger team', roadmap: 'Roadmap IA avec KPIs' } },
  q16h: { text: 'Où l’IA délivre-t-elle le plus de ROI mesurable dans ton organisation ?',
        options: { cac: 'Coût d’acquisition', velocity: 'Vélocité du pipeline', content: 'Production de contenu', retention: 'Rétention client', productivity: 'Productivité du personnel', none: 'Pas encore mesurable' } },
  q17: { text: 'Quels obstacles freinent une utilisation accrue de l’IA (dans ton travail ou équipe) ?', hint: 'Plusieurs réponses possibles.',
        options: { time: 'Pas de temps', strategy: 'Pas de stratégie', data: 'Données pas en ordre', compliance: 'Privacy / conformité', skill: 'Compétences', leadership: 'Leadership pas embarqué', budget: 'Pas de budget', none: 'Aucun obstacle' } },
  q18: { text: 'Comment le leadership de ton organisation considère-t-il l’IA ?',
        options: { block: 'Frein actif', passive: 'Passif', curious: 'Curieux', driver: 'Moteur', roadmap: 'A sa propre roadmap' } },
}

const Q_DE: QuestionTranslations = {
  q1: { text: 'Welche KI-Assistenten nutzt du mindestens wöchentlich?',
        options: { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', copilot: 'Copilot (M365/GitHub)', perplexity: 'Perplexity', mistral: 'Mistral / Le Chat', grok: 'Grok', none: 'Noch keinen' } },
  q2: { text: 'Welche spezialisierten KI-Tools sind in deinem Marketing- oder Sales-Stack?',
        options: { notion_ai: 'Notion AI', jasper: 'Jasper', copyai: 'Copy.ai', writer: 'Writer', surfer: 'Surfer SEO', canva_magic: 'Canva Magic Studio', midjourney: 'Midjourney', firefly: 'Adobe Firefly', descript: 'Descript', synthesia: 'Synthesia', clay: 'Clay', apollo: 'Apollo', lavender: 'Lavender', gong: 'Gong', outreach: 'Outreach', salesloft: 'Salesloft', hubspot_ai: 'HubSpot AI (Breeze)', einstein: 'Salesforce Einstein', zapier_ai: 'Zapier AI / Agents', fathom: 'Fathom / Granola / Otter', none: 'Keine / nichts' } },
  q3: { text: 'Wie oft setzt du KI für deine Arbeit ein?',
        options: { never: 'Nie', monthly: 'Monatlich', weekly: 'Wöchentlich', daily: 'Täglich', multi_day: 'Mehrmals täglich' } },
  q4: { text: 'Wofür nutzt du KI heute?', hint: 'Wähle, was zutrifft.',
        options: { research: 'Recherche', draft: 'Schreiben (Entwurf)', finalize: 'Schreiben (Endfassung)', summarize: 'Zusammenfassen', translate: 'Übersetzen', imagery: 'Bild / Video', analytics: 'Datenanalyse', code: 'Code / Formeln', ideation: 'Ideation / Brainstorming', customer: 'Kunden- oder Lead-Kontakt', none: 'Nichts davon' } },
  q5: { text: 'Wie ist KI in deinen Workflow eingebettet?', hint: 'Mehrere Antworten möglich. Wähle, was zutrifft.',
        options: { standalone: 'Standalone-Tools / Browser-Tabs', integrated: 'Integriert in CRM / CMS / Inbox', custom_gpt: 'Eigene Prompts oder GPTs', agents: 'Agenten / Workflows, die selbständig handeln', in_house: 'Custom In-house-Build' } },
  q6: { text: 'Wie viel Zeit sparst du pro Woche dank KI?',
        options: { lt1: 'Weniger als 1 Stunde', '1_3': '1–3 Stunden', '4_8': '4–8 Stunden', '8_15': '8–15 Stunden', '15p': '15+ Stunden' } },
  q7: { text: 'Welche messbaren Ergebnisse siehst du bereits?',
        options: { output: 'Mehr Output', quality: 'Höhere Qualität', speed: 'Kürzere Durchlaufzeit', conversion: 'Höhere Conversion', cost: 'Geringere Kosten', insights: 'Neue Insights aus Daten', none: 'Noch nicht messbar' } },
  q8: { text: 'Wie würdest du die Hygiene deines CRMs / deiner Daten beschreiben?',
        options: { chaos: 'Chaos', mediocre: 'Mäßig', workable: 'Funktioniert', tidy: 'Sauber', sot: 'Single Source of Truth' } },
  q9: { text: 'Was hast du dokumentiert, das KI nutzen kann?', hint: 'Dokumente oder Wissen, das KI als Kontext einsetzen kann.',
        options: { icp: 'ICP / Personas', voice: 'Brand Voice / Tonalität', library: 'Content-Bibliothek', playbooks: 'Sales-Playbooks', positioning: 'Produkt-Positionierung', cases: 'Case-Study-Bibliothek', none: 'Nichts dokumentiert' } },
  q10: { text: 'Wie kompetent warst du mit KI zu diesen Zeitpunkten?', hint: 'Gib deine Einschätzung pro Zeitpunkt ab — so sehen wir deine Trajektorie.',
        options: { never: 'Nie genutzt', beginner: 'Anfänger', comfortable: 'Komfortabel', experienced: 'Erfahren', expert: 'Experte' },
        rows: { m12: 'Vor 12 Monaten', m6: 'Vor 6 Monaten', m3: 'Vor 3 Monaten' } },
  q11: { text: 'Hat dein Team strukturierte KI-Schulungen erhalten?',
        options: { no: 'Nein', informal: 'Informell (interner Wissensaustausch)', one_off: 'Einmaliger Workshop', ongoing: 'Laufendes Programm', continuous: 'Kontinuierlicher Lernprozess mit Messpunkten' } },
  q12: { text: 'Wie gehst du mit KI-Output um?',
        options: { cp: 'Copy-Paste', light: 'Leichte Review', strict: 'Strenge Review', editor: 'KI als Startpunkt, Mensch als Endredakteur', kpi: 'Validiert über messbare KPIs' } },
  q13: { text: 'Gibt es klare Richtlinien für KI-Nutzung in deiner Organisation?',
        options: { none: 'Keine', informal: 'Informelle Vereinbarungen', wip: 'In Entwicklung', policy: 'Existiert als Policy', enforced: 'Wird aktiv durchgesetzt' } },
  q14m: { text: 'Wie hat KI deinen Content-Output verändert?',
        options: { none: 'Kein Unterschied', slight: 'Etwas mehr', double: '~2× so viel', triple: '3×+', quality: 'Qualität statt Quantität' } },
  q15m: { text: 'Welche Marketing-Aufgaben machst du jetzt mit KI?',
        options: { copy: 'Copywriting', seo: 'SEO-Recherche', email: 'E-Mail-Kampagnen', social: 'Social Posts', ads: 'Ad Creatives', personalization: 'Personalisierung', analytics: 'Analytics / Reporting', attribution: 'Attribution', imagery: 'Bild / Video', none: 'Keine' } },
  q16m: { text: 'Welcher Anteil deiner kreativen Arbeit beginnt jetzt in KI?', hint: 'Drafts, Ideen, erste Versionen — bevor du oder dein Team weiterarbeitet.',
        options: { p0: '0%', p25: '<25%', p50: '25–50%', p75: '50–75%', p100: '75%+' } },
  q14s: { text: 'Welche Sales-Aufgaben machst du mit KI?',
        options: { research: 'Prospect-Recherche', outreach: 'Outreach-Personalisierung', coaching: 'Call-Coaching', notes: 'Deal-Notizen', objection: 'Einwand-Vorbereitung', proposal: 'Angebote', forecast: 'Forecasting', pipeline: 'Pipeline-Hygiene', none: 'Keine' } },
  q15s: { text: 'Welcher Prozentsatz deiner Outbound ist KI-unterstützt?',
        options: { p0: '0%', p25: '<25%', p50: '25–50%', p75: '50–75%', p100: '75%+' } },
  q16s: { text: 'Wie nutzt du KI rund um ein Sales-Gespräch?',
        options: { prep: 'Vorbereitung (Account Research)', live: 'Live-Notizen', summary: 'Zusammenfassung im Nachgang', followup: 'Follow-up-Entwurf', next: 'Next-Step-Vorschläge', object: 'Einwand-Coaching', none: 'Nichts' } },
  q14h: { text: 'Welche Prozesse hast du am stärksten mit KI automatisiert?',
        options: { enrichment: 'Lead Enrichment', scoring: 'Lead Scoring', outreach: 'Outreach', reporting: 'Reporting', forecast: 'Forecasting', crm: 'CRM-Hygiene', content: 'Content-Produktion', onboard: 'Onboarding', none: 'Nichts' } },
  q15h: { text: 'Wie steuerst du KI-Experimente teamübergreifend?',
        options: { adhoc: 'Ad-hoc', silo: 'Pro Team eigener Kurs', guidelines: 'Zentrale Guidelines', tiger: 'Arbeitsgruppe / Tiger Team', roadmap: 'KI-Roadmap mit KPIs' } },
  q16h: { text: 'Wo liefert KI den meisten messbaren ROI in deiner Organisation?',
        options: { cac: 'Akquisitionskosten', velocity: 'Pipeline-Velocity', content: 'Content-Output', retention: 'Kundenbindung', productivity: 'Mitarbeiterproduktivität', none: 'Noch nicht messbar' } },
  q17: { text: 'Welche Blocker halten mehr KI-Nutzung auf (in deiner Arbeit oder deinem Team)?', hint: 'Mehrere Antworten möglich.',
        options: { time: 'Keine Zeit', strategy: 'Keine Strategie', data: 'Daten nicht in Ordnung', compliance: 'Privacy / Compliance', skill: 'Skills', leadership: 'Leadership nicht an Bord', budget: 'Kein Budget', none: 'Keine Blocker' } },
  q18: { text: 'Wie steht das Leadership in deiner Organisation zu KI?',
        options: { block: 'Aktive Bremse', passive: 'Passiv', curious: 'Neugierig', driver: 'Treiber', roadmap: 'Eigene Roadmap' } },
}

const QUESTIONS_BY_LANG: Record<Lang, QuestionTranslations> = {
  nl: Q_NL, en: Q_EN, fr: Q_FR, de: Q_DE,
}

// ── Public API ──────────────────────────────────────────────────────────────
function hydrate(struct: QuestionStructure[], lang: Lang): Question[] {
  const tr = QUESTIONS_BY_LANG[lang] ?? Q_NL
  return struct.map(q => {
    const t = tr[q.id] ?? Q_NL[q.id]
    const out: Question = {
      id:        q.id,
      type:      q.type,
      dimension: q.dimension,
      text:      t?.text ?? q.id,
      hint:      t?.hint,
      saturation: q.saturation,
      hasOther:   q.hasOther,
      options:   q.options.map(o => ({
        id:     o.id,
        weight: o.weight,
        label:  t?.options?.[o.id] ?? o.id,
      })),
    }
    if (q.rowIds && t?.rows) {
      out.rows = q.rowIds.map(rid => ({ id: rid, label: t.rows![rid] ?? rid }))
    }
    return out
  })
}

export function getQuestions(role: Role, lang: Lang = 'nl'): Question[] {
  const roleSpecific =
    role === 'marketing' ? ROLE_MARKETING_BASE :
    role === 'sales'     ? ROLE_SALES_BASE     :
                           ROLE_HYBRID_BASE
  return hydrate([...SHARED_CORE_BASE, ...roleSpecific, ...SENTIMENT_BASE], lang)
}

export function getScoringQuestions(role: Role, lang: Lang = 'nl'): Question[] {
  return getQuestions(role, lang).filter(q => q.dimension !== 'sentiment')
}
