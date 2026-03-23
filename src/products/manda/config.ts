// FILE: src/products/manda/config.ts
// ─── AI & M&A Readiness Assessment — product config ──────────────────────────
//
// This product is designed for Hofstede & de Kock.
// It measures organisational readiness across 7 dimensions:
// Leadership, Commercial Engine, AI & Digital, Operational Scale,
// Commercial Narrative, Value Creation, and Psychological Safety.
//
// Four entry points / roles:
//   - Company Owner / CEO (preparing for sale, merger, investment)
//   - PE / VC Investor (due diligence, portfolio assessment)
//   - Portfolio Company (post-close, value creation phase)
//   - M&A Advisor / Dealmaker (adding depth to deal analysis)

import { MANDA_QUESTIONS } from '@/data/MandaQuestions'
import type { QuizProductConfig, DimensionScore } from '../types'
import type { Recommendation } from '@/lib/scoring/recommendations'

// ── Calendly URLs ─────────────────────────────────────────────────────────────
// Score < 50 → Due Diligence / Quick Scan conversation (urgent)
// Score ≥ 50 → Value Creation / Exit Readiness conversation (strategic)
const CALENDLY_DD  = process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL
  ?? 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'
const CALENDLY_VC  = process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL
  ?? 'https://calendly.com/markiesbpm/ai-strategy-session'

// ── Recommendations map ───────────────────────────────────────────────────────
type MandaRecommendation = Omit<Recommendation, 'priority' | 'dimension'> & {
  dimension: string
}

const RECOMMENDATION_MAP: Record<string, MandaRecommendation> = {
  leadership_change: {
    dimension: 'leadership_change',
    heading: 'Your leadership structure is a deal risk',
    body: 'Buyers and investors scrutinise leadership depth and stability first. A single point of failure at the top, or misaligned management teams, are standard valuation discounts — and in some cases, deal blockers.',
    cta: 'Book a Leadership Structure Review with Sandra',
  },
  commercial_engine: {
    dimension: 'commercial_engine',
    heading: 'Your commercial engine has leakage buyers can see',
    body: 'Unpredictable revenue, unclear ICP, or deteriorating unit economics signals a business that has not yet found its scale efficiency. This translates directly into a lower multiple or a longer value creation timeline.',
    cta: 'Book a Commercial Engine Scan with Mark',
  },
  ai_digital: {
    dimension: 'ai_digital',
    heading: 'Your AI & digital maturity is below investor expectations',
    body: 'In 2025, acquirers factor AI readiness into their valuation model. Gaps in AI adoption, poor data infrastructure, or tech debt that nobody understands translate directly into lower multiples and higher integration risk.',
    cta: 'Get your AI Readiness Report from Mark',
  },
  operational_scale: {
    dimension: 'operational_scale',
    heading: 'Your operations are not transfer-ready',
    body: 'Key-person dependency, undocumented processes, and messy records are the most common reasons deals slow down in due diligence — or fall apart entirely. Fix this before the buyer finds it.',
    cta: 'Book an Operational DD Prep with Sandra',
  },
  commercial_narrative: {
    dimension: 'commercial_narrative',
    heading: 'Your story won\'t survive the room',
    body: 'Investors don\'t just buy businesses — they buy narratives. If you can\'t articulate your growth case with concrete evidence and a credible financial model, you are negotiating from weakness.',
    cta: 'Book a Commercial Narrative Workshop with Mark',
  },
  value_creation: {
    dimension: 'value_creation',
    heading: 'You\'re leaving value on the table',
    body: 'The most valuable companies entering a deal have a clear, quantified value creation roadmap. Vague potential gets discounted. Specific, evidence-based plans get rewarded with a premium multiple.',
    cta: 'Build your Value Creation Plan with Hofstede & de Kock',
  },
  psychological_safety: {
    dimension: 'psychological_safety',
    heading: 'Your culture is a hidden liability',
    body: 'Low psychological safety predicts post-deal integration failure. Teams that don\'t surface problems become a liability for the buyer. This is the risk every deal misses — until it\'s too late.',
    cta: 'Book a Culture & Change Readiness Assessment with Sandra',
  },
}

function generateMandaRecommendations(
  dimensionScores: DimensionScore[],
  _flags: Record<string, unknown>
): Recommendation[] {
  // Sort dimensions by normalised score ascending (weakest first)
  const sorted = [...dimensionScores].sort((a, b) => a.normalized - b.normalized)

  const recommendations: Recommendation[] = []

  for (const ds of sorted) {
    const rec = RECOMMENDATION_MAP[ds.dimension]
    if (!rec) continue

    // Only include if score is below 65 (room for meaningful improvement)
    if (ds.normalized >= 65) continue

    recommendations.push({
      dimension: ds.dimension as Recommendation['dimension'],
      heading: rec.heading,
      body: rec.body,
      cta: rec.cta,
      priority: recommendations.length === 0 ? 'primary' : 'supporting',
    })

    if (recommendations.length >= 4) break
  }

  // Always include at least one recommendation
  if (recommendations.length === 0 && sorted.length > 0) {
    const weakest = sorted[0]
    const rec = RECOMMENDATION_MAP[weakest.dimension]
    if (rec) {
      recommendations.push({
        dimension: weakest.dimension as Recommendation['dimension'],
        heading: rec.heading,
        body: rec.body,
        cta: rec.cta,
        priority: 'primary',
      })
    }
  }

  return recommendations
}

