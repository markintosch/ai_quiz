import { Dimension } from '@/data/questions'
import { DimensionScore, ShadowAIResult } from './engine'

export interface Recommendation {
  dimension: Dimension | 'shadow_ai'
  heading: string
  body: string
  cta: string
  priority: 'primary' | 'supporting'
}

const RECOMMENDATION_MAP: Record<string, Omit<Recommendation, 'priority'>> = {
  strategy_vision: {
    dimension: 'strategy_vision',
    heading: 'Your AI efforts lack a North Star',
    body: 'Without leadership alignment, you risk fragmented pilot purgatory where small wins never scale.',
    cta: 'Book a 1-day Executive AI Alignment Offsite',
  },
  data_readiness: {
    dimension: 'data_readiness',
    heading: 'Your AI potential is bottlenecked by your data architecture',
    body: 'You are data rich, insight poor — focus on governance before heavy tool investment.',
    cta: 'Schedule a Data Infrastructure Audit',
  },
  talent_culture: {
    dimension: 'talent_culture',
    heading: 'The human factor is your biggest risk',
    body: 'Your team may feel threatened rather than empowered. Upskilling is required to prevent resistance.',
    cta: 'Inquire about our AI Literacy Training',
  },
  governance_risk: {
    dimension: 'governance_risk',
    heading: 'You are moving fast but without a safety net',
    body: 'This creates significant liability. Formalizing a Responsible AI policy is an urgent priority.',
    cta: 'Download our Governance Framework Template',
  },
  current_usage: {
    dimension: 'current_usage',
    heading: 'You have the strategy but limited execution',
    body: 'Your teams are not yet experimenting enough to build real AI capability.',
    cta: 'Book an AI Activation Workshop',
  },
  opportunity_awareness: {
    dimension: 'opportunity_awareness',
    heading: 'Your organization lacks a shared view of where AI creates value',
    body: 'Alignment on use cases is the first step to meaningful adoption.',
    cta: 'Schedule an AI Opportunity Mapping Session',
  },
  shadow_ai: {
    dimension: 'shadow_ai',
    heading: 'Employees are outrunning your policies',
    body: 'AI tool use is significantly ahead of your strategy and governance. This creates real data, legal and reputational exposure. Establishing guardrails is more urgent than expanding adoption.',
    cta: 'Schedule an Urgent AI Governance Review',
  },
}

export function generateRecommendations(
  dimensionScores: DimensionScore[],
  shadowAI: ShadowAIResult
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Shadow AI at High severity overrides primary
  if (shadowAI.triggered && shadowAI.severity === 'high') {
    recommendations.push({ ...RECOMMENDATION_MAP.shadow_ai, priority: 'primary' })
    const sorted = [...dimensionScores].sort((a, b) => a.normalized - b.normalized)
    for (const ds of sorted.slice(0, 2)) {
      const rec = RECOMMENDATION_MAP[ds.dimension]
      if (rec) recommendations.push({ ...rec, priority: 'supporting' })
    }
    return recommendations
  }

  // Primary = lowest scoring dimension
  // Tiebreak: strategy_vision first, then governance_risk
  const TIEBREAK_ORDER: Dimension[] = [
    'strategy_vision', 'governance_risk', 'data_readiness',
    'talent_culture', 'current_usage', 'opportunity_awareness',
  ]

  const sorted = [...dimensionScores].sort((a, b) => {
    if (a.normalized !== b.normalized) return a.normalized - b.normalized
    return TIEBREAK_ORDER.indexOf(a.dimension) - TIEBREAK_ORDER.indexOf(b.dimension)
  })

  const primary = sorted[0]
  if (primary && RECOMMENDATION_MAP[primary.dimension]) {
    recommendations.push({ ...RECOMMENDATION_MAP[primary.dimension], priority: 'primary' })
  }

  // Supporting: shadow AI (if triggered) + next lowest dimension
  if (shadowAI.triggered) {
    recommendations.push({ ...RECOMMENDATION_MAP.shadow_ai, priority: 'supporting' })
  }

  for (const ds of sorted.slice(1, shadowAI.triggered ? 2 : 3)) {
    const rec = RECOMMENDATION_MAP[ds.dimension]
    if (rec && recommendations.length < 3) {
      recommendations.push({ ...rec, priority: 'supporting' })
    }
  }

  return recommendations
}