/**
 * HCSS Cyber Compass — scoring engine.
 * Taal-onafhankelijke berekening; labels via dimensionLabel(lang).
 */

import { RAW_QUESTIONS, type LocalizedQuestion, type Dimension, type Stage } from './questions'
import type { Lang } from './i18n'

export type ResponseValue =
  | { kind: 'single'; value: string }
  | { kind: 'multi';  value: string[] }
  | { kind: 'likert'; value: number }
  | { kind: 'text';   value: string }

export type ResponseMap = Record<string, ResponseValue | undefined>

export type Band = 'exposed' | 'aware' | 'maturing' | 'resilient'

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
    meta:         'Context',
    iam:          'Identity & access',
    awareness:    'Awareness & gedrag',
    data:         'Data & informatie',
    endpoint:     'Endpoint & netwerk',
    backup:       'Backup & continuity',
    compliance:   'Compliance & frameworks',
    supply_chain: 'Supply chain',
  },
  en: {
    meta:         'Context',
    iam:          'Identity & access',
    awareness:    'Awareness & behaviour',
    data:         'Data & information',
    endpoint:     'Endpoint & network',
    backup:       'Backup & continuity',
    compliance:   'Compliance & frameworks',
    supply_chain: 'Supply chain',
  },
}

export function dimensionLabel(d: Dimension, lang: Lang): string {
  return DIM_LABELS[lang]?.[d] ?? DIM_LABELS.nl[d]
}

const WEIGHTS: Record<Exclude<Dimension, 'meta'>, number> = {
  iam:          20,   // Diederik specialty + grootste risico bij MKB
  awareness:    18,
  backup:       15,
  endpoint:     12,
  data:         12,
  compliance:   13,
  supply_chain: 10,
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
      const scored = r.value
        .map((v) => q.options?.find((o) => o.value === v)?.score)
        .filter((s): s is number => typeof s === 'number')
      if (scored.length === 0) return null
      return avg(scored)
    }
    case 'likert': {
      if (r.kind !== 'likert') return null
      const scale = q.scale ?? 5
      const best  = q.best  ?? scale
      return likertScore(r.value, scale, best)
    }
    case 'text':
    default:
      return null
  }
}

function scoringQuestions(): LocalizedQuestion[] {
  return RAW_QUESTIONS.map((q) => ({
    code:        q.code,
    dimension:   q.dimension,
    kind:        q.kind,
    prompt:      q.prompts.nl,
    help:        q.helps?.nl,
    scale:       q.scale,
    best:        q.best,
    showIfStage: q.showIfStage,
    contextOnly: q.contextOnly,
    required:    q.required,
    options:     q.options?.map((o) => ({ value: o.value, label: o.labels.nl, score: o.score })),
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

  // Bands
  const band: Band =
    overall >= 76 ? 'resilient'
    : overall >= 56 ? 'maturing'
    : overall >= 31 ? 'aware'
    :                 'exposed'

  const byDimension: Record<Dimension, number> = {
    meta: 0,
    iam:          dims.find((d) => d.dimension === 'iam')?.score          ?? 0,
    awareness:    dims.find((d) => d.dimension === 'awareness')?.score    ?? 0,
    data:         dims.find((d) => d.dimension === 'data')?.score         ?? 0,
    endpoint:     dims.find((d) => d.dimension === 'endpoint')?.score     ?? 0,
    backup:       dims.find((d) => d.dimension === 'backup')?.score       ?? 0,
    compliance:   dims.find((d) => d.dimension === 'compliance')?.score   ?? 0,
    supply_chain: dims.find((d) => d.dimension === 'supply_chain')?.score ?? 0,
  }

  return { overall, band, dimensions: dims, byDimension }
}
