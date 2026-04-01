// ── Candidate Energy Profile — by Laura Dijcks / Hire.nl ─────────────────────
// 5 Dimensions × 3 questions = 15 questions. Score 1–4 per question.

export type DimensionId = 'energy' | 'communication' | 'motivation' | 'collaboration' | 'resilience'

export interface Dimension {
  id: DimensionId
  name: string
  icon: string
  lowLabel: string
  highLabel: string
  description: string
}

export interface ProfileQuestion {
  id: string
  dimensionId: DimensionId
  text: string
  lowAnchor: string
  highAnchor: string
}

export interface ProfileRole {
  id: string
  label: string
  description: string
}

// ── Dimensions ────────────────────────────────────────────────────────────────

const DIMENSIONS_NL: Dimension[] = [
  {
    id: 'energy',
    name: 'Energie-stijl',
    icon: '⚡',
    lowLabel: 'Gefocust & diepgaand',
    highLabel: 'Sociaal & verbindend',
    description: 'Waar haal jij energie vandaan op je werk?',
  },
  {
    id: 'communication',
    name: 'Communicatie',
    icon: '💬',
    lowLabel: 'Doordacht & zorgvuldig',
    highLabel: 'Direct & snel',
    description: 'Hoe communiceer jij van nature?',
  },
  {
    id: 'motivation',
    name: 'Motivatie',
    icon: '🎯',
    lowLabel: 'Vakmanschap & verdieping',
    highLabel: 'Impact & zingeving',
    description: 'Wat drijft jou om het beste uit jezelf te halen?',
  },
  {
    id: 'collaboration',
    name: 'Samenwerking',
    icon: '🤝',
    lowLabel: 'Versterken & ondersteunen',
    highLabel: 'Richting geven & aansturen',
    description: 'Welke rol neem jij van nature in een team?',
  },
  {
    id: 'resilience',
    name: 'Omgang met druk',
    icon: '🧘',
    lowLabel: 'Reflecteren & verankeren',
    highLabel: 'Handelen & aanpassen',
    description: 'Hoe ga jij om met druk, verandering en tegenslag?',
  },
]

const DIMENSIONS_EN: Dimension[] = [
  {
    id: 'energy',
    name: 'Energy Style',
    icon: '⚡',
    lowLabel: 'Focused & deep',
    highLabel: 'Social & connecting',
    description: 'Where do you get your energy from at work?',
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    lowLabel: 'Thoughtful & careful',
    highLabel: 'Direct & fast',
    description: 'How do you naturally communicate?',
  },
  {
    id: 'motivation',
    name: 'Motivation',
    icon: '🎯',
    lowLabel: 'Mastery & craft',
    highLabel: 'Impact & purpose',
    description: 'What drives you to do your best work?',
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    icon: '🤝',
    lowLabel: 'Support & strengthen',
    highLabel: 'Lead & direct',
    description: 'What role do you naturally take in a team?',
  },
  {
    id: 'resilience',
    name: 'Resilience',
    icon: '🧘',
    lowLabel: 'Reflect & consolidate',
    highLabel: 'Act & adapt',
    description: 'How do you handle pressure, change and setbacks?',
  },
]

// ── Questions ─────────────────────────────────────────────────────────────────

