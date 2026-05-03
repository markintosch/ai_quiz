import { Dimension } from '@/data/questions'
import { DimensionScore, ShadowAIResult } from './engine'

export interface Recommendation {
  /**
   * Source dimension or override key. Override keys are not real dimensions —
   * they tag recommendations injected post-scoring (CEO MT-sessie, corporate
   * training & team-dev). Used for tracking + locale lookup.
   */
  dimension: Dimension | 'shadow_ai' | 'ceo_override' | 'corporate_override'
  heading: string
  body: string
  cta: string
  priority: 'primary' | 'supporting'
}

/** Context that may override recommendation order/content based on respondent role + company size. */
export interface RecommendationContext {
  jobTitle?: string | null
  companySize?: string | null
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

// ── Context overrides (role + company-size) ─────────────────────────────────
// Injected after the dimension-based recommendations are picked.
// The override map is locale-aware too — same shape as RECOMMENDATION_MAP.
const OVERRIDE_RECOMMENDATION_MAP: Record<string, Record<'ceo_override' | 'corporate_override', Omit<Recommendation, 'priority'>>> = {
  en: {
    ceo_override: {
      dimension: 'ceo_override',
      heading: 'Align your leadership team on AI in a single working session',
      body: 'As CEO, the highest-leverage move is to bring your management team together in one focused session — set scope, build shared support, prioritise concrete opportunities. Underlying teams can then scale on one shared direction.',
      cta: 'Book an MT alignment session',
    },
    corporate_override: {
      dimension: 'corporate_override',
      heading: 'Invest in AI capability across your teams',
      body: 'At your size, structured training and team development deliver the biggest leverage: one coherent curriculum that brings management and operational teams to the same level of fluency, instead of scattered ad-hoc training.',
      cta: 'Discuss a training programme',
    },
  },
  nl: {
    ceo_override: {
      dimension: 'ceo_override',
      heading: 'Lijn je MT in één werksessie uit op AI',
      body: 'Als CEO heb je het meeste effect door je managementteam in één gerichte sessie samen te brengen: scope vaststellen, draagvlak creëren, concrete kansen prioriteren. Onderliggende teams schalen vervolgens door op één gedeelde richting.',
      cta: 'Plan een MT-sessie',
    },
    corporate_override: {
      dimension: 'corporate_override',
      heading: 'Investeer in AI-bekwaamheid van je teams',
      body: 'Bij jullie omvang levert gestructureerd opleiden en teamontwikkeling de grootste hefboom: één coherent curriculum dat management én operationele teams op hetzelfde kennisniveau brengt, ipv ad-hoc training.',
      cta: 'Bespreek een opleidingsprogramma',
    },
  },
  fr: {
    ceo_override: {
      dimension: 'ceo_override',
      heading: 'Alignez votre comité de direction sur l\'IA en une seule séance de travail',
      body: 'En tant que CEO, le meilleur levier est de rassembler votre équipe de direction en une séance focalisée : définir le périmètre, créer l\'adhésion, prioriser des opportunités concrètes. Les équipes opérationnelles peuvent ensuite passer à l\'échelle sur une direction partagée.',
      cta: 'Planifiez une séance d\'alignement du comité',
    },
    corporate_override: {
      dimension: 'corporate_override',
      heading: 'Investissez dans la capacité IA de vos équipes',
      body: 'À votre taille, une formation structurée et le développement d\'équipe offrent le plus grand levier : un curriculum cohérent qui amène la direction et les équipes opérationnelles au même niveau, plutôt que des formations ad hoc dispersées.',
      cta: 'Discutez d\'un programme de formation',
    },
  },
}

/** Detect CEO-like job titles (case-insensitive substring match). */
function isCeoLike(jobTitle?: string | null): boolean {
  if (!jobTitle) return false
  const t = jobTitle.toLowerCase()
  return (
    /\bceo\b/.test(t) ||
    t.includes('chief executive') ||
    t.includes('algemeen directeur') ||
    t.includes('directeur-eigenaar') ||
    t.includes('eigenaar/directeur') ||
    t.includes('general manager') ||
    t.includes('président-directeur') ||
    t.includes('directeur général') ||
    t.includes('founder') &&  // founder/CEO patterns
      (t.includes('ceo') || t.includes('director'))
  )
}

/** Treat 501+ as corporate — biggest training/budget lever per Mark's call. */
function isCorporateSize(size?: string | null): boolean {
  return size === '501–1000' || size === '1000+'
}

// ─── Maturity-band CTA copy ──────────────────────────────────────────────────
// "Klaar voor de volgende stap?" header on the results page. Two flavours:
//   - starter: Unaware / Exploring / Experimenting → emphasise guidance into AI
//   - scaler:  Scaling / Leading → emphasise strategic oversight + scaling momentum

export type MaturityBand = 'starter' | 'scaler'

const STARTER_LEVELS = new Set(['Unaware', 'Exploring', 'Experimenting'])

export function getMaturityBand(level: string | null | undefined): MaturityBand {
  if (!level) return 'starter'
  return STARTER_LEVELS.has(level) ? 'starter' : 'scaler'
}

export interface NextStepsCopy {
  heading: string
  body:    string
  cta:     string
  trust:   string
}

const NEXT_STEPS_COPY: Record<string, Record<MaturityBand, NextStepsCopy>> = {
  en: {
    starter: {
      heading: 'Set the foundation for AI in your company',
      body:    'You\'re at the start of integrating AI. The biggest gains come from clear direction, basic governance and one or two early use cases that prove what works. We\'ll help you find them.',
      cta:     'Plan a guidance session →',
      trust:   'Free · No obligation · 30 minutes',
    },
    scaler: {
      heading: 'Scale your AI momentum with strategic oversight',
      body:    'You\'re past the experiment phase. Now the question is: where to invest, where to consolidate, and how to keep your edge. A strategic working session helps you make those calls.',
      cta:     'Plan a strategy session →',
      trust:   'Free · No obligation · 30 minutes',
    },
  },
  nl: {
    starter: {
      heading: 'Leg de basis voor AI in je bedrijf',
      body:    'Je staat aan het begin van AI-integratie. De grootste winst komt uit heldere richting, basis-governance en één of twee eerste use cases die laten zien wat werkt. We helpen je die te vinden.',
      cta:     'Plan een begeleidingsgesprek →',
      trust:   'Gratis · Geen verplichtingen · 30 minuten',
    },
    scaler: {
      heading: 'Schaal je AI-momentum op met strategische sturing',
      body:    'Je bent voorbij de experimenteer-fase. De vraag is nu: waar investeer je, waar consolideer je, en hoe behoud je je voorsprong. Een strategische werksessie helpt je die keuzes te maken.',
      cta:     'Plan een strategiesessie →',
      trust:   'Gratis · Geen verplichtingen · 30 minuten',
    },
  },
  fr: {
    starter: {
      heading: 'Posez les bases de l\'IA dans votre entreprise',
      body:    'Vous êtes au début de l\'intégration de l\'IA. Le plus grand gain vient d\'une direction claire, d\'une gouvernance de base et d\'un ou deux premiers cas d\'usage qui montrent ce qui fonctionne. Nous vous aidons à les trouver.',
      cta:     'Planifier une séance d\'accompagnement →',
      trust:   'Gratuit · Sans engagement · 30 minutes',
    },
    scaler: {
      heading: 'Faites passer à l\'échelle votre élan IA avec une supervision stratégique',
      body:    'Vous êtes au-delà de la phase d\'expérimentation. La question est : où investir, où consolider, et comment garder votre avance. Une séance de travail stratégique vous aide à faire ces choix.',
      cta:     'Planifier une séance stratégique →',
      trust:   'Gratuit · Sans engagement · 30 minutes',
    },
  },
}

/** Get the next-steps CTA copy for a given maturity level + locale. */
export function getNextStepsCopy(level: string | null | undefined, locale: string): NextStepsCopy {
  const band = getMaturityBand(level)
  const map  = NEXT_STEPS_COPY[locale] ?? NEXT_STEPS_COPY.en
  return map[band]
}

/**
 * Apply role + company-size overrides to a list of recommendations.
 *
 * Rules (in this order):
 *  1. CEO-like job title → prepend a CEO MT-sessie card as PRIMARY, demote
 *     existing primary to supporting, trim list back to max 3.
 *  2. Corporate company size (501+) → if there's room, append a training /
 *     team-development supporting card. If full, replace the last supporting.
 *
 * Pure function: returns a new array, doesn't mutate input.
 */
export function applyRoleAndSizeOverrides(
  recommendations: Recommendation[],
  context: RecommendationContext,
  locale: string,
): Recommendation[] {
  const map = OVERRIDE_RECOMMENDATION_MAP[locale] ?? OVERRIDE_RECOMMENDATION_MAP.en
  let result = [...recommendations]

  // 1. CEO override
  if (isCeoLike(context.jobTitle)) {
    const ceoCard: Recommendation = { ...map.ceo_override, priority: 'primary' }
    // Demote the existing primary to supporting (if any), and prepend CEO card
    result = result.map((r, i) =>
      i === 0 && r.priority === 'primary' ? { ...r, priority: 'supporting' } : r
    )
    result = [ceoCard, ...result].slice(0, 3)
  }

  // 2. Corporate override
  if (isCorporateSize(context.companySize)) {
    const corpCard: Recommendation = { ...map.corporate_override, priority: 'supporting' }
    // Don't duplicate — skip if a corporate_override is already present (defensive)
    if (!result.some(r => r.dimension === 'corporate_override')) {
      if (result.length < 3) {
        result.push(corpCard)
      } else {
        // Replace the last supporting (preserves primary at index 0)
        result[result.length - 1] = corpCard
      }
    }
  }

  return result
}

/**
 * Re-localize a list of stored recommendations into the requested locale.
 * Falls back to the existing strings if no translation is registered for that
 * dimension+locale combination — keeps other products working without changes.
 *
 * Also handles override-key dimensions (ceo_override, corporate_override) via
 * the OVERRIDE_RECOMMENDATION_MAP so re-localization is consistent.
 */
export function localizeRecommendations(
  recommendations: Recommendation[],
  locale: string
): Recommendation[] {
  const map = RECOMMENDATION_MAP[locale]
  const overrideMap = OVERRIDE_RECOMMENDATION_MAP[locale]
  return recommendations.map(rec => {
    // Override keys live in OVERRIDE_RECOMMENDATION_MAP
    if (rec.dimension === 'ceo_override' || rec.dimension === 'corporate_override') {
      const tr = overrideMap?.[rec.dimension]
      if (!tr) return rec
      return { ...rec, heading: tr.heading, body: tr.body, cta: tr.cta }
    }
    if (!map) return rec
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