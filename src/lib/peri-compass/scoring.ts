/**
 * Peri-Compass — scoring engine (taal-onafhankelijke berekening,
 * meertalige labels en band-copy via dimensionLabel / BAND_COPY).
 */

import {
  RAW_QUESTIONS,
  type LocalizedQuestion,
  type Dimension,
  type Stage,
} from './questions'
import type { Lang } from './i18n'

export type ResponseValue =
  | { kind: 'single'; value: string }
  | { kind: 'multi';  value: string[] }
  | { kind: 'likert'; value: number }
  | { kind: 'number'; value: number }
  | { kind: 'text';   value: string }

export type ResponseMap = Record<string, ResponseValue | undefined>

export type Band = 'thriving' | 'navigating' | 'struggling' | 'depleted'

export interface DimensionScore {
  dimension: Dimension
  label:     string
  score:     number          // 0-100
  weight:    number
}

export interface CompassScore {
  overall:    number
  band:       Band
  dimensions: DimensionScore[]
  byDimension: Record<Dimension, number>
}

const DIM_LABELS: Record<Lang, Record<Dimension, string>> = {
  nl: {
    meta: 'Context', symptom_burden: 'Symptoombelasting', sleep_recovery: 'Slaap & herstel',
    energy_capacity: 'Energie & capaciteit', stress_context: 'Stress & context',
    lifestyle: 'Leefstijl', self_awareness: 'Zelfkennis & motivatie',
  },
  en: {
    meta: 'Context', symptom_burden: 'Symptom burden', sleep_recovery: 'Sleep & recovery',
    energy_capacity: 'Energy & capacity', stress_context: 'Stress & context',
    lifestyle: 'Lifestyle', self_awareness: 'Self-knowledge & motivation',
  },
  fr: {
    meta: 'Contexte', symptom_burden: 'Charge symptomatique', sleep_recovery: 'Sommeil & récupération',
    energy_capacity: 'Énergie & capacité', stress_context: 'Stress & contexte',
    lifestyle: 'Mode de vie', self_awareness: 'Connaissance de soi & motivation',
  },
  de: {
    meta: 'Kontext', symptom_burden: 'Symptombelastung', sleep_recovery: 'Schlaf & Erholung',
    energy_capacity: 'Energie & Kapazität', stress_context: 'Stress & Kontext',
    lifestyle: 'Lebensstil', self_awareness: 'Selbstkenntnis & Motivation',
  },
}

export function dimensionLabel(d: Dimension, lang: Lang): string {
  return DIM_LABELS[lang]?.[d] ?? DIM_LABELS.nl[d]
}

const WEIGHTS: Record<Exclude<Dimension, 'meta'>, number> = {
  symptom_burden:   25,
  sleep_recovery:   20,
  energy_capacity:  15,
  stress_context:   15,
  lifestyle:        15,
  self_awareness:   10,
}

function likertScore(value: number, scale: number, best: number): number {
  if (best === scale) return Math.round(((value - 1) / (scale - 1)) * 100)
  return Math.round(((scale - value) / (scale - 1)) * 100)
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
}

function questionScore(q: LocalizedQuestion, r: ResponseValue | undefined): number | null {
  if (q.contextOnly || q.dimension === 'meta') return null
  if (!r) return null
  switch (q.kind) {
    case 'single': {
      if (r.kind !== 'single') return null
      const opt = q.options?.find((o) => o.value === r.value)
      return typeof opt?.score === 'number' ? opt.score : null
    }
    case 'multi': {
      if (r.kind !== 'multi') return null
      if (q.code.startsWith('symptoms.')) {
        const total = q.options?.length ?? 0
        if (total === 0) return null
        return Math.round(100 - (r.value.length / total) * 100)
      }
      const scored = r.value
        .map((v) => q.options?.find((o) => o.value === v)?.score)
        .filter((s): s is number => typeof s === 'number')
      if (scored.length === 0) return null
      switch (q.multiAggregation ?? 'avg') {
        case 'sum': return Math.min(100, scored.reduce((a, b) => a + b, 0))
        case 'max': return Math.max(...scored)
        case 'avg':
        default:    return avg(scored)
      }
    }
    case 'likert': {
      if (r.kind !== 'likert') return null
      const scale = q.scale ?? 5
      const best  = q.best  ?? scale
      return likertScore(r.value, scale, best)
    }
    case 'number':
    case 'text':
    default:
      return null
  }
}

/** Voor scoring gebruiken we de NL-localized variant — opties hebben dezelfde scores ongeacht taal. */
function scoringQuestions(): LocalizedQuestion[] {
  return RAW_QUESTIONS.map((q) => ({
    code:             q.code,
    dimension:        q.dimension,
    kind:             q.kind,
    prompt:           q.prompts.nl,
    help:             q.helps?.nl,
    scale:            q.scale,
    best:             q.best,
    multiAggregation: q.multiAggregation,
    showIfStage:      q.showIfStage,
    contextOnly:      q.contextOnly,
    required:         q.required,
    options:          q.options?.map((o) => ({ value: o.value, label: o.labels.nl, score: o.score })),
  }))
}

