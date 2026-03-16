// FILE: src/products/ai_maturity/config.ts
// ─── AI Maturity Assessment — product config ──────────────────────────────────
//
// This file wraps the existing questions, scoring constants, and recommendations
// without modifying them. It is the single source of truth for all AI-maturity-
// specific configuration that was previously hardcoded across engine.ts,
// ScoreDashboard.tsx, and LiteResultsDashboard.tsx.

import { QUESTIONS } from '@/data/questions'
import { generateRecommendations as _generateRecommendations } from '@/lib/scoring/recommendations'
import type { QuizProductConfig } from '../types'
import type { DimensionScore, ShadowAIResult } from '@/lib/scoring/engine'

// ── Calendly URLs — same as currently in ScoreDashboard.tsx ──────────────────
const CALENDLY_DISCOVERY = process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL
  ?? 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'
const CALENDLY_STRATEGY = process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL
  ?? 'https://calendly.com/markiesbpm/ai-strategy-session'

// ── Config object ─────────────────────────────────────────────────────────────

export const AI_MATURITY_CONFIG: QuizProductConfig = {
  key: 'ai_maturity',
  name: 'AI Maturity Assessment',

  questions: QUESTIONS,

  // Must match DIMENSION_WEIGHTS + DIMENSION_LABELS in engine.ts exactly
  dimensions: [
    {
      key: 'strategy_vision',
      label: 'Strategy & Vision',
      weight: 0.22,
      icon: '🧭',
      description: 'How AI is embedded in your strategic planning and leadership agenda.',
    },
    {
      key: 'governance_risk',
      label: 'Governance & Risk',
      weight: 0.22,
      icon: '🛡️',
      description: 'Policies, accountability structures, and responsible AI practices.',
    },
    {
      key: 'current_usage',
      label: 'Current Usage',
      weight: 0.16,
      icon: '⚡',
      description: 'Breadth and depth of AI tool adoption across your teams today.',
    },
    {
      key: 'data_readiness',
      label: 'Data Readiness',
      weight: 0.15,
      icon: '🗄️',
      description: 'Quality, accessibility, and governance of your data infrastructure.',
    },
    {
      key: 'talent_culture',
      label: 'Talent & Culture',
      weight: 0.15,
      icon: '🧑‍💻',
      description: 'Skills, mindset, and organisational appetite for AI adoption.',
    },
    {
      key: 'opportunity_awareness',
      label: 'Opportunity Awareness',
      weight: 0.10,
      icon: '🔍',
      description: 'Clarity on where AI creates the most value in your context.',
    },
  ],

  // Must match toMaturityLevel() in engine.ts exactly
  scoring: {
    maturityThresholds: [
      { maxScore: 20,  level: 'Unaware',       colorClass: 'text-red-500',    bgClass: 'bg-red-50',    ringClass: 'ring-red-200'    },
      { maxScore: 40,  level: 'Exploring',     colorClass: 'text-orange-500', bgClass: 'bg-orange-50', ringClass: 'ring-orange-200' },
      { maxScore: 60,  level: 'Experimenting', colorClass: 'text-yellow-500', bgClass: 'bg-yellow-50', ringClass: 'ring-yellow-200' },
      { maxScore: 80,  level: 'Scaling',       colorClass: 'text-teal-500',   bgClass: 'bg-teal-50',   ringClass: 'ring-teal-200'   },
      { maxScore: 100, level: 'Leading',       colorClass: 'text-green-500',  bgClass: 'bg-green-50',  ringClass: 'ring-green-200'  },
    ],
  },

  // Must match maturityDescription() in ScoreDashboard.tsx exactly
  maturityDescriptions: {
    Unaware:       'AI is not yet on your radar. There are significant quick-win opportunities waiting to be unlocked.',
    Exploring:     'You are beginning to explore AI. A clear strategy will help you move faster.',
    Experimenting: 'You have some AI activity underway. The challenge now is scaling what works.',
    Scaling:       'AI is embedded in key processes. Focus on governance, culture and compounding your advantage.',
    Leading:       'AI is central to how you operate and compete. Keep investing in capability and staying ahead.',
  },

  // Must match getCalendlyHref() in ScoreDashboard.tsx exactly (score < 50 → discovery)
  calendly: {
    rules: [
      { maxScore: 49,  url: CALENDLY_DISCOVERY },
      { maxScore: 100, url: CALENDLY_STRATEGY  },
    ],
  },

  // Adapter: the stored recommendations function takes ShadowAIResult directly;
  // our generic interface passes flags as a Record. We unwrap here.
  generateRecommendations: (
    dimensionScores: DimensionScore[],
    flags: Record<string, unknown>
  ) => _generateRecommendations(dimensionScores, flags.shadow_ai as ShadowAIResult),

  defaultCopy: {
    en: {
      badge:      'AI Maturity Assessment',
      scoreLabel: 'Your AI Maturity Score',
    },
    nl: {
      badge:      'AI Volwassenheidsanalyse',
      scoreLabel: 'Uw AI-volwassenheidsscore',
    },
    fr: {
      badge:      'Évaluation de la maturité IA',
      scoreLabel: 'Votre score de maturité IA',
    },
  },
}