const QUESTIONS_NL: ProfileQuestion[] = [
  // ENERGY
  {
    id: 'e1',
    dimensionId: 'energy',
    text: "Na een dag met veel overleg en contact met collega's voel ik me vooral...",
    lowAnchor: 'Uitgeput en toe aan rust',
    highAnchor: 'Opgeladen en voldaan',
  },
  {
    id: 'e2',
    dimensionId: 'energy',
    text: 'Ik doe mijn beste werk als ik...',
    lowAnchor: 'Alleen en ongestoord kan werken',
    highAnchor: 'Omgeven ben door energie en mensen',
  },
  {
    id: 'e3',
    dimensionId: 'energy',
    text: 'Bij een nieuw project zoek ik eerst...',
    lowAnchor: 'Ruimte om het zelf te doordenken',
    highAnchor: 'Meteen contact en samenwerking op',
  },
  // COMMUNICATION
  {
    id: 'c1',
    dimensionId: 'communication',
    text: 'Als ik moeilijk nieuws moet brengen, doe ik dat...',
    lowAnchor: 'Na zorgvuldige voorbereiding en goede timing',
    highAnchor: 'Direct en zonder omheen te draaien',
  },
  {
    id: 'c2',
    dimensionId: 'communication',
    text: 'In een vergadering ben ik iemand die...',
    lowAnchor: 'Nadenkt en spreekt op het juiste moment',
    highAnchor: 'Hardop meedenkt en direct reageert',
  },
  {
    id: 'c3',
    dimensionId: 'communication',
    text: 'Voor mij is goede communicatie in de eerste plaats...',
    lowAnchor: 'Compleet, nauwkeurig en goed doordacht',
    highAnchor: 'Snel, helder en to-the-point',
  },
  // MOTIVATION
  {
    id: 'm1',
    dimensionId: 'motivation',
    text: 'Ik ben het meest gemotiveerd als mijn werk...',
    lowAnchor: 'Me echt uitdaagt en iets nieuws laat leren',
    highAnchor: 'Zichtbaar verschil maakt voor mensen of resultaat',
  },
  {
    id: 'm2',
    dimensionId: 'motivation',
    text: 'Ik ben trots op mijn werk als...',
    lowAnchor: 'Ik weet dat het echt goed in elkaar zit',
    highAnchor: 'Ik zie dat het echte impact heeft gehad',
  },
  {
    id: 'm3',
    dimensionId: 'motivation',
    text: 'Na een succesvol project kijk ik als eerste naar...',
    lowAnchor: 'Wat ik ervan geleerd heb en hoe ik het beter kan',
    highAnchor: 'Welk effect het heeft gehad op de ander of het resultaat',
  },
  // COLLABORATION
  {
    id: 'co1',
    dimensionId: 'collaboration',
    text: 'Als er onduidelijkheid is in een team, ben ik iemand die...',
    lowAnchor: 'Afwacht en anderen de ruimte geeft',
    highAnchor: 'Het initiatief neemt om richting te geven',
  },
  {
    id: 'co2',
    dimensionId: 'collaboration',
    text: 'Ik werk het liefst samen met mensen die...',
    lowAnchor: 'Sterk en zelfstandig zijn en weten wat ze willen',
    highAnchor: 'Openstaan voor richting en samenwerking zoeken',
  },
  {
    id: 'co3',
    dimensionId: 'collaboration',
    text: 'In een groep voel ik me het prettigst als ik...',
    lowAnchor: 'Iemand kan ondersteunen en versterken',
    highAnchor: 'Richting kan geven en de koers kan bepalen',
  },
  // RESILIENCE
  {
    id: 'r1',
    dimensionId: 'resilience',
    text: 'Als iets misgaat of tegenvalt, is mijn eerste reactie...',
    lowAnchor: 'Stoppen, analyseren en structuur zoeken',
    highAnchor: 'Doorgaan, aanpassen en oplossingen zoeken',
  },
  {
    id: 'r2',
    dimensionId: 'resilience',
    text: 'Bij veel verandering of onzekerheid voel ik me...',
    lowAnchor: 'Het beste bij houvast en een duidelijk kader',
    highAnchor: 'Energiek — ik ga er graag mee aan de slag',
  },
  {
    id: 'r3',
    dimensionId: 'resilience',
    text: 'Feedback verwerk ik het liefst...',
    lowAnchor: 'Door er rustig over na te denken voor ik reageer',
    highAnchor: 'Door er direct over in gesprek te gaan',
  },
]

