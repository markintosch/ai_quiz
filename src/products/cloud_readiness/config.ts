// FILE: src/products/cloud_readiness/config.ts
// ─── Cloud Readiness Assessment — product config ──────────────────────────────
//
// White-label product for TrueFullstaq (and future cloud partners).
// 30 questions · 6 dimensions · 5 maturity levels · EN only (NL/FR via CMS).

import { CLOUD_QUESTIONS } from './questions'
import { generateCloudRecommendations } from './recommendations'
import type { QuizProductConfig } from '../types'
import type { DimensionScore } from '@/lib/scoring/engine'

// ── Calendly URLs — override via env vars per deployment ─────────────────────
const CALENDLY_INTRO = process.env.NEXT_PUBLIC_CLOUD_CALENDLY_INTRO_URL
  ?? process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL
  ?? 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

const CALENDLY_STRATEGY = process.env.NEXT_PUBLIC_CLOUD_CALENDLY_STRATEGY_URL
  ?? process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL
  ?? 'https://calendly.com/markiesbpm/ai-strategy-session'

// ── Config object ─────────────────────────────────────────────────────────────

export const CLOUD_READINESS_CONFIG: QuizProductConfig = {
  key: 'cloud_readiness',
  name: 'Cloud Readiness Assessment',

  questions: CLOUD_QUESTIONS,

  dimensions: [
    {
      key: 'cloud_strategy',
      label: 'Cloud Strategy',
      weight: 0.22,
      icon: '🧭',
      description: 'How cloud investment is aligned with business goals and leadership.',
    },
    {
      key: 'cloud_adoption',
      label: 'Cloud Adoption',
      weight: 0.22,
      icon: '☁️',
      description: 'The breadth and maturity of your current cloud workloads.',
    },
    {
      key: 'infrastructure_arch',
      label: 'Infrastructure & Architecture',
      weight: 0.16,
      icon: '🏗️',
      description: 'IaC, containers, scalability, and architectural resilience.',
    },
    {
      key: 'devops_automation',
      label: 'DevOps & Automation',
      weight: 0.15,
      icon: '⚙️',
      description: 'CI/CD maturity, deployment frequency, and operational automation.',
    },
    {
      key: 'security_compliance',
      label: 'Security & Compliance',
      weight: 0.15,
      icon: '🛡️',
      description: 'IAM, data protection, policy enforcement, and incident readiness.',
    },
    {
      key: 'finops_cost',
      label: 'FinOps & Cost',
      weight: 0.10,
      icon: '📊',
      description: 'Cost visibility, forecasting accuracy, and spend accountability.',
    },
  ],

  scoring: {
    maturityThresholds: [
      { maxScore: 20,  level: 'Ad Hoc',      colorClass: 'text-red-500',    bgClass: 'bg-red-50',    ringClass: 'ring-red-200'    },
      { maxScore: 40,  level: 'Developing',  colorClass: 'text-orange-500', bgClass: 'bg-orange-50', ringClass: 'ring-orange-200' },
      { maxScore: 60,  level: 'Defined',     colorClass: 'text-yellow-500', bgClass: 'bg-yellow-50', ringClass: 'ring-yellow-200' },
      { maxScore: 80,  level: 'Managed',     colorClass: 'text-teal-500',   bgClass: 'bg-teal-50',   ringClass: 'ring-teal-200'   },
      { maxScore: 100, level: 'Optimising',  colorClass: 'text-green-500',  bgClass: 'bg-green-50',  ringClass: 'ring-green-200'  },
    ],
  },

  maturityDescriptions: {
    'Ad Hoc':     'Cloud is used opportunistically with no consistent approach. Significant risk and wasted spend are likely at this stage.',
    Developing:   'Cloud adoption is underway but lacks strategy, governance, or technical rigour. A clear foundation is the priority.',
    Defined:      'A solid cloud foundation is in place. The focus now is consistency, automation, and removing remaining manual bottlenecks.',
    Managed:      'Cloud is embedded in how you operate. Optimising costs, security posture, and developer experience will compound your advantage.',
    Optimising:   'Cloud-native operations are your default. Staying ahead means continuous FinOps discipline, platform evolution, and talent development.',
  },

  calendly: {
    rules: [
      { maxScore: 49,  url: CALENDLY_INTRO    },
      { maxScore: 100, url: CALENDLY_STRATEGY },
    ],
  },

  generateRecommendations: (
    dimensionScores: DimensionScore[],
    _flags: Record<string, unknown>
  ) => generateCloudRecommendations(dimensionScores),

  defaultCopy: {
    en: {
      badge:      'Cloud Readiness Assessment',
      scoreLabel: 'Your Cloud Readiness Score',
    },
    nl: {
      badge:      'Cloud Readiness Assessment',
      scoreLabel: 'Uw Cloud Readiness Score',
    },
  },
}
