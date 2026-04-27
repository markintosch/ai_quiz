// AI-benchmark scoring engine
// - Each scoring question contributes a 0-100 raw score to its dimension.
// - Dimension score = average of its question scores.
// - Total score = average of all 6 dimensions present.
// - Sentiment dimension is excluded from scoring; stored as raw answers only.
// - Archetype is a decision-tree mapping over total score + adoption + governance.

import { type Role, type Question, type ArchetypeId, getScoringQuestions } from './data'

export type Answers = Record<string, string | string[] | undefined>

export type DimensionScore = {
  dimension: 'adoption' | 'workflow' | 'outcome' | 'data' | 'skill' | 'governance'
  score: number  // 0-100
}

export type ScoredResult = {
  dimensionScores: Record<DimensionScore['dimension'], number>
  totalScore: number
  archetype:  ArchetypeId
}

// ── Per-question score ───────────────────────────────────────────────────────
function scoreQuestion(q: Question, answer: Answers[string]): number | null {
  if (answer === undefined) return null

  switch (q.type) {
    case 'multiselect': {
      const arr = Array.isArray(answer) ? answer : [answer]
      // Filter out the "none" option and Other-detail tokens
      const meaningful = arr.filter(a =>
        typeof a === 'string'
        && a !== 'none'
        && !a.startsWith('other_detail:')
      )
      // If user picked "none" → 0. If they only added an Other-detail → 1 selection.
      const otherCount = arr.filter(a => typeof a === 'string' && a.startsWith('other_detail:')).length
      const count = meaningful.length + (otherCount > 0 ? 1 : 0)
      const saturation = q.saturation ?? 3
      if (count === 0) return 0
      return Math.min(100, Math.round((count / saturation) * 100))
    }

    case 'frequency': {
      const idx = q.options.findIndex(o => o.id === answer)
      if (idx < 0) return null
      const max = q.options.length - 1
      return max === 0 ? 0 : Math.round((idx / max) * 100)
    }

    case 'weighted_mc':
    case 'likert': {
      const opt = q.options.find(o => o.id === answer)
      if (!opt || opt.weight === undefined) return null
      const max = Math.max(...q.options.map(o => o.weight ?? 0), 4)
      return max === 0 ? 0 : Math.round((opt.weight / max) * 100)
    }

    case 'single_select':
      return null  // not scored
  }
}

// ── Dimension scores ─────────────────────────────────────────────────────────
function dimensionScore(qs: Question[], answers: Answers, dim: DimensionScore['dimension']): number {
  const subset = qs.filter(q => q.dimension === dim)
  const scores = subset
    .map(q => scoreQuestion(q, answers[q.id]))
    .filter((s): s is number => s !== null)
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

// ── Archetype mapping ────────────────────────────────────────────────────────
function pickArchetype(d: ScoredResult['dimensionScores'], total: number): ArchetypeId {
  // Strong signals first
  const adoptionHigh   = d.adoption   >= 70
  const governanceLow  = d.governance <= 30
  const governanceHigh = d.governance >= 70
  const skillLow       = d.skill      <= 30

  // Shadow operator: high adoption + low governance, regardless of total
  if (adoptionHigh && governanceLow) return 'shadow_operator'

  if (total < 30) return 'lagging_builder'
  if (total < 50) {
    // Below average — split by trajectory: skilled but disengaged → curious; unskilled → lagging
    return skillLow ? 'lagging_builder' : 'curious_skeptic'
  }
  if (total < 70) return 'pragmatist'
  // 70+
  if (governanceHigh) return 'strategist'
  return 'power_user'
}

// ── Public ───────────────────────────────────────────────────────────────────
export function scoreAssessment(role: Role, answers: Answers): ScoredResult {
  const scoring = getScoringQuestions(role)

  const dimensionScores: ScoredResult['dimensionScores'] = {
    adoption:   dimensionScore(scoring, answers, 'adoption'),
    workflow:   dimensionScore(scoring, answers, 'workflow'),
    outcome:    dimensionScore(scoring, answers, 'outcome'),
    data:       dimensionScore(scoring, answers, 'data'),
    skill:      dimensionScore(scoring, answers, 'skill'),
    governance: dimensionScore(scoring, answers, 'governance'),
  }

  const present = Object.values(dimensionScores).filter(s => s > 0 || s === 0) // all present
  const totalScore = Math.round(present.reduce((a, b) => a + b, 0) / present.length)

  const archetype = pickArchetype(dimensionScores, totalScore)

  return { dimensionScores, totalScore, archetype }
}