const QUESTIONS_EN: ProfileQuestion[] = [
  // ENERGY
  {
    id: 'e1',
    dimensionId: 'energy',
    text: 'After a day with a lot of meetings and contact with colleagues, I mostly feel...',
    lowAnchor: 'Drained and in need of rest',
    highAnchor: 'Energised and satisfied',
  },
  {
    id: 'e2',
    dimensionId: 'energy',
    text: 'I do my best work when I...',
    lowAnchor: 'Can work alone without interruption',
    highAnchor: 'Am surrounded by energy and people',
  },
  {
    id: 'e3',
    dimensionId: 'energy',
    text: 'When starting a new project, I first look for...',
    lowAnchor: 'Space to think it through on my own',
    highAnchor: 'Immediate contact and collaboration',
  },
  // COMMUNICATION
  {
    id: 'c1',
    dimensionId: 'communication',
    text: 'When I need to deliver difficult news, I do it...',
    lowAnchor: 'After careful preparation and the right timing',
    highAnchor: 'Directly and without beating around the bush',
  },
  {
    id: 'c2',
    dimensionId: 'communication',
    text: 'In a meeting, I tend to be someone who...',
    lowAnchor: 'Thinks carefully and speaks at the right moment',
    highAnchor: 'Thinks out loud and responds directly',
  },
  {
    id: 'c3',
    dimensionId: 'communication',
    text: 'For me, good communication is first and foremost...',
    lowAnchor: 'Complete, accurate and well thought through',
    highAnchor: 'Fast, clear and to the point',
  },
  // MOTIVATION
  {
    id: 'm1',
    dimensionId: 'motivation',
    text: 'I am most motivated when my work...',
    lowAnchor: 'Truly challenges me and lets me learn something new',
    highAnchor: 'Makes a visible difference for people or results',
  },
  {
    id: 'm2',
    dimensionId: 'motivation',
    text: 'I am proud of my work when...',
    lowAnchor: 'I know it is truly well crafted',
    highAnchor: 'I can see it had real impact',
  },
  {
    id: 'm3',
    dimensionId: 'motivation',
    text: 'After a successful project, I first look at...',
    lowAnchor: 'What I learned and how I can do it better',
    highAnchor: 'What effect it had on others or the result',
  },
  // COLLABORATION
  {
    id: 'co1',
    dimensionId: 'collaboration',
    text: 'When there is ambiguity in a team, I tend to...',
    lowAnchor: 'Wait and give others space',
    highAnchor: 'Take initiative to provide direction',
  },
  {
    id: 'co2',
    dimensionId: 'collaboration',
    text: 'I prefer working with people who...',
    lowAnchor: 'Are strong and independent and know what they want',
    highAnchor: 'Are open to direction and seek collaboration',
  },
  {
    id: 'co3',
    dimensionId: 'collaboration',
    text: 'In a group, I feel most comfortable when I...',
    lowAnchor: 'Can support and strengthen someone else',
    highAnchor: 'Can give direction and set the course',
  },
  // RESILIENCE
  {
    id: 'r1',
    dimensionId: 'resilience',
    text: 'When something goes wrong or disappoints, my first reaction is...',
    lowAnchor: 'Stop, analyse and look for structure',
    highAnchor: 'Keep going, adapt and look for solutions',
  },
  {
    id: 'r2',
    dimensionId: 'resilience',
    text: 'With a lot of change or uncertainty, I feel best...',
    lowAnchor: 'When I have certainty and a clear framework',
    highAnchor: 'Energised — I enjoy engaging with it',
  },
  {
    id: 'r3',
    dimensionId: 'resilience',
    text: 'I prefer to process feedback...',
    lowAnchor: 'By quietly reflecting before I respond',
    highAnchor: 'By getting into a direct conversation about it',
  },
]

// ── Roles ─────────────────────────────────────────────────────────────────────

