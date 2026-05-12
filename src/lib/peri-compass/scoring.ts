/**
 * Perimenopause Compass — scoring engine.
 *
 * Input:  Map van question_code → ResponseValue
 * Output: CompassScore met 6 dimensie-scores (0-100) + overall + band.
 *
 * Filosofie:
 *  - Hogere score = betere uitgangspositie (minder belasting / meer veerkracht).
 *  - Per dimensie aggregeren we de scores van bijbehorende vragen — gewogen
 *    gemiddelde, gemarkeerde reverse-likerts inverteren.
 *  - Overall = gewogen gemiddelde van de 6 dimensies (zie WEIGHTS).
 *  - Band wordt afgeleid van overall + symptom-burden (hoge symptom = struggling
 *    ongeacht overall).
 */

import {
  ALL_QUESTIONS,
  type CompassQuestion,
  type Dimension,
  type Stage,
} from './questions'

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
  weight:    number          // bijdrage aan overall
}

export interface CompassScore {
  overall:    number          // 0-100
  band:       Band
  dimensions: DimensionScore[]
  /** Convenience map for templating */
  byDimension: Record<Dimension, number>
}

const DIM_LABELS: Record<Dimension, string> = {
  meta:             'Context',
  symptom_burden:   'Symptoombelasting',
  sleep_recovery:   'Slaap & herstel',
  energy_capacity:  'Energie & capaciteit',
  stress_context:   'Stress & context',
  lifestyle:        'Leefstijl',
  self_awareness:   'Zelfkennis & motivatie',
}

/** Hoeveel telt elke dimensie mee in de overall-score (totaal = 100). */
const WEIGHTS: Record<Exclude<Dimension, 'meta'>, number> = {
  symptom_burden:   25,
  sleep_recovery:   20,
  energy_capacity:  15,
  stress_context:   15,
  lifestyle:        15,
  self_awareness:   10,
}

/** Normaliseer een likert-antwoord naar 0-100 op basis van schaal en best-keuze. */
function likertScore(value: number, scale: number, best: number): number {
  if (best === scale) {
    // Hoger is beter (5/5 = 100, 1/5 = 0)
    return Math.round(((value - 1) / (scale - 1)) * 100)
  }
  // Lager is beter (best=1, scale=5 → 1/5 = 100, 5/5 = 0)
  return Math.round(((scale - value) / (scale - 1)) * 100)
}

/** Gemiddelde van scores in een lijst — geeft 0 als leeg. */
function avg(arr: number[]): number {
  if (arr.length === 0) return 0
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
}

/**
 * Bereken score voor één vraag op basis van response. Returns null als de
 * vraag geen score levert (text, geen antwoord, contextOnly, etc.).
 */
function questionScore(q: CompassQuestion, r: ResponseValue | undefined): number | null {
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
      // Voor symptoom-multi werken we anders: meer geselecteerd = hogere burden
      // → lagere score. We rekenen als percentage NIET-geselecteerd.
      if (q.code.startsWith('symptoms.')) {
        const total    = q.options?.length ?? 0
        const selected = r.value.length
        if (total === 0) return null
        const burdenPct = (selected / total) * 100
        return Math.round(100 - burdenPct)
      }
      // Voor andere multi (stress_source etc.): als per option score is
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

/** Bereken de volledige CompassScore. */
export function scoreResponses(responses: ResponseMap, _stage: Stage): CompassScore {
  // Per dimensie verzamelen
  const byDim: Partial<Record<Dimension, number[]>> = {}
  for (const q of ALL_QUESTIONS) {
    const r = responses[q.code]
    const s = questionScore(q, r)
    if (s === null) continue
    if (!byDim[q.dimension]) byDim[q.dimension] = []
    byDim[q.dimension]!.push(s)
  }

  const dims: DimensionScore[] = (Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).map((d) => ({
    dimension: d,
    label:     DIM_LABELS[d],
    score:     avg(byDim[d] ?? []),
    weight:    WEIGHTS[d],
  }))

  // Overall = gewogen gemiddelde
  const totalWeight = dims.reduce((a, b) => a + b.weight, 0)
  const overall     = Math.round(
    dims.reduce((acc, d) => acc + d.score * d.weight, 0) / totalWeight,
  )

  // Band (zie filosofie hierboven)
  const symptomScore = dims.find((d) => d.dimension === 'symptom_burden')?.score ?? overall
  const band: Band =
    overall >= 75 && symptomScore >= 65 ? 'thriving'
    : overall >= 55                      ? 'navigating'
    : overall >= 35                      ? 'struggling'
    :                                      'depleted'

  const byDimension: Record<Dimension, number> = {
    meta: 0,
    symptom_burden:   dims.find((d) => d.dimension === 'symptom_burden')?.score   ?? 0,
    sleep_recovery:   dims.find((d) => d.dimension === 'sleep_recovery')?.score   ?? 0,
    energy_capacity:  dims.find((d) => d.dimension === 'energy_capacity')?.score  ?? 0,
    stress_context:   dims.find((d) => d.dimension === 'stress_context')?.score   ?? 0,
    lifestyle:        dims.find((d) => d.dimension === 'lifestyle')?.score        ?? 0,
    self_awareness:   dims.find((d) => d.dimension === 'self_awareness')?.score   ?? 0,
  }

  return { overall, band, dimensions: dims, byDimension }
}

// ── Band copy (NL) ─────────────────────────────────────────────────────────
export const BAND_COPY: Record<Band, { title: string; sub: string }> = {
  thriving: {
    title: 'Thriving',
    sub:   'Je staat er sterk voor. De Compass helpt je deze uitgangspositie te bewaken en kleine optimalisaties zichtbaar te maken.',
  },
  navigating: {
    title: 'Navigating',
    sub:   'Je voelt de transitie maar houdt het in de hand. Daily check-ins kunnen je helpen patronen te zien voordat ze je verrassen.',
  },
  struggling: {
    title: 'Struggling',
    sub:   'Meerdere fronten vragen aandacht. Met dagelijkse data heb je binnen 4 weken concrete hefbomen om mee te beginnen.',
  },
  depleted: {
    title: 'Depleted',
    sub:   'Je systeem staat onder hoge belasting. Tracken kan inzicht geven, maar overweeg ook professionele ondersteuning (huisarts, menopauze-arts, coach).',
  },
}
