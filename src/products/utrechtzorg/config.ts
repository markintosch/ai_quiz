// FILE: src/products/utrechtzorg/config.ts
// ─── Zorgmarkt Readiness Assessment — productconfiguratie voor UtrechtZorg ────
//
// Diagnostisch benchmarkinstrument voor UtrechtZorg-lidorganisaties.
// Meet gereedheid op 6 dimensies: personeel, informele zorg, digitalisering,
// ketenregie, financiën en governance.
// 24 vragen · 6 dimensies · 4 gereedheidsniveaus · NL primair.

import { ZORG_QUESTIONS } from './questions'
import { generateZorgRecommendations } from './recommendations'
import type { QuizProductConfig } from '../types'

// ── Calendly URLs — override via env vars per deployment ─────────────────────
const CALENDLY_INTAKE = process.env.NEXT_PUBLIC_UZ_CALENDLY_INTAKE_URL
  ?? process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL
  ?? 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

const CALENDLY_STRATEGY = process.env.NEXT_PUBLIC_UZ_CALENDLY_STRATEGY_URL
  ?? process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL
  ?? 'https://calendly.com/markiesbpm/ai-strategy-session'

// ── Config object ─────────────────────────────────────────────────────────────

export const UTRECHTZORG_CONFIG: QuizProductConfig = {
  key: 'zorgmarkt_readiness',
  name: 'Zorgmarkt Assessment',
  headingSubject: null,   // heading2 comes from CMS, not auto-derived

  questions: ZORG_QUESTIONS,

  dimensions: [
    {
      key: 'personeel_veerkracht',
      label: 'Personeel & Veerkracht',
      weight: 0.20,
      icon: '👥',
      description: 'Bezettingsdruk, verlooprisico, werkbeleving en beschikbaarheid van gekwalificeerde medewerkers.',
    },
    {
      key: 'informele_zorg',
      label: 'Informele Zorg & Netwerk',
      weight: 0.18,
      icon: '🤝',
      description: 'Samenwerking met mantelzorgers, welzijnsorganisaties, wijkteams en buurtinitiatieven.',
    },
    {
      key: 'digitale_ai_adoptie',
      label: 'Digitale & AI Adoptie',
      weight: 0.16,
      icon: '💡',
      description: 'Gebruik van zorgtechnologie, administratieve automatisering en AI-ondersteunde processen.',
    },
    {
      key: 'ketenregie',
      label: 'Ketenregie & Samenwerking',
      weight: 0.18,
      icon: '🔗',
      description: 'Samenwerking met gemeenten, huisartsen, woningcorporaties en andere zorgaanbieders.',
    },
    {
      key: 'financiele_veerkracht',
      label: 'Financiële Veerkracht',
      weight: 0.16,
      icon: '📈',
      description: 'Weerbaarheid van de organisatie om verandering en arbeidsmarktdruk op te vangen.',
    },
    {
      key: 'governance_veranderen',
      label: 'Governance & Verandervermogen',
      weight: 0.12,
      icon: '🏛️',
      description: 'Besluitkracht, verandervermogen, implementatiekracht en strategische wendbaarheid.',
    },
  ],

  scoring: {
    maturityThresholds: [
      { maxScore: 30,  level: 'Onder druk',             colorClass: 'text-red-500',    bgClass: 'bg-red-50',    ringClass: 'ring-red-200'    },
      { maxScore: 50,  level: 'Kwetsbaar in transitie', colorClass: 'text-orange-500', bgClass: 'bg-orange-50', ringClass: 'ring-orange-200' },
      { maxScore: 70,  level: 'In ontwikkeling',        colorClass: 'text-yellow-600', bgClass: 'bg-yellow-50', ringClass: 'ring-yellow-200' },
      { maxScore: 100, level: 'Toekomstbestendig',      colorClass: 'text-green-600',  bgClass: 'bg-green-50',  ringClass: 'ring-green-200'  },
    ],
  },

  maturityDescriptions: {
    'Onder druk':
      'Uw organisatie staat op meerdere fronten onder druk. Personeelstekorten, beperkte samenwerking in de keten en financiële kwetsbaarheid versterken elkaar. Prioriteer de twee meest kritische dimensies en pak die eerst aan — liefst met steun van het netwerk.',
    'Kwetsbaar in transitie':
      'Er zijn solide elementen in uw organisatie, maar ook duidelijke kwetsbaarheden die risico\u2019s geven in de snel veranderende zorgmarkt. Gerichte versterking op de zwakste dimensies geeft de meeste impact op korte termijn.',
    'In ontwikkeling':
      'Uw organisatie is in beweging en laat op meerdere fronten groei zien. De basis staat. De volgende stap is verdieping en verankering: van losse initiatieven naar structurele aanpak. Gebruik de benchmarkgegevens van het netwerk als kompas.',
    'Toekomstbestendig':
      'Uw organisatie is goed gepositioneerd voor de uitdagingen van de komende jaren. Personeel, samenwerking, technologie en financiën zijn op orde. Gebruik deze kracht om anderen in het netwerk te ondersteunen en te blijven innoveren.',
  },

  calendly: {
    rules: [
      { maxScore: 50,  url: CALENDLY_INTAKE   },
      { maxScore: 100, url: CALENDLY_STRATEGY },
    ],
  },

  generateRecommendations: generateZorgRecommendations,

  defaultCopy: {
    nl: {
      badge:       'Zorgmarkt Readiness · UtrechtZorg',
      scoreLabel:  'Gereedheidsscore',
      heroHeading: 'Hoe toekomstbestendig is uw zorgorganisatie?',
      heroCta:     'Start de assessment →',
    },
    en: {
      badge:       'Zorgmarkt Readiness · UtrechtZorg',
      scoreLabel:  'Readiness Score',
      heroHeading: 'How future-proof is your care organisation?',
      heroCta:     'Start assessment →',
    },
  },
}