const ROLES_NL: ProfileRole[] = [
  { id: 'starter',   label: 'Starter / Junior',       description: 'Minder dan 2 jaar werkervaring' },
  { id: 'medior',    label: 'Medior',                  description: '2 tot 5 jaar werkervaring' },
  { id: 'senior',    label: 'Senior / Specialist',     description: '5 tot 10 jaar werkervaring' },
  { id: 'lead',      label: 'Lead / Manager',          description: 'Geeft leiding aan een team' },
  { id: 'director',  label: 'Directeur / MT-lid',      description: 'Eindverantwoordelijkheid of MT-rol' },
  { id: 'freelance', label: 'Freelancer / ZZP',        description: 'Zelfstandig werkend professional' },
]

const ROLES_EN: ProfileRole[] = [
  { id: 'starter',   label: 'Starter / Junior',       description: 'Less than 2 years of work experience' },
  { id: 'medior',    label: 'Medior',                  description: '2 to 5 years of work experience' },
  { id: 'senior',    label: 'Senior / Specialist',     description: '5 to 10 years of work experience' },
  { id: 'lead',      label: 'Lead / Manager',          description: 'Leads a team' },
  { id: 'director',  label: 'Director / MT member',    description: 'Final responsibility or MT role' },
  { id: 'freelance', label: 'Freelancer / Self-employed', description: 'Independent professional' },
]

// ── Scoring helpers ───────────────────────────────────────────────────────────

export function getDimensionProfile(score: number, _dimensionId: DimensionId, locale: string): string {
  const isNl = locale === 'nl'
  if (score >= 3.0) {
    // Return the high-end label for the dimension
    const dims = isNl ? DIMENSIONS_NL : DIMENSIONS_EN
    const dim = dims.find(d => d.id === _dimensionId)
    return dim ? dim.highLabel : (isNl ? 'Hoog extern' : 'High external')
  }
  if (score >= 2.0) {
    return isNl ? 'Flexibel' : 'Flexible'
  }
  // Low
  const dims = isNl ? DIMENSIONS_NL : DIMENSIONS_EN
  const dim = dims.find(d => d.id === _dimensionId)
  return dim ? dim.lowLabel : (isNl ? 'Hoog intern' : 'High internal')
}

export function profileColour(avgScore: number): {
  bg: string
  label: string
  labelEn: string
  description: string
  descriptionEn: string
} {
  if (avgScore >= 3.0) return {
    bg: '#2C2447', label: 'Hoog Extern', labelEn: 'High External',
    description: 'Jij haalt energie uit contact, handelt direct en geeft richting. Krachtig in dynamische omgevingen.',
    descriptionEn: 'You draw energy from contact, act directly and give direction. Powerful in dynamic environments.',
  }
  if (avgScore >= 2.3) return {
    bg: '#696284', label: 'Balans', labelEn: 'Balanced',
    description: 'Jij schakelt makkelijk tussen stijlen. Sterk in uiteenlopende omgevingen en teams.',
    descriptionEn: 'You switch easily between styles. Strong across diverse environments and teams.',
  }
  return {
    bg: '#1a1526', label: 'Hoog Intern', labelEn: 'High Internal',
    description: 'Jij werkt diep, denkt voor je spreekt en haalt kracht uit focus. Waardevol in complexe, inhoudelijke omgevingen.',
    descriptionEn: 'You work deep, think before speaking and draw strength from focus. Valuable in complex, content-heavy environments.',
  }
}

// ── Locale accessor ───────────────────────────────────────────────────────────

export function getProfileContent(locale: string): {
  DIMENSIONS: Dimension[]
  QUESTIONS: ProfileQuestion[]
  ROLES: ProfileRole[]
} {
  const isNl = locale === 'nl'
  return {
    DIMENSIONS: isNl ? DIMENSIONS_NL : DIMENSIONS_EN,
    QUESTIONS:  isNl ? QUESTIONS_NL  : QUESTIONS_EN,
    ROLES:      isNl ? ROLES_NL      : ROLES_EN,
  }
}
