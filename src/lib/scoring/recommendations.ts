import { Dimension } from '@/data/questions'
import { DimensionScore, ShadowAIResult } from './engine'

export interface Recommendation {
  dimension: Dimension | 'shadow_ai'
  heading: string
  body: string
  cta: string
  priority: 'primary' | 'supporting'
}

// Locale-aware recommendation copy. Keyed by [locale][dimension].
// `en` is the source of truth and the fallback for any missing locale/dimension.
// New languages: add a sibling object under the same shape.
const RECOMMENDATION_MAP: Record<string, Record<string, Omit<Recommendation, 'priority'>>> = {
  en: {
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
  },
  nl: {
    strategy_vision: {
      dimension: 'strategy_vision',
      heading: 'Jullie AI-inspanningen missen een Noordster',
      body: 'Zonder afstemming op directieniveau riskeer je gefragmenteerde pilots — kleine successen die nooit opschalen.',
      cta: 'Boek een 1-daagse Executive AI Alignment Offsite',
    },
    data_readiness: {
      dimension: 'data_readiness',
      heading: 'Jullie AI-potentieel wordt afgeremd door de data-architectuur',
      body: 'Veel data, weinig inzicht — eerst governance op orde, dan pas serieus investeren in tools.',
      cta: 'Plan een Data Infrastructure Audit',
    },
    talent_culture: {
      dimension: 'talent_culture',
      heading: 'De menselijke factor is jullie grootste risico',
      body: 'Het team kan zich bedreigd voelen in plaats van versterkt. Bijscholing is nodig om weerstand voor te zijn.',
      cta: 'Vraag onze AI Literacy Training aan',
    },
    governance_risk: {
      dimension: 'governance_risk',
      heading: 'Jullie bewegen snel, maar zonder vangnet',
      body: 'Dat creëert serieuze aansprakelijkheid. Een Responsible AI-beleid formaliseren is urgent.',
      cta: 'Download onze Governance Framework Template',
    },
    current_usage: {
      dimension: 'current_usage',
      heading: 'Jullie hebben de strategie, maar de uitvoering blijft achter',
      body: 'Teams experimenteren nog niet genoeg om echte AI-capability op te bouwen.',
      cta: 'Boek een AI Activation Workshop',
    },
    opportunity_awareness: {
      dimension: 'opportunity_awareness',
      heading: 'In de organisatie ontbreekt een gedeeld beeld van waar AI waarde oplevert',
      body: 'Afstemming over use cases is de eerste stap naar betekenisvolle adoptie.',
      cta: 'Plan een AI Opportunity Mapping Sessie',
    },
    shadow_ai: {
      dimension: 'shadow_ai',
      heading: 'Medewerkers lopen voor op jullie beleid',
      body: 'AI-toolgebruik ligt fors voor op strategie en governance. Dat brengt reële data-, juridische en reputatierisico\'s mee. Kaders stellen is nu urgenter dan adoptie verbreden.',
      cta: 'Plan een urgente AI Governance Review',
    },
  },
  fr: {
    strategy_vision: {
      dimension: 'strategy_vision',
      heading: 'Vos efforts en IA manquent d\'une étoile polaire',
      body: 'Sans alignement de la direction, vous risquez le purgatoire des pilotes fragmentés — des petits succès qui ne passent jamais à l\'échelle.',
      cta: 'Réservez un Executive AI Alignment Offsite d\'1 jour',
    },
    data_readiness: {
      dimension: 'data_readiness',
      heading: 'Votre potentiel IA est freiné par votre architecture de données',
      body: 'Riche en données, pauvre en insights — commencez par la gouvernance avant d\'investir lourdement dans les outils.',
      cta: 'Planifiez un audit d\'infrastructure de données',
    },
    talent_culture: {
      dimension: 'talent_culture',
      heading: 'Le facteur humain est votre plus grand risque',
      body: 'Votre équipe peut se sentir menacée plutôt que renforcée. Une montée en compétences est nécessaire pour prévenir la résistance.',
      cta: 'Demandez notre formation AI Literacy',
    },
    governance_risk: {
      dimension: 'governance_risk',
      heading: 'Vous avancez vite, mais sans filet',
      body: 'Cela crée une responsabilité significative. Formaliser une politique de Responsible AI est une priorité urgente.',
      cta: 'Téléchargez notre Governance Framework Template',
    },
    current_usage: {
      dimension: 'current_usage',
      heading: 'Vous avez la stratégie, mais l\'exécution reste limitée',
      body: 'Les équipes n\'expérimentent pas encore assez pour bâtir une véritable capacité IA.',
      cta: 'Réservez un AI Activation Workshop',
    },
    opportunity_awareness: {
      dimension: 'opportunity_awareness',
      heading: 'Votre organisation n\'a pas de vision partagée de la valeur que crée l\'IA',
      body: 'L\'alignement sur les cas d\'usage est la première étape vers une adoption significative.',
      cta: 'Planifiez une session AI Opportunity Mapping',
    },
    shadow_ai: {
      dimension: 'shadow_ai',
      heading: 'Les collaborateurs vont plus vite que vos politiques',
      body: 'L\'usage d\'outils IA dépasse largement votre stratégie et gouvernance. Cela crée une exposition réelle (données, juridique, réputation). Poser des garde-fous est plus urgent qu\'élargir l\'adoption.',
      cta: 'Planifiez une AI Governance Review urgente',
    },
  },
}

/**
 * Re-localize a list of stored recommendations into the requested locale.
 * Falls back to the existing strings if no translation is registered for that
 * dimension+locale combination — keeps other products working without changes.
 */
export function localizeRecommendations(
  recommendations: Recommendation[],
  locale: string
): Recommendation[] {
  const map = RECOMMENDATION_MAP[locale]
  if (!map) return recommendations
  return recommendations.map(rec => {
    const tr = map[rec.dimension]
    if (!tr) return rec
    return { ...rec, heading: tr.heading, body: tr.body, cta: tr.cta }
  })
}

export function generateRecommendations(
  dimensionScores: DimensionScore[],
  shadowAI: ShadowAIResult
): Recommendation[] {
  // English is the source of truth: stored as-is in DB, then re-localized at
  // render time via localizeRecommendations(rec, locale). This means an old
  // result row submitted in English will switch to NL/FR when viewed under
  // /nl/results/[id] or /fr/... — no DB migration needed.
  const SRC = RECOMMENDATION_MAP.en
  const recommendations: Recommendation[] = []

  // Shadow AI at High severity overrides primary
  if (shadowAI.triggered && shadowAI.severity === 'high') {
    recommendations.push({ ...SRC.shadow_ai, priority: 'primary' })
    const sorted = [...dimensionScores].sort((a, b) => a.normalized - b.normalized)
    for (const ds of sorted.slice(0, 2)) {
      const rec = SRC[ds.dimension]
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
  if (primary && SRC[primary.dimension]) {
    recommendations.push({ ...SRC[primary.dimension], priority: 'primary' })
  }

  // Supporting: shadow AI (if triggered) + next lowest dimension
  if (shadowAI.triggered) {
    recommendations.push({ ...SRC.shadow_ai, priority: 'supporting' })
  }

  for (const ds of sorted.slice(1, shadowAI.triggered ? 2 : 3)) {
    const rec = SRC[ds.dimension]
    if (rec && recommendations.length < 3) {
      recommendations.push({ ...rec, priority: 'supporting' })
    }
  }

  return recommendations
}