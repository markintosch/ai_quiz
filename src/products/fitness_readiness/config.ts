// FILE: src/products/fitness_readiness/config.ts
// ─── Fitness Readiness Scan — product config voor Healthclub45 ────────────────
//
// Consumentenassessment voor fitness lead gen en reactivatie.
// Twee varianten (via company config):
//   - Nieuwe leden: lead-gen CTA → gratis intake of HYROX-kennismaking
//   - Huidige leden: PT-upsell CTA op zwakste dimensie
//
// 18 vragen · 6 dimensies · 5 fitnessniveaus
// HYROX-routing: mental_drive >= 60 EN cardio_base >= 50 → HYROX-pad

import { FITNESS_QUESTIONS } from './questions'
import { generateFitnessRecommendations } from './recommendations'
import type { QuizProductConfig } from '../types'

// ── Calendly / booking URLs — override via env vars ───────────────────────────
const CALENDLY_INTAKE = process.env.NEXT_PUBLIC_FITNESS_CALENDLY_INTAKE_URL
  ?? process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL
  ?? 'https://calendly.com/healthclub45/gratis-intake'

const CALENDLY_HYROX = process.env.NEXT_PUBLIC_FITNESS_CALENDLY_HYROX_URL
  ?? process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL
  ?? 'https://calendly.com/healthclub45/hyrox-kennismaking'

// ── Config object ─────────────────────────────────────────────────────────────

export const FITNESS_READINESS_CONFIG: QuizProductConfig = {
  key:  'fitness_readiness',
  name: 'Fitness Readiness Scan',
  headingSubject: 'fitness',

  questions: FITNESS_QUESTIONS,

  dimensions: [
    {
      key:         'cardio_base',
      label:       'Cardio & Conditie',
      weight:      0.20,
      icon:        '🫀',
      description: 'Hoe sterk is je aerobe basis? Conditie bepaalt hoe lang én hoe intensief je kunt trainen.',
    },
    {
      key:         'strength_power',
      label:       'Kracht & Power',
      weight:      0.20,
      icon:        '💪',
      description: 'Functionele kracht is de basis van vrijwel elke sportactiviteit — van squats tot HYROX-stations.',
    },
    {
      key:         'mental_drive',
      label:       'Mentale Drive',
      weight:      0.20,
      icon:        '🎯',
      description: 'Motivatie, doelgerichtheid en de bereidheid om grenzen op te zoeken. De motor achter consistentie.',
    },
    {
      key:         'mobility_recovery',
      label:       'Mobiliteit & Herstel',
      weight:      0.15,
      icon:        '🧘',
      description: 'Souplesse en bewust herstel voorkomen blessures en houden je consistent in beweging.',
    },
    {
      key:         'nutrition_habits',
      label:       'Voeding & Energie',
      weight:      0.15,
      icon:        '🥗',
      description: 'Voeding is brandstof. Bewust omgaan met eten en energie bepaalt hoe je traint en herstelt.',
    },
    {
      key:         'training_consistency',
      label:       'Regelmaat',
      weight:      0.10,
      icon:        '📅',
      description: 'Consistentie is het enige dat op lange termijn verschil maakt. Hoe regelmatig sport jij?',
    },
  ],

  scoring: {
    maturityThresholds: [
      { maxScore: 25,  level: 'Startend',    colorClass: 'text-red-500',    bgClass: 'bg-red-50',    ringClass: 'ring-red-200'    },
      { maxScore: 45,  level: 'Opbouwend',   colorClass: 'text-orange-500', bgClass: 'bg-orange-50', ringClass: 'ring-orange-200' },
      { maxScore: 65,  level: 'Actief',      colorClass: 'text-yellow-500', bgClass: 'bg-yellow-50', ringClass: 'ring-yellow-200' },
      { maxScore: 82,  level: 'Gevorderd',   colorClass: 'text-teal-500',   bgClass: 'bg-teal-50',   ringClass: 'ring-teal-200'   },
      { maxScore: 100, level: 'Performance', colorClass: 'text-green-500',  bgClass: 'bg-green-50',  ringClass: 'ring-green-200'  },
    ],
  },

  maturityDescriptions: {
    'Startend':    'Je staat aan het begin of keert terug na een pauze. Dat is precies het goede moment om de juiste start te maken — met begeleiding die past bij jou, niet bij een gemiddelde.',
    'Opbouwend':   'Je hebt een basis, maar er is veel potentie dat nog niet benut wordt. Met de juiste richting en regelmaat kun je snel stappen zetten die je nu nog niet voor mogelijk houdt.',
    'Actief':      'Je traint al regelmatig en hebt een solide basis. De uitdaging nu is om slimmer te trainen — gerichter, met een plan dat past bij jouw doelen.',
    'Gevorderd':   'Je presteert boven gemiddeld en weet wat je doet. Progressie vraagt nu om specifiekere aanpak: gerichter trainen, beter herstel, en mogelijk een nieuw doel zoals HYROX.',
    'Performance': 'Je zit op een hoog niveau. Dit is het moment om te kijken wat het volgende niveau voor jou is — een race, een PR, of een specialisatie zoals HYROX-competitie.',
  },

  // Score-based routing: hoog scorende mensen hebben meer kans op HYROX-ready flag
  // De flag-detectie bepaalt de CTA in de recommendations; Calendly-routing hier is de fallback
  calendly: {
    rules: [
      { maxScore: 50,  url: CALENDLY_INTAKE },
      { maxScore: 100, url: CALENDLY_HYROX  },
    ],
  },

  // ── HYROX-routing flag ─────────────────────────────────────────────────────
  flags: [
    {
      key: 'hyrox_ready',
      detect: (dimensionScores) => {
        const mentalDrive  = dimensionScores.find(d => d.dimension === 'mental_drive')
        const cardioBase   = dimensionScores.find(d => d.dimension === 'cardio_base')
        return (
          (mentalDrive?.normalized  ?? 0) >= 60 &&
          (cardioBase?.normalized   ?? 0) >= 50
        )
      },
    },
  ],

  generateRecommendations: generateFitnessRecommendations,

  defaultCopy: {
    nl: {
      badge:       'Fitness Readiness Scan · Healthclub45',
      scoreLabel:  'Jouw Fitnessscore',
      heroHeading: 'Hoe fit ben jij écht?',
      heroCta:     'Start de scan — 3 minuten →',
    },
    en: {
      badge:       'Fitness Readiness Scan · Healthclub45',
      scoreLabel:  'Your Fitness Score',
      heroHeading: 'How fit are you really?',
      heroCta:     'Start the scan — 3 minutes →',
    },
  },
}
