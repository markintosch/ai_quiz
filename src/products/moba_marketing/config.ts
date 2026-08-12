// FILE: src/products/moba_marketing/config.ts
// ─── MOBA Marketing Survey — productconfiguratie ──────────────────────────────
//
// Anonieme team-survey ter voorbereiding op de sessie richting jaarplan 2027.
// Anders dan de andere producten:
//   - GEEN individueel rapport, GEEN lead capture, GEEN Calendly-verkoop.
//   - Kern-deliverable is een GROEPSrapport met nadruk op spreiding/divergentie.
//
// Dit bestand levert de 6 dimensies + 18 likert-vragen + maturity-niveaus voor
// de standaard scoring-engine. De extra survey-lagen (10-punten prioritering,
// open vragen, segmentatievraag) zijn geen likert en staan als losse exports
// onderaan — de survey-flow en submit-route importeren die rechtstreeks.
//
// 18 vragen · 6 dimensies · 5 volwassenheidsniveaus
// Schaal: Startend → Ontwikkelend → Gevestigd → Geïntegreerd → Leidend

import { MOBA_QUESTIONS } from './questions'
import type { QuizProductConfig } from '../types'

// ── Config object ─────────────────────────────────────────────────────────────

export const MOBA_MARKETING_CONFIG: QuizProductConfig = {
  key:  'moba_marketing',
  name: 'MOBA Marketing Survey',
  headingSubject: null, // custom routes/copy — geen auto-heading

  questions: MOBA_QUESTIONS,

  dimensions: [
    {
      key:         'moba_positioning',
      label:       'Positionering & propositie',
      weight:      0.17,
      icon:        '🎯',
      description: 'Hoe helder, onderscheidend en gedeeld is waar MOBA voor staat.',
    },
    {
      key:         'moba_integrated_comms',
      label:       'Geïntegreerde communicatie & keten-verhaal',
      weight:      0.17,
      icon:        '🔗',
      description: 'Brengen we de keten als één samenhangend, ontzorgend verhaal of als losse producten.',
    },
    {
      key:         'moba_business_partner',
      label:       'Business-partnerrol & klantwaarde',
      weight:      0.17,
      icon:        '🤝',
      description: 'Worden we gezien als strategische partner die rendement voor de klant maximaliseert, of als machineleverancier.',
    },
    {
      key:         'moba_channel_strategy',
      label:       'Kanaalstrategie (minder event-afhankelijk)',
      weight:      0.17,
      icon:        '📡',
      description: 'Balans in de kanaalmix en de mate van event-afhankelijkheid.',
    },
    {
      key:         'moba_data_roi',
      label:       'Datagedreven werken & rendement',
      weight:      0.16,
      icon:        '📊',
      description: 'Weten we wat werkt en sturen we op onderbouwd rendement.',
    },
    {
      key:         'moba_ai_future',
      label:       'AI & toekomstgerichtheid',
      weight:      0.16,
      icon:        '🤖',
      description: 'In hoeverre benutten we AI en nieuwe werkwijzen in marketing.',
    },
  ],

  scoring: {
    // 0–100 genormaliseerd (gelijk aan bestaande tool). 5 niveaus.
    maturityThresholds: [
      { maxScore: 20,  level: 'Startend',     colorClass: 'text-red-500',    bgClass: 'bg-red-50',    ringClass: 'ring-red-200' },
      { maxScore: 40,  level: 'Ontwikkelend', colorClass: 'text-orange-500', bgClass: 'bg-orange-50', ringClass: 'ring-orange-200' },
      { maxScore: 60,  level: 'Gevestigd',    colorClass: 'text-amber-500',  bgClass: 'bg-amber-50',  ringClass: 'ring-amber-200' },
      { maxScore: 80,  level: 'Geïntegreerd', colorClass: 'text-lime-600',   bgClass: 'bg-lime-50',   ringClass: 'ring-lime-200' },
      { maxScore: 100, level: 'Leidend',      colorClass: 'text-green-600',  bgClass: 'bg-green-50',  ringClass: 'ring-green-200' },
    ],
  },

  maturityDescriptions: {
    'Startend':     'Op dit thema staan we aan het begin. Nog weinig gedeeld beeld of structuur.',
    'Ontwikkelend': 'Eerste stappen zijn gezet, maar het is nog niet consistent of verankerd.',
    'Gevestigd':    'Er is een werkende basis. Het gebeurt, maar nog niet overal en niet altijd bewust.',
    'Geïntegreerd': 'Het zit grotendeels in hoe we werken, met ruimte om aan te scherpen.',
    'Leidend':      'Hier lopen we voorop: bewust, consistent en herkenbaar in de markt.',
  },

  // Niet gebruikt in MOBA (geen verkoopgesprek), maar de interface vereist het.
  calendly: {
    rules: [{ maxScore: 100, url: '' }],
  },

  // Geen individuele aanbevelingen — dit is een teaminstrument, geen adviesrapport.
  generateRecommendations: () => [],
}

// ─── Extra survey-lagen (geen likert — apart afgehandeld) ─────────────────────

/** Laag 2 — prioritering: 10 punten verdelen over deze zes opties (§5, §12.3). */
export const MOBA_PRIORITY_OPTIONS = [
  { key: 'moba_positioning',       label: 'Positionering & propositie' },
  { key: 'moba_integrated_comms',  label: 'Geïntegreerde communicatie & keten-verhaal' },
  { key: 'moba_business_partner',  label: 'Business-partnerrol & klantwaarde' },
  { key: 'moba_channel_strategy',  label: 'Kanaalstrategie (minder event-afhankelijk)' },
  { key: 'moba_data_roi',          label: 'Datagedreven werken & rendement' },
  { key: 'moba_ai_future',         label: 'AI & toekomstgerichtheid' },
] as const

/** Totaal aantal te verdelen punten in de prioriteringsvraag. */
export const MOBA_PRIORITY_TOTAL = 10

/** Laag 3 — open vragen (§5). */
export const MOBA_OPEN_QUESTIONS = [
  { key: 'q20', text: 'Wat is de grootste kans die we in 2027 laten liggen als we niets veranderen?' },
  { key: 'q21', text: 'Waar zit je grootste frustratie of zorg in hoe we nu naar de markt gaan?' },
  { key: 'q22', text: 'Als je één ding mocht veranderen aan hoe MOBA naar de markt beweegt, wat zou dat zijn?' },
] as const

/**
 * Segmentatievraag (§6) — 5-punts schaal van techniek-/productgedreven (1)
 * tot markt-/klantgedreven (5). Alleen tonen wanneer moba_teams.segmentation_enabled
 * en de teamomvang groot genoeg is voor anonimiteit.
 */
export const MOBA_SEGMENT_QUESTION = {
  text: 'Waar voel jij je van nature meer toe aangetrokken?',
  minLabel: 'Techniek-/productgedreven',
  maxLabel: 'Markt-/klantgedreven',
} as const