export function scoreResponses(responses: ResponseMap, _stage: Stage, lang: Lang = 'nl'): CompassScore {
  const byDim: Partial<Record<Dimension, number[]>> = {}
  for (const q of scoringQuestions()) {
    const r = responses[q.code]
    const s = questionScore(q, r)
    if (s === null) continue
    if (!byDim[q.dimension]) byDim[q.dimension] = []
    byDim[q.dimension]!.push(s)
  }

  const dims: DimensionScore[] = (Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).map((d) => ({
    dimension: d,
    label:     dimensionLabel(d, lang),
    score:     avg(byDim[d] ?? []),
    weight:    WEIGHTS[d],
  }))

  const totalWeight = dims.reduce((a, b) => a + b.weight, 0)
  const overall = Math.round(
    dims.reduce((acc, d) => acc + d.score * d.weight, 0) / totalWeight,
  )

  const symptomScore = dims.find((d) => d.dimension === 'symptom_burden')?.score ?? overall
  const band: Band =
    overall >= 75 && symptomScore >= 65 ? 'thriving'
    : overall >= 55                      ? 'navigating'
    : overall >= 35                      ? 'struggling'
    :                                      'depleted'

  const byDimension: Record<Dimension, number> = {
    meta: 0,
    symptom_burden:  dims.find((d) => d.dimension === 'symptom_burden')?.score  ?? 0,
    sleep_recovery:  dims.find((d) => d.dimension === 'sleep_recovery')?.score  ?? 0,
    energy_capacity: dims.find((d) => d.dimension === 'energy_capacity')?.score ?? 0,
    stress_context:  dims.find((d) => d.dimension === 'stress_context')?.score  ?? 0,
    lifestyle:       dims.find((d) => d.dimension === 'lifestyle')?.score       ?? 0,
    self_awareness:  dims.find((d) => d.dimension === 'self_awareness')?.score  ?? 0,
  }

  return { overall, band, dimensions: dims, byDimension }
}

// ── Band copy per locale ────────────────────────────────────────────────────
export const BAND_COPY: Record<Lang, Record<Band, { title: string; sub: string }>> = {
  nl: {
    thriving:   { title: 'Thriving',   sub: 'Je staat er sterk voor. De Compass helpt je deze uitgangspositie te bewaken en kleine optimalisaties zichtbaar te maken.' },
    navigating: { title: 'Navigating', sub: 'Je voelt de transitie maar houdt het in de hand. Daily check-ins kunnen je helpen patronen te zien voordat ze je verrassen.' },
    struggling: { title: 'Struggling', sub: 'Meerdere fronten vragen aandacht. Met dagelijkse data heb je binnen 4 weken concrete hefbomen om mee te beginnen.' },
    depleted:   { title: 'Depleted',   sub: 'Je systeem staat onder hoge belasting. Tracken kan inzicht geven, maar overweeg ook professionele ondersteuning (huisarts, menopauze-arts, coach).' },
  },
  en: {
    thriving:   { title: 'Thriving',   sub: 'You\'re in a strong position. The Compass helps you preserve this baseline and make small optimisations visible.' },
    navigating: { title: 'Navigating', sub: 'You feel the transition but you\'re managing. Daily check-ins help you spot patterns before they catch you off guard.' },
    struggling: { title: 'Struggling', sub: 'Multiple fronts need attention. With daily data you\'ll have concrete levers to act on within 4 weeks.' },
    depleted:   { title: 'Depleted',   sub: 'Your system is under heavy load. Tracking can provide insight, but also consider professional support (GP, menopause specialist, coach).' },
  },
  fr: {
    thriving:   { title: 'Thriving',   sub: 'Vous êtes en bonne position. Le Compass vous aide à préserver ce point de départ et à rendre visibles les petites optimisations.' },
    navigating: { title: 'Navigating', sub: 'Vous sentez la transition mais vous gérez. Les check-ins quotidiens vous aident à repérer les schémas avant qu\'ils ne vous surprennent.' },
    struggling: { title: 'Struggling', sub: 'Plusieurs fronts demandent de l\'attention. Avec des données quotidiennes, vous aurez des leviers concrets en 4 semaines.' },
    depleted:   { title: 'Depleted',   sub: 'Votre système est sous forte charge. Le suivi peut donner des insights, mais envisagez aussi un soutien professionnel (médecin, spécialiste de la ménopause, coach).' },
  },
  de: {
    thriving:   { title: 'Thriving',   sub: 'Du stehst stark da. Der Compass hilft dir, diese Ausgangslage zu bewahren und kleine Optimierungen sichtbar zu machen.' },
    navigating: { title: 'Navigating', sub: 'Du spürst die Transition, hast sie aber im Griff. Tägliche Check-ins helfen dir, Muster zu erkennen, bevor sie dich überraschen.' },
    struggling: { title: 'Struggling', sub: 'Mehrere Fronten verlangen Aufmerksamkeit. Mit täglichen Daten hast du innerhalb von 4 Wochen konkrete Hebel.' },
    depleted:   { title: 'Depleted',   sub: 'Dein System steht unter hoher Belastung. Tracking kann Einblicke geben, aber erwäge auch professionelle Unterstützung (Hausarzt, Menopause-Spezialist, Coach).' },
  },
}