// ── Config object ─────────────────────────────────────────────────────────────

export const MANDA_CONFIG: QuizProductConfig = {
  key: 'manda_readiness',
  name: 'AI & M&A Readiness Assessment',

  questions: MANDA_QUESTIONS,

  dimensions: [
    {
      key: 'leadership_change',
      label: 'Leadership & Change Readiness',
      weight: 0.18,
      icon: '⚡',
      description: 'Decision-making clarity, succession depth, change track record, and strategic alignment.',
    },
    {
      key: 'commercial_engine',
      label: 'Commercial Engine',
      weight: 0.18,
      icon: '📈',
      description: 'Revenue predictability, ICP sharpness, unit economics health, and sales scalability.',
    },
    {
      key: 'ai_digital',
      label: 'AI & Digital Capability',
      weight: 0.15,
      icon: '🤖',
      description: 'AI adoption depth, data infrastructure quality, tech debt management, and digital culture.',
    },
    {
      key: 'operational_scale',
      label: 'Operational Scalability',
      weight: 0.15,
      icon: '⚙️',
      description: 'Process documentation, key-person risk, transfer-readiness, and financial record quality.',
    },
    {
      key: 'commercial_narrative',
      label: 'Commercial Narrative',
      weight: 0.15,
      icon: '🎯',
      description: 'Value proposition strength, evidence quality, financial model credibility, and brand position.',
    },
    {
      key: 'value_creation',
      label: 'Value Creation Potential',
      weight: 0.12,
      icon: '💎',
      description: 'Growth opportunity clarity, quick-win backlog, AI upside, and execution capacity.',
    },
    {
      key: 'psychological_safety',
      label: 'Psychological Safety & Culture',
      weight: 0.07,
      icon: '🛡️',
      description: 'Team candour, leadership trust, information flow, and change appetite.',
    },
  ],

  // Deal-readiness maturity levels (replaces AI maturity levels)
  scoring: {
    maturityThresholds: [
      { maxScore: 20, level: 'At Risk',      colorClass: 'text-red-600',    bgClass: 'bg-red-50',    ringClass: 'ring-red-200'    },
      { maxScore: 40, level: 'Pre-Mature',   colorClass: 'text-orange-500', bgClass: 'bg-orange-50', ringClass: 'ring-orange-200' },
      { maxScore: 60, level: 'Emerging',     colorClass: 'text-yellow-600', bgClass: 'bg-yellow-50', ringClass: 'ring-yellow-200' },
      { maxScore: 80, level: 'Deal-Ready',   colorClass: 'text-teal-600',   bgClass: 'bg-teal-50',   ringClass: 'ring-teal-200'   },
      { maxScore: 100, level: 'Premium',     colorClass: 'text-green-600',  bgClass: 'bg-green-50',  ringClass: 'ring-green-200'  },
    ],
  },

  maturityDescriptions: {
    'At Risk':    'Significant gaps across multiple dimensions that would block or heavily discount a deal. Address foundational issues before approaching any transaction.',
    'Pre-Mature': 'The business has potential but needs 12–18 months of focused preparation. Prioritise the weakest dimensions before entering any M&A or investment process.',
    'Emerging':   'A deal is possible but value is being left on the table. Targeted improvements in 2–3 key areas could meaningfully improve your outcome.',
    'Deal-Ready': 'Well-positioned for a transaction. Focus on sharpening your narrative and closing any remaining operational gaps for maximum value.',
    'Premium':    'You are in a strong negotiating position. Your fundamentals support a premium multiple — protect them and tell your story compellingly.',
  },

  calendly: {
    rules: [
      { maxScore: 49,  url: CALENDLY_DD },   // At Risk / Pre-Mature / Emerging → DD / Quick Scan conversation
      { maxScore: 100, url: CALENDLY_VC  },   // Deal-Ready / Premium → Value Creation / Exit Readiness
    ],
  },

  generateRecommendations: generateMandaRecommendations,

  defaultCopy: {
    en: {
      badge:       'AI & M&A Readiness',
      scoreLabel:  'Your Readiness Score',
      heroHeading: 'Does your company survive a buyer\'s lens?',
    },
    nl: {
      badge:       'AI & M&A Gereedheid',
      scoreLabel:  'Uw gereedheidscore',
      heroHeading: 'Overleeft uw bedrijf de blik van een koper?',
    },
    fr: {
      badge:       'Maturité IA & M&A',
      scoreLabel:  'Votre score de maturité',
      heroHeading: 'Votre entreprise résiste-t-elle à l\'œil d\'un acheteur ?',
    },
  },
}
