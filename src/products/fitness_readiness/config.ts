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
        const mentalDrive  = dimensionScores.find(d => (d.dimension as string) === 'mental_drive')
        const cardioBase   = dimensionScores.find(d => (d.dimension as string) === 'cardio_base')
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
      // ── Hero ──
      badge:       'Fitness Readiness Scan · Healthclub45',
      scoreLabel:  'Jouw Fitnessscore',
      heroHeading: 'Hoe fit ben jij écht?',
      heroCta:     'Start de scan →',
      sub:         'Ontdek in 3 minuten je sterkste en zwakste punten — van cardio en kracht tot voeding en mentale drive.',
      authors:     'Aangeboden door Healthclub45 · voor leden én niet-leden',
      ctaSub:      '18 vragen · 3 minuten · gratis',
      hideExtendedCta: true,
      trust:       ['Gratis', '3 minuten', 'Geen account nodig', 'Direct resultaat'],
      // ── Nav ──
      navSub:      'healthclub45.nl →',
      navSubHref:  'https://healthclub45.nl',
      // ── How it works ──
      howItWorksLabel:   'Hoe het werkt',
      howItWorksHeading: 'Drie stappen naar inzicht',
      steps: [
        { n: '01', title: 'Beantwoord 18 vragen', desc: 'Over je conditie, kracht, voeding, herstel en motivatie. Eerlijk en snel — in 3 minuten klaar.' },
        { n: '02', title: 'Zie je fitnessscore', desc: 'Je krijgt een score op 6 dimensies. Directe inzage in je sterktes, zwaktes en waar de grootste winst zit.' },
        { n: '03', title: 'Ontvang persoonlijk advies', desc: 'Op basis van je score krijg je een concreet startpunt en weet je wat je volgende stap is.' },
      ],
      // ── Preview ──
      previewLabel:        'Jouw resultaat',
      previewHeading:      'Zo ziet jouw scan eruit',
      previewSub:          'Een score op 6 fitnessdimensies — overzichtelijk, eerlijk en direct bruikbaar.',
      previewExampleLevel: 'Actief',
      // ── Dimensions ──
      dimensionsLabel:   'Wat we meten',
      dimensionsHeading: 'Jouw fitness in 6 dimensies',
      // ── Practitioners ──
      practitionersSub:      'Healthclub45 biedt je de tools en begeleiding om het meeste uit je training te halen — wat je doel ook is.',
      practitionerName:      'Healthclub45',
      practitionerPhoto:     'https://www.healthclub45.nl/assets/files/healthclub45-logo.png',
      practitionerInitial:   'H',
      markRole:              'Fitness & HYROX · Nieuw-Vennep',
      markBio:               'Bij Healthclub45 draait het om meer dan bewegen. We willen weten hoe jij ervoor staat — zodat we je kunnen begeleiden op een manier die echt bij je past. Of je nu beginner bent of klaar voor HYROX.',
      practitionersLink:     'https://healthclub45.nl',
      practitionersLinkLabel:'Bezoek healthclub45.nl →',
      // ── Final CTA ──
      finalCtaHeading:    'Wil jij weten hoe fit jij écht bent?',
      finalCtaSub:        'Doe de scan. 3 minuten. Geen account nodig. Direct inzicht in jouw fitnessniveau.',
      finalCtaButton:     'Start de Fitness Scan →',
      finalCtaButtonSub:  '18 vragen · gratis · direct resultaat',
      hideFullCta:        true,
      // ── Footer ──
      footerOwner:     'Healthclub45',
      footerOwnerLink: 'https://healthclub45.nl',
    },
    en: {
      // ── Hero ──
      badge:       'Fitness Readiness Scan · Healthclub45',
      scoreLabel:  'Your Fitness Score',
      heroHeading: 'How fit are you really?',
      heroCta:     'Start the scan →',
      sub:         'Discover your strongest and weakest areas in 3 minutes — from cardio and strength to nutrition and mental drive.',
      authors:     'Offered by Healthclub45 · for members and non-members',
      ctaSub:      '18 questions · 3 minutes · free',
      hideExtendedCta: true,
      trust:       ['Free', '3 minutes', 'No account needed', 'Instant results'],
      // ── Nav ──
      navSub:      'healthclub45.nl →',
      navSubHref:  'https://healthclub45.nl',
      // ── How it works ──
      howItWorksLabel:   'How it works',
      howItWorksHeading: 'Three steps to insight',
      steps: [
        { n: '01', title: 'Answer 18 questions', desc: 'About your fitness, strength, nutrition, recovery and motivation. Honest and fast — done in 3 minutes.' },
        { n: '02', title: 'See your fitness score', desc: 'Across 6 dimensions. Direct insight into your strengths, weaknesses and where the biggest gains are.' },
        { n: '03', title: 'Get personal advice', desc: 'Based on your score you receive a concrete starting point and know exactly what your next step is.' },
      ],
      // ── Preview ──
      previewLabel:        'Your results',
      previewHeading:      'This is what your scan looks like',
      previewSub:          'A score across 6 fitness dimensions — clear, honest and immediately actionable.',
      previewExampleLevel: 'Active',
      // ── Dimensions ──
      dimensionsLabel:   'What we measure',
      dimensionsHeading: 'Your fitness in 6 dimensions',
      // ── Practitioners ──
      practitionersSub:      'Healthclub45 provides the tools and coaching to get the most out of your training — whatever your goal.',
      practitionerName:      'Healthclub45',
      practitionerPhoto:     'https://www.healthclub45.nl/assets/files/healthclub45-logo.png',
      practitionerInitial:   'H',
      markRole:              'Fitness & HYROX · Nieuw-Vennep',
      markBio:               'At Healthclub45, it\'s about more than just moving. We want to know where you stand — so we can guide you in a way that truly fits you. Whether you\'re a beginner or ready for HYROX.',
      practitionersLink:     'https://healthclub45.nl',
      practitionersLinkLabel:'Visit healthclub45.nl →',
      // ── Final CTA ──
      finalCtaHeading:    'Want to know how fit you really are?',
      finalCtaSub:        'Take the scan. 3 minutes. No account needed. Instant insight into your fitness level.',
      finalCtaButton:     'Start the Fitness Scan →',
      finalCtaButtonSub:  '18 questions · free · instant results',
      hideFullCta:        true,
      // ── Footer ──
      footerOwner:     'Healthclub45',
      footerOwnerLink: 'https://healthclub45.nl',
    },
  },
}
