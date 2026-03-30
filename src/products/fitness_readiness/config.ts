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
      badge:       'Gratis · 3 minuten · Direct resultaat',
      scoreLabel:  'Jouw Fitnessscore',
      heroHeading: 'Hoe fit ben jij écht?',
      heroCta:     'Start de scan →',
      sub:         'Ontdek in 3 minuten je sterkste en zwakste punten. Van cardio en kracht tot voeding, herstel en mentale drive.',
      authors:     'Voor iedereen die serieuzer wil worden met zijn of haar gezondheid — leden en niet-leden welkom.',
      ctaSub:      '18 vragen · 3 minuten · gratis',
      hideExtendedCta: true,
      trust:       ['Gratis', '3 minuten', 'Geen account nodig', 'Direct resultaat'],
      // ── Nav ──
      navSub:      'healthclub45.nl →',
      navSubHref:  'https://healthclub45.nl',
      // ── How it works ──
      howItWorksLabel:   'Hoe het werkt',
      howItWorksHeading: 'Drie stappen. Geen gedoe.',
      steps: [
        { n: '01', title: 'Beantwoord 18 vragen', desc: 'Over je conditie, kracht, voeding, herstel en motivatie. Eerlijk en snel — in 3 minuten klaar.' },
        { n: '02', title: 'Zie waar je staat', desc: 'Een score op 6 fitnessdimensies. Direct inzicht in je sterktes, je zwaktes en waar de meeste winst zit.' },
        { n: '03', title: 'Weet wat je volgende stap is', desc: 'Concrete aanbevelingen op jouw score. Geen generiek advies, maar gericht op wat voor jóu het verschil maakt.' },
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
      practitionersLabel:    'Aangeboden door',
      practitionersHeading:  'Healthclub45 — meer dan bewegen.',
      practitionersSub:      'Bij Healthclub45 geloven we dat échte voortgang begint met eerlijk inzicht. Deze scan is het startpunt — of je nu net begint, terugkomt na een pauze, of klaar bent voor het volgende niveau.',
      practitionerName:      'Healthclub45',
      practitionerPhoto:     'https://www.healthclub45.nl/assets/files/logo-zwart.png',
      practitionerInitial:   'H',
      markRole:              'Fitness & HYROX · Nieuw-Vennep',
      markBio:               'We begeleiden mensen die serieuzer willen worden met hun gezondheid. Ongeacht startpunt of doel. De scan helpt ons — en jou — te begrijpen waar je staat en wat de beste volgende stap is.',
      practitionersLink:     'https://healthclub45.nl',
      practitionersLinkLabel:'Meer over Healthclub45 →',
      // ── Final CTA ──
      finalCtaHeading:    'Wil jij weten hoe fit jij écht bent?',
      finalCtaSub:        '3 minuten. Geen account. Geen gedoe. Direct inzicht in jouw fitnessniveau.',
      finalCtaButton:     'Start de Fitness Scan →',
      finalCtaButtonSub:  '18 vragen · gratis · direct resultaat',
      hideFullCta:        true,
      // ── Footer ──
      footerOwner:     'Healthclub45',
      footerOwnerLink: 'https://healthclub45.nl',
      // ── Quiz page ──
      quizTitle: 'Fitness Readiness Scan',
      quizSub: '18 vragen · 3 minuten · Direct jouw fitnessscore',
      quizLogoUrl: 'https://www.healthclub45.nl/assets/files/logo-zwart.png',
      quizCompanyName: 'Healthclub45',
      leadCaptureMode: 'minimal' as const,
      showCallbackOption: true,
      hideMarketingConsent: true,
      scoreLabelOverride: 'Jouw Fitnessscore',
    },
    en: {
      // ── Hero ──
      badge:       'Free · 3 minutes · Instant results',
      scoreLabel:  'Your Fitness Score',
      heroHeading: 'How fit are you really?',
      heroCta:     'Start the scan →',
      sub:         'Discover your strongest and weakest areas in 3 minutes. From cardio and strength to nutrition, recovery and mental drive.',
      authors:     'For anyone who wants to get serious about their health — members and non-members welcome.',
      ctaSub:      '18 questions · 3 minutes · free',
      hideExtendedCta: true,
      trust:       ['Free', '3 minutes', 'No account needed', 'Instant results'],
      // ── Nav ──
      navSub:      'healthclub45.nl →',
      navSubHref:  'https://healthclub45.nl',
      // ── How it works ──
      howItWorksLabel:   'How it works',
      howItWorksHeading: 'Three steps. No fuss.',
      steps: [
        { n: '01', title: 'Answer 18 questions', desc: 'About your fitness, strength, nutrition, recovery and motivation. Honest and fast — done in 3 minutes.' },
        { n: '02', title: 'See where you stand', desc: 'A score across 6 fitness dimensions. Instant insight into your strengths, weaknesses and where the biggest gains are.' },
        { n: '03', title: 'Know your next step', desc: 'Concrete recommendations based on your score. Not generic advice — focused on what makes a difference for you.' },
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
      practitionersLabel:    'Offered by',
      practitionersHeading:  'Healthclub45 — more than just moving.',
      practitionersSub:      'At Healthclub45 we believe real progress starts with honest insight. This scan is the starting point — whether you\'re just beginning, returning after a break, or ready for the next level.',
      practitionerName:      'Healthclub45',
      practitionerPhoto:     'https://www.healthclub45.nl/assets/files/logo-zwart.png',
      practitionerInitial:   'H',
      markRole:              'Fitness & HYROX · Nieuw-Vennep',
      markBio:               'We guide people who want to get serious about their health. Whatever your starting point or goal. This scan helps us — and you — understand where you stand and what the best next step is.',
      practitionersLink:     'https://healthclub45.nl',
      practitionersLinkLabel:'More about Healthclub45 →',
      // ── Final CTA ──
      finalCtaHeading:    'Want to know how fit you really are?',
      finalCtaSub:        '3 minutes. No account. No fuss. Instant insight into your fitness level.',
      finalCtaButton:     'Start the Fitness Scan →',
      finalCtaButtonSub:  '18 questions · free · instant results',
      hideFullCta:        true,
      // ── Footer ──
      footerOwner:     'Healthclub45',
      footerOwnerLink: 'https://healthclub45.nl',
      // ── Quiz page ──
      quizTitle: 'Fitness Readiness Scan',
      quizSub: '18 questions · 3 minutes · Instant your fitness score',
      quizLogoUrl: 'https://www.healthclub45.nl/assets/files/logo-zwart.png',
      quizCompanyName: 'Healthclub45',
      leadCaptureMode: 'minimal' as const,
      showCallbackOption: true,
      hideMarketingConsent: true,
      scoreLabelOverride: 'Your Fitness Score',
    },
  },
}
