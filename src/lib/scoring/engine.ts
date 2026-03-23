import { QUESTIONS, type Dimension, type Question } from '@/data/questions'
import type { AnswerMap } from '@/types'
// type-only import — no runtime circular dep (products/types re-exports our types via type-only)
import type { QuizProductConfig } from '@/products/types'

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

// ─── Dimension weights (must sum to 1.0) — AI Maturity defaults ──────────
// AI Maturity defaults — Partial because new products add their own dimension keys
const DIMENSION_WEIGHTS: Partial<Record<Dimension, number>> = {
  strategy_vision:      0.22,
  governance_risk:      0.22,
  current_usage:        0.16,
  data_readiness:       0.15,
  talent_culture:       0.15,
  opportunity_awareness: 0.10,
}

const DIMENSION_LABELS: Partial<Record<Dimension, string>> = {
  strategy_vision:      'Strategy & Vision',
  governance_risk:      'Governance & Risk',
  current_usage:        'Current Usage',
  data_readiness:       'Data Readiness',
  talent_culture:       'Talent & Culture',
  opportunity_awareness: 'Opportunity Awareness',
}

// ─── Maturity level thresholds — AI Maturity defaults ───────────────────
function toMaturityLevel(score: number): MaturityLevel {
  if (score <= 20) return 'Unaware'
  if (score <= 40) return 'Exploring'
  if (score <= 60) return 'Experimenting'
  if (score <= 80) return 'Scaling'
  return 'Leading'
}

/** Resolve maturity level string from a product config's threshold array */
function resolveMaturityLevel(
  score: number,
  thresholds: { maxScore: number; level: string }[]
): string {
  for (const t of thresholds) {
    if (score <= t.maxScore) return t.level
  }
  return thresholds[thresholds.length - 1]?.level ?? 'Unknown'
}

// ─── Shadow AI detection — exported so product configs can use it as a flag ─
export function detectShadowAI(dimensionScores: DimensionScore[]): ShadowAIResult {
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

// ─── Per-dimension scoring ────────────────────────────────────────────────
function scoreDimension(
  dimensionKey: string,
  dimensionLabel: string,
  answers: AnswerMap,
  questionsForVersion: Question[]
): DimensionScore {
  const dimensionQs = questionsForVersion.filter(
    q => q.dimension === dimensionKey && q.scored
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
    dimension: dimensionKey as Dimension, // cast: AI Maturity keys match Dimension union
    raw,
    max,
    normalized,
    label: dimensionLabel,
  }
}

// ─── Main scoring function ────────────────────────────────────────────────
export function calculateScore(
  answers: AnswerMap,
  version: 'lite' | 'full',
  /** Optional product config — defaults to AI Maturity when omitted (backward compat) */
  productConfig?: QuizProductConfig
): QuizScore {

  // ── Resolve questions, dimensions, and weights from config or defaults ───
  const questions = productConfig
    ? (version === 'lite'
        ? productConfig.questions.filter(q => q.lite)
        : productConfig.questions)
    : (version === 'lite' ? QUESTIONS.filter(q => q.lite) : QUESTIONS)

  const dims: Array<{ key: string; label: string; weight: number }> = productConfig
    ? productConfig.dimensions.map(d => ({ key: d.key, label: d.label, weight: d.weight }))
    : (Object.keys(DIMENSION_WEIGHTS) as Dimension[]).map(key => ({
        key,
        label: DIMENSION_LABELS[key] ?? key,
        weight: DIMENSION_WEIGHTS[key] ?? 0,
      }))

  const dimensionScores = dims.map(dim =>
    scoreDimension(dim.key, dim.label, answers, questions)
  )

  // ── Weighted overall score ────────────────────────────────────────────────
  let overall = 0
  for (const ds of dimensionScores) {
    const dimConfig = dims.find(d => d.key === ds.dimension)
    overall += ds.normalized * (dimConfig?.weight ?? 0)
  }
  overall = Math.round(overall)

  // ── Run product flags (e.g. shadow AI) ───────────────────────────────────
  const flagResults: Record<string, unknown> = {}
  if (productConfig?.flags) {
    for (const flag of productConfig.flags) {
      flagResults[flag.key] = flag.detect(dimensionScores)
    }
  }

  // Shadow AI: from flags map if present, else run directly (backward compat)
  const shadowAI = (flagResults.shadow_ai as ShadowAIResult | undefined)
    ?? detectShadowAI(dimensionScores)

  // ── Maturity level ────────────────────────────────────────────────────────
  const maturityLevel = productConfig
    ? resolveMaturityLevel(overall, productConfig.scoring.maturityThresholds)
    : toMaturityLevel(overall)

  return {
    overall,
    maturityLevel: maturityLevel as MaturityLevel,
    dimensionScores,
    shadowAI,
  }
}
