// FILE: src/products/pr_maturity/config.ts
// ─── PR Volwassenheidsscan — productconfiguratie ──────────────────────────────
//
// Aangeboden door: Mareille Prevo, PR & Communicatiestrateeg
// Doelgroep: organisaties die hun PR-volwassenheid willen meten
//
// 18 vragen · 6 dimensies · 5 volwassenheidsniveaus
// Schaal: Reactief → Bewust → Gepland → Strategisch → Leidend

import { PR_QUESTIONS } from './questions'
import { generatePRRecommendations } from './recommendations'
import type { QuizProductConfig } from '../types'

// ── Calendly / contact URL — override via env var ─────────────────────────────
const CALENDLY_PR = process.env.NEXT_PUBLIC_PR_CALENDLY_URL
  ?? 'https://mareilleprevo.nl'

// ── Config object ─────────────────────────────────────────────────────────────

export const PR_MATURITY_CONFIG: QuizProductConfig = {
  key:  'pr_maturity',
  name: 'PR Volwassenheidsscan',
  headingSubject: 'PR en communicatie',

  questions: PR_QUESTIONS,

  dimensions: [
    {
      key:         'pr_strategy',
      label:       'PR Strategie & Beleid',
      weight:      0.20,
      icon:        '🎯',
      description: 'Heeft uw organisatie een heldere PR-strategie die aansluit op uw bedrijfsdoelstellingen?',
    },
    {
      key:         'media_relations',
      label:       'Mediarelaties',
      weight:      0.20,
      icon:        '📰',
      description: 'Hoe sterk zijn uw relaties met journalisten en media? Wordt u gevonden of bent u proactief?',
    },
    {
      key:         'messaging_positioning',
      label:       'Boodschap & Positionering',
      weight:      0.20,
      icon:        '💬',
      description: 'Hoe helder en consistent is uw kernboodschap — intern én extern?',
    },
    {
      key:         'crisis_communication',
      label:       'Crisiscommunicatie',
      weight:      0.20,
      icon:        '🛡️',
      description: 'Hoe goed is uw organisatie voorbereid op een crisis of reputatiedreiging?',
    },
    {
      key:         'content_visibility',
      label:       'Content & Zichtbaarheid',
      weight:      0.15,
      icon:        '📣',
      description: 'Bereikt uw organisatie de juiste mensen via de juiste kanalen?',
    },
    {
      key:         'internal_alignment',
      label:       'Interne Afstemming',
      weight:      0.05,
      icon:        '🤝',
      description: 'Zijn directie, marketing, sales en communicatie op één lijn?',
    },
  ],

  scoring: {
    maturityThresholds: [
      { maxScore: 25,  level: 'Reactief',    colorClass: 'text-red-500',    bgClass: 'bg-red-50',    ringClass: 'ring-red-200'    },
      { maxScore: 45,  level: 'Bewust',      colorClass: 'text-orange-500', bgClass: 'bg-orange-50', ringClass: 'ring-orange-200' },
      { maxScore: 65,  level: 'Gepland',     colorClass: 'text-yellow-500', bgClass: 'bg-yellow-50', ringClass: 'ring-yellow-200' },
      { maxScore: 82,  level: 'Strategisch', colorClass: 'text-teal-500',   bgClass: 'bg-teal-50',   ringClass: 'ring-teal-200'   },
      { maxScore: 100, level: 'Leidend',     colorClass: 'text-green-500',  bgClass: 'bg-green-50',  ringClass: 'ring-green-200'  },
    ],
  },

  maturityDescriptions: {
    'Reactief':    'Uw organisatie reageert op situaties als ze zich voordoen, maar heeft geen proactieve PR-aanpak. Dit is het startpunt — met de juiste begeleiding zijn er snel stappen te zetten die direct zichtbaar effect hebben.',
    'Bewust':      'U ziet het belang van PR en communicatie, maar de aanpak is nog gefragmenteerd. Er zijn kansen die nu al benut kunnen worden, met een structuur die resultaten meetbaar en herhaalbaar maakt.',
    'Gepland':     'U heeft een basis en werkt gestructureerd, maar PR is nog geen strategische businessdriver. Met de juiste focus op de zwakste dimensies kunt u communicatie omzetten in een echte reputatiemotor.',
    'Strategisch': 'PR is bij u een volwaardige strategische functie. Om het verschil te blijven maken is continue aandacht voor de zwakste schakels nodig — en het verdiepen van mediarelaties en crisisvoorbereiding.',
    'Leidend':     'U behoort tot de koplopers op PR-vlak. Uitdaging is om dit niveau te borgen en te innoveren: nieuwe platforms, nieuwe verhaalvormen en het delen van kennis versterken uw positie als thought leader.',
  },

  calendly: {
    rules: [
      { maxScore: 50,  url: CALENDLY_PR },
      { maxScore: 100, url: CALENDLY_PR },
    ],
  },

  generateRecommendations: generatePRRecommendations,

  defaultCopy: {
    nl: {
      // ── Hero ──
      badge:       'Gratis · 5 minuten · Direct inzicht',
      scoreLabel:  'Uw PR-score',
      heroHeading: 'Hoe sterk is jullie PR écht?',
      heroCta:     'Start de scan →',
      sub:         'Ontdek in 5 minuten hoe uw organisatie scoort op PR en communicatie — van strategie en mediarelaties tot crisiscommunicatie en interne afstemming.',
      authors:     'Voor directeuren, marketingmanagers en communicatieprofessionals die willen weten waar ze staan.',
      ctaSub:      '18 vragen · 5 minuten · gratis',
      hideExtendedCta: true,
      trust:       ['Gratis', '5 minuten', 'Geen account nodig', 'Direct resultaat'],
      // ── How it works ──
      howItWorksLabel:   'Hoe het werkt',
      howItWorksHeading: 'Drie stappen. Helder resultaat.',
      steps: [
        { n: '01', title: 'Beantwoord 18 vragen', desc: 'Over uw PR-strategie, mediarelaties, boodschap, crisiscommunicatie, content en interne afstemming. Eerlijk en snel — in 5 minuten klaar.' },
        { n: '02', title: 'Zie hoe uw organisatie scoort', desc: 'Een score op 6 PR-dimensies. Direct inzicht in sterktes, blinde vlekken en waar de meeste winst zit.' },
        { n: '03', title: 'Weet wat uw volgende stap is', desc: 'Concrete aanbevelingen op uw score. Gericht op de dimensies die het meeste impact hebben voor uw organisatie.' },
      ],
      // ── Dimensions ──
      dimensionsLabel:   'Wat we meten',
      dimensionsHeading: 'PR-volwassenheid in 6 dimensies',
      // ── Practitioners ──
      practitionersLabel:    'Aangeboden door',
      practitionersHeading:  'Mareille Prevo — PR-strategie die werkt.',
      practitionersSub:      'Mareille Prevo helpt organisaties hun communicatie te professionaliseren en strategisch te benutten. Deze scan is het startpunt voor een eerlijk gesprek over waar uw PR staat en wat de beste volgende stap is.',
      practitionerName:      'Mareille Prevo',
      practitionerPhoto:     '',
      practitionerInitial:   'M',
      markRole:              'PR & Communicatiestrateeg',
      markBio:               'Als onafhankelijk PR-adviseur begeleid ik organisaties bij het versterken van hun reputatie, het bouwen van mediarelaties en het ontwikkelen van een communicatiestrategie die écht werkt. Deze scan helpt mij — en u — te begrijpen waar de kansen en de blinde vlekken liggen.',
      practitionersLink:     'https://mareilleprevo.nl',
      practitionersLinkLabel:'Meer over Mareille Prevo →',
      // ── Final CTA ──
      finalCtaHeading:    'Weten waar uw organisatie staat op het gebied van PR?',
      finalCtaSub:        '5 minuten. Geen account. Direct inzicht in uw PR-volwassenheid.',
      finalCtaButton:     'Start de PR Volwassenheidsscan →',
      finalCtaButtonSub:  '18 vragen · gratis · direct resultaat',
      hideFullCta:        true,
      // ── Footer ──
      footerOwner:     'Mareille Prevo',
      footerOwnerLink: 'https://mareilleprevo.nl',
      // ── Quiz page ──
      quizTitle: 'PR Volwassenheidsscan',
      quizSub: '18 vragen · 5 minuten · Direct uw PR-score',
      quizCompanyName: 'Mareille Prevo',
      leadCaptureMode: 'minimal' as const,
      hideMarketingConsent: true,
      scoreLabelOverride: 'Uw PR-score',
      // ── Company landing page ──
      headingSubject: 'PR en communicatie',
      defaultWelcomeExternal: 'Ontdek in 5 minuten hoe uw organisatie scoort op PR en communicatie — van strategie en mediarelaties tot crisiscommunicatie en interne afstemming. Gebruik de resultaten om te prioriteren en de volgende stap te zetten.',
      ctaExternal: 'Ontdek uw PR-niveau →',
      meta: '18 vragen · 5 minuten · Vertrouwelijke resultaten',
    },
    en: {
      // ── Hero ──
      badge:       'Free · 5 minutes · Instant insight',
      scoreLabel:  'Your PR Score',
      heroHeading: 'How strong is your PR really?',
      heroCta:     'Start the assessment →',
      sub:         'Discover in 5 minutes how your organisation scores on PR and communications — from strategy and media relations to crisis communications and internal alignment.',
      authors:     'For directors, marketing managers and communications professionals who want to know where they stand.',
      ctaSub:      '18 questions · 5 minutes · free',
      hideExtendedCta: true,
      trust:       ['Free', '5 minutes', 'No account needed', 'Instant results'],
      // ── How it works ──
      howItWorksLabel:   'How it works',
      howItWorksHeading: 'Three steps. Clear results.',
      steps: [
        { n: '01', title: 'Answer 18 questions', desc: 'About your PR strategy, media relations, messaging, crisis communication, content and internal alignment. Honest and fast — done in 5 minutes.' },
        { n: '02', title: 'See how your organisation scores', desc: 'A score across 6 PR dimensions. Instant insight into strengths, blind spots and where the biggest gains are.' },
        { n: '03', title: 'Know your next step', desc: 'Concrete recommendations based on your score. Focused on the dimensions with the most impact for your organisation.' },
      ],
      // ── Dimensions ──
      dimensionsLabel:   'What we measure',
      dimensionsHeading: 'PR maturity in 6 dimensions',
      // ── Practitioners ──
      practitionersLabel:    'Offered by',
      practitionersHeading:  'Mareille Prevo — PR strategy that works.',
      practitionersSub:      'Mareille Prevo helps organisations professionalise their communications and use them strategically. This scan is the starting point for an honest conversation about where your PR stands and what the best next step is.',
      practitionerName:      'Mareille Prevo',
      practitionerPhoto:     '',
      practitionerInitial:   'M',
      markRole:              'PR & Communications Strategist',
      markBio:               'As an independent PR advisor, I help organisations strengthen their reputation, build media relationships and develop a communications strategy that actually works. This scan helps me — and you — understand where the opportunities and blind spots are.',
      practitionersLink:     'https://mareilleprevo.nl',
      practitionersLinkLabel:'More about Mareille Prevo →',
      // ── Final CTA ──
      finalCtaHeading:    'Want to know where your organisation stands on PR?',
      finalCtaSub:        '5 minutes. No account. Instant insight into your PR maturity.',
      finalCtaButton:     'Start the PR Maturity Assessment →',
      finalCtaButtonSub:  '18 questions · free · instant results',
      hideFullCta:        true,
      // ── Footer ──
      footerOwner:     'Mareille Prevo',
      footerOwnerLink: 'https://mareilleprevo.nl',
      // ── Quiz page ──
      quizTitle: 'PR Maturity Assessment',
      quizSub: '18 questions · 5 minutes · Instant your PR score',
      quizCompanyName: 'Mareille Prevo',
      leadCaptureMode: 'minimal' as const,
      hideMarketingConsent: true,
      scoreLabelOverride: 'Your PR Score',
      // ── Company landing page ──
      headingSubject: 'PR and communications',
      defaultWelcomeExternal: 'Discover in 5 minutes how your organisation scores on PR and communications — from strategy and media relations to crisis communication and internal alignment. Use the results to prioritise and plan your next steps.',
      ctaExternal: 'Discover your PR level →',
      meta: '18 questions · 5 minutes · Confidential results',
    },
    fr: {
      // ── Hero ──
      badge:       'Gratuit · 5 minutes · Résultats immédiats',
      scoreLabel:  'Votre score RP',
      heroHeading: 'Où en est vraiment votre organisation en matière de RP ?',
      heroCta:     'Démarrer l\'évaluation →',
      sub:         'Découvrez en 5 minutes comment votre organisation se positionne en matière de RP et de communication — de la stratégie aux relations médias, en passant par la gestion de crise et l\'alignement interne.',
      authors:     'Pour les dirigeants, directeurs marketing et professionnels de la communication qui veulent savoir où ils en sont.',
      ctaSub:      '18 questions · 5 minutes · gratuit',
      hideExtendedCta: true,
      trust:       ['Gratuit', '5 minutes', 'Sans compte', 'Résultats immédiats'],
      // ── Quiz page ──
      quizTitle: 'Évaluation de maturité RP',
      quizSub: '18 questions · 5 minutes · Votre score RP immédiat',
      quizCompanyName: 'Mareille Prevo',
      leadCaptureMode: 'minimal' as const,
      hideMarketingConsent: true,
      scoreLabelOverride: 'Votre score RP',
      // ── Company landing page ──
      headingSubject: 'RP et la communication',
      defaultWelcomeExternal: 'Découvrez en 5 minutes comment votre organisation se positionne en matière de RP et de communication — de la stratégie et des relations médias à la gestion de crise et à l\'alignement interne. Utilisez les résultats pour prioriser et planifier vos prochaines étapes.',
      ctaExternal: 'Découvrez votre niveau en RP →',
      meta: '18 questions · 5 minutes · Réponses confidentielles',
      // ── Practitioners ──
      practitionerName:      'Mareille Prevo',
      practitionerInitial:   'M',
      markRole:              'Stratège RP & Communication',
      // ── Footer ──
      footerOwner:     'Mareille Prevo',
      footerOwnerLink: 'https://mareilleprevo.nl',
      hideFullCta: true,
    },
  },
}
