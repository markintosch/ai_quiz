// FILE: src/products/hr_readiness/config.ts
// ─── HR Gereedheidscan — product config voor REEF ────────────────────────────
//
// Diagnostisch instrument voor HR-volwassenheid. Wordt ingezet door REEF
// als intake-tool voorafgaand aan een consultancy-traject.
// 24 vragen · 6 dimensies · 5 volwassenheidsniveaus · NL primair.

import { HR_QUESTIONS } from './questions'
import { generateHRRecommendations } from './recommendations'
import type { QuizProductConfig } from '../types'

// ── Calendly URLs — override via env vars per deployment ─────────────────────
const CALENDLY_INTAKE = process.env.NEXT_PUBLIC_REEF_CALENDLY_INTAKE_URL
  ?? process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL
  ?? 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

const CALENDLY_STRATEGY = process.env.NEXT_PUBLIC_REEF_CALENDLY_STRATEGY_URL
  ?? process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL
  ?? 'https://calendly.com/markiesbpm/ai-strategy-session'

// ── Config object ─────────────────────────────────────────────────────────────

export const HR_READINESS_CONFIG: QuizProductConfig = {
  key: 'hr_readiness',
  name: 'HR Gereedheidscan',

  questions: HR_QUESTIONS,

  dimensions: [
    {
      key: 'hr_strategie',
      label: 'HR & Strategie',
      weight: 0.22,
      icon: '🧭',
      description: 'In welke mate is HR verbonden aan de organisatiestrategie en stuurt mee op businessdoelstellingen?',
    },
    {
      key: 'verandervermogen',
      label: 'Verandervermogen',
      weight: 0.20,
      icon: '🔄',
      description: 'Hoe goed absorbeert en execueert de organisatie veranderingen?',
    },
    {
      key: 'leiderschap',
      label: 'Leiderschap & Sturing',
      weight: 0.18,
      icon: '👔',
      description: 'Zijn leidinggevenden toegerust voor people management en cultuurontwikkeling?',
    },
    {
      key: 'talent',
      label: 'Talent & Ontwikkeling',
      weight: 0.18,
      icon: '🌱',
      description: 'Hoe volwassen is het talentmanagement, van werving tot retentie en ontwikkeling?',
    },
    {
      key: 'hr_data',
      label: 'HR-data & Analyse',
      weight: 0.12,
      icon: '📊',
      description: 'Worden HR-data actief gebruikt voor besluitvorming en strategie?',
    },
    {
      key: 'hr_operationeel',
      label: 'Operationele effectiviteit',
      weight: 0.10,
      icon: '⚙️',
      description: 'Hoe efficiënt, consistent en schaalbaar zijn de HR-processen?',
    },
  ],

  scoring: {
    maturityThresholds: [
      { maxScore: 20,  level: 'Reactief',    colorClass: 'text-red-500',    bgClass: 'bg-red-50',    ringClass: 'ring-red-200'    },
      { maxScore: 40,  level: 'Bewust',      colorClass: 'text-orange-500', bgClass: 'bg-orange-50', ringClass: 'ring-orange-200' },
      { maxScore: 60,  level: 'Structureel', colorClass: 'text-yellow-500', bgClass: 'bg-yellow-50', ringClass: 'ring-yellow-200' },
      { maxScore: 80,  level: 'Proactief',   colorClass: 'text-teal-500',   bgClass: 'bg-teal-50',   ringClass: 'ring-teal-200'   },
      { maxScore: 100, level: 'Strategisch', colorClass: 'text-green-500',  bgClass: 'bg-green-50',  ringClass: 'ring-green-200'  },
    ],
  },

  maturityDescriptions: {
    'Reactief':    'HR opereert voornamelijk operationeel en reactief. Er is beperkte verbinding met de organisatiestrategie en verandering wordt als lastig ervaren. Dit is het vertrekpunt voor een gerichte HR-ontwikkelagenda.',
    'Bewust':      'Er is bewustzijn van wat er beter kan en eerste stappen zijn gezet. Processen en strategische koppeling zijn in ontwikkeling, maar nog niet consistent. Een goede basis om op door te bouwen.',
    'Structureel': 'De HR-organisatie heeft een solide fundament. Kernprocessen zijn beschreven en de strategische richting is helder. De uitdaging is nu consistentie en het verdiepen van de impact.',
    'Proactief':   'HR is een proactieve partner die vooruitkijkt en meedenkt. Data en leiderschap zijn goed ontwikkeld. De organisatie is klaar voor de volgende stap naar echte strategische integratie.',
    'Strategisch': 'HR is volledig geïntegreerd als strategische businesspartner. Talent, data, leiderschap en verandervermogen zijn op een hoog niveau. HR draagt zichtbaar bij aan organisatiesucces.',
  },

  calendly: {
    rules: [
      { maxScore: 50,  url: CALENDLY_INTAKE   },
      { maxScore: 100, url: CALENDLY_STRATEGY },
    ],
  },

  generateRecommendations: generateHRRecommendations,

  defaultCopy: {
    nl: {
      badge:       'HR Gereedheidscan · REEF',
      scoreLabel:  'HR Volwassenheidsscore',
      heroHeading: 'Hoe klaar is uw organisatie voor de HR-uitdagingen van morgen?',
      heroCta:     'Start de scan →',
    },
  },
}
