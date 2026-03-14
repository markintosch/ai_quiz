import { QUESTIONS, type Dimension } from '@/data/questions'
import type { AnswerMap } from '@/types'

// ─── Core scoring types (owned here; re-exported via @/types) ─────────────
export type MaturityLevel = 'Unaware' | 'Exploring' | 'Experimenting' | 'Scaling' | 'Leading'
export interface DimensionScore {
  dimension: Dimension
  /** Raw score: sum of selected option values */
  raw: number
  /** Max possible raw score for this dimension */
  max: number
  /** 0–100 normalised score for this dimension */
  normalized: number
  /** Human-readable label e.g. "Strategy & Vision" */
  label: string
}

export interface ShadowAIResult {
  triggered: boolean
  severity: 'low' | 'medium' | 'high' | null
  /** Usage score minus average of (strategy + governance) */
  gap: number
}

export interface QuizScore {
  overall: number
  maturityLevel: MaturityLevel
  dimensionScores: DimensionScore[]
  shadowAI: ShadowAIResult
}

// ─── Dimension weights (must sum to 1.0) ─────────────────────
const DIMENSION_WEIGHTS: Record<Dimension, number> = {
  strategy_vision:      0.22,
  governance_risk:      0.22,
  current_usage:        0.16,
  data_readiness:       0.15,
  talent_culture:       0.15,
  opportunity_awareness: 0.10,
}

const DIMENSION_LABELS: Record<Dimension, string> = {
  strategy_vision:      'Strategy & Vision',
  governance_risk:      'Governance & Risk',
  current_usage:        'Current Usage',
  data_readiness:       'Data Readiness',
  talent_culture:       'Talent & Culture',
  opportunity_awareness: 'Opportunity Awareness',
}

// ─── Maturity level thresholds ───────────────────────────────
function toMaturityLevel(score: number): MaturityLevel {
  if (score <= 20) return 'Unaware'
  if (score <= 40) return 'Exploring'
  if (score <= 60) return 'Experimenting'
  if (score <= 80) return 'Scaling'
  return 'Leading'
}

// ─── Shadow AI detection ──────────────────────────────────────
function detectShadowAI(dimensionScores: DimensionScore[]): ShadowAIResult {
  const get = (dim: Dimension) =>
    dimensionScores.find(d => d.dimension === dim)?.normalized ?? 0

  const usage    = get('current_usage')
  const strategy = get('strategy_vision')
  const gov      = get('governance_risk')

  const gap = usage - (strategy + gov) / 2

  if (gap < 10) return { triggered: false, severity: null, gap }
  if (gap < 20) return { triggered: true,  severity: 'low',    gap }
  if (gap < 35) return { triggered: true,  severity: 'medium', gap }
  return           { triggered: true,  severity: 'high',   gap }
}

// ─── Per-dimension scoring ────────────────────────────────────
function scoreDimension(
  dimension: Dimension,
  answers: AnswerMap,
  questionsForVersion: typeof QUESTIONS
): DimensionScore {
  const dimensionQs = questionsForVersion.filter(
    q => q.dimension === dimension && q.scored
  )

  let raw = 0
  let max = 0

  for (const q of dimensionQs) {
    const maxValue = Math.max(...q.options.map(o => o.value ?? 0))
    max += maxValue

    const answer = answers[q.code]
    if (typeof answer === 'number') {
      raw += answer
    }
    // multiselect questions are not scored (scored: false) so we skip arrays
  }

  const normalized = max > 0 ? Math.round((raw / max) * 100) : 0

  return {
    dimension,
    raw,
    max,
    normalized,
    label: DIMENSION_LABELS[dimension],
  }
}

// ─── Main scoring function ────────────────────────────────────
export function calculateScore(
  answers: AnswerMap,
  version: 'lite' | 'full'
): QuizScore {
  const questionsForVersion =
    version === 'lite' ? QUESTIONS.filter(q => q.lite) : QUESTIONS

  const dimensions = Object.keys(DIMENSION_WEIGHTS) as Dimension[]

  const dimensionScores = dimensions.map(dim =>
    scoreDimension(dim, answers, questionsForVersion)
  )

  // Weighted overall score
  let overall = 0
  for (const ds of dimensionScores) {
    overall += ds.normalized * DIMENSION_WEIGHTS[ds.dimension]
  }
  overall = Math.round(overall)

  const shadowAI = detectShadowAI(dimensionScores)

  return {
    overall,
    maturityLevel: toMaturityLevel(overall),
    dimensionScores,
    shadowAI,
  }
}
