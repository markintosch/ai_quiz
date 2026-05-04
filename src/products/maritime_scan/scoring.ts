// FILE: src/products/maritime_scan/scoring.ts
// ──────────────────────────────────────────────────────────────────────────────
// Scoring for the Maritime Compliance Readiness Scan.
//
// Per question: every option carries a weight 0..100.
//   - single_select → score = the picked option's weight
//   - multiselect   → score = max weight of all selected options
//                     (rationale: the strongest channel a scan flows through is
//                      the one that defines posture; the weakest "leaks" but
//                      doesn't drag the dimension down further than missing it
//                      altogether — see q3 "passport scan channels")
//
// Per dimension: average across all answered questions tagged to that dimension.
// Total score: weighted average across the 6 dimensions (equal weights for now).
// Posture: pick the first POSTURES entry whose scoreMax >= total.

import {
  type Question, type DimensionId, type PostureId, type Role, type Lang,
  getQuestions, getContent,
} from './data'

export type Answers = Record<string, string | string[] | undefined>

export type DimensionScore = {
  id:        DimensionId
  label:     string
  icon:      string
  raw:       number  // 0..100
  count:     number  // number of questions contributing
}

export type ScoredAssessment = {
  totalScore:      number               // 0..100
  posture:         PostureId
  dimensionScores: DimensionScore[]
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function singleScore(q: Question, picked: string | undefined): number | null {
  if (!picked) return null
  const opt = q.options.find(o => o.id === picked)
  return opt && typeof opt.weight === 'number' ? opt.weight : null
}

function multiScore(q: Question, picked: string[] | undefined): number | null {
  if (!picked || picked.length === 0) return null
  const weights: number[] = []
  for (const id of picked) {
    const opt = q.options.find(o => o.id === id)
    if (opt && typeof opt.weight === 'number') weights.push(opt.weight)
  }
  if (weights.length === 0) return null
  return Math.max(...weights)
}

function scoreOne(q: Question, raw: string | string[] | undefined): number | null {
  if (q.type === 'multiselect') return multiScore(q, Array.isArray(raw) ? raw : raw ? [raw] : undefined)
  return singleScore(q, Array.isArray(raw) ? raw[0] : raw)
}

// ── Public scorer ───────────────────────────────────────────────────────────

export function scoreAssessment(role: Role, answers: Answers, lang: Lang = 'nl'): ScoredAssessment {
  const t = getContent(lang)
  const questions = getQuestions(role, lang)

  // Aggregate per dimension
  const buckets: Record<DimensionId, { sum: number; n: number }> = {
    documentation:   { sum: 0, n: 0 },
    psc_readiness:   { sum: 0, n: 0 },
    data_protection: { sum: 0, n: 0 },
    interop:         { sum: 0, n: 0 },
    cycle_time:      { sum: 0, n: 0 },
    esg:             { sum: 0, n: 0 },
  }

  for (const q of questions) {
    const s = scoreOne(q, answers[q.id])
    if (s === null) continue
    buckets[q.dimension].sum += s
    buckets[q.dimension].n   += 1
  }

  // Build per-dimension score list (in display order from t.DIMENSIONS)
  const dimensionScores: DimensionScore[] = t.DIMENSIONS.map(d => {
    const b   = buckets[d.id]
    const raw = b.n > 0 ? Math.round(b.sum / b.n) : 0
    return {
      id:    d.id,
      label: d.name,
      icon:  d.icon,
      raw,
      count: b.n,
    }
  })

  // Total: average of per-dimension scores, ignoring dimensions that received
  // zero questions (e.g. a role-specific dimension that the picked role has no
  // question for would otherwise pull the average down).
  const contributing = dimensionScores.filter(d => d.count > 0)
  const totalScore = contributing.length > 0
    ? Math.round(contributing.reduce((acc, d) => acc + d.raw, 0) / contributing.length)
    : 0

  // Posture: first band whose scoreMax >= totalScore (POSTURES is sorted ascending)
  const postureMatch = t.POSTURES.find(p => totalScore <= p.scoreMax) ?? t.POSTURES[t.POSTURES.length - 1]

  return {
    totalScore,
    posture: postureMatch.id,
    dimensionScores,
  }
}

// ── Convenience for the submit route — typed to accept the JSON shape ──────

export type ScoreInput = {
  role:    Role
  answers: Answers
  lang?:   Lang
}

export function scoreFromInput(input: ScoreInput): ScoredAssessment {
  return scoreAssessment(input.role, input.answers, input.lang ?? 'nl')
}
