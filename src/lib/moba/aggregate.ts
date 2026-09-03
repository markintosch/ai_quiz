// FILE: src/lib/moba/aggregate.ts
// ─── MOBA group-report aggregation ────────────────────────────────────────────
// Pure functions. Used by the demo dashboard now and the real Fase B report later.
// The whole point of this survey is the SPREAD, so every dimension carries its
// full distribution (min/max/std/values), not just a mean.

import { MOBA_MARKETING_CONFIG, MOBA_ROLE_QUESTION } from '@/products/moba_marketing/config'

export interface MobaSubmissionLike {
  /** { moba_positioning: 60, ... } normalised 0–100 per dimension */
  dimension_scores: Record<string, number>
  /** { moba_positioning: 3, ... } 10-point allocation */
  priorities: Record<string, number>
  /** { q20: "...", ... } */
  open_answers: Record<string, string>
  /** 1 = techniek-/productgedreven … 5 = markt-/klantgedreven, or null */
  segment: number | null
  /** { selected: ["partner", ...], other: "..." } — rol-van-marketing vraag */
  role_answers?: { selected?: string[]; other?: string } | null
}

export interface DimensionAgg {
  key: string
  label: string
  icon?: string
  n: number
  mean: number      // 0–100
  min: number
  max: number
  std: number       // population std, 0–100 scale
  range: number     // max − min
  values: number[]  // individual normalised scores
  level: string     // maturity label
  /** Total priority points this dimension received across the team */
  priorityPoints: number
  /** Share of all priority points (0–100) */
  prioritySharePct: number
}

export interface SegmentAgg {
  /** mean per dimension for the "techniek-gedreven" group (segment ≤ 2) */
  techniek: Record<string, number> | null
  /** mean per dimension for the "markt-gedreven" group (segment ≥ 4) */
  markt: Record<string, number> | null
  techniekN: number
  marktN: number
}

export interface RoleAgg {
  /** How many respondents picked at least one option or wrote an addition */
  n: number
  /** Per option: code, label, how many picked it, and share of respondents (0–100) */
  options: { code: string; label: string; count: number; sharePct: number }[]
  /** Free-text "anders, namelijk" additions */
  otherAnswers: string[]
}

export interface MobaAggregate {
  n: number
  overallMean: number
  overallLevel: string
  dimensions: DimensionAgg[]
  /** Dimensions ranked by spread (std) descending — the discussion topics */
  mostDivergent: DimensionAgg[]
  segments: SegmentAgg
  openAnswers: { key: string; text: string; answers: string[] }[]
  role: RoleAgg
}

const DIMS = MOBA_MARKETING_CONFIG.dimensions
const THRESHOLDS = MOBA_MARKETING_CONFIG.scoring.maturityThresholds

export function maturityLevelFor(score: number): string {
  for (const t of THRESHOLDS) if (score <= t.maxScore) return t.level
  return THRESHOLDS[THRESHOLDS.length - 1]?.level ?? '—'
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function stddev(xs: number[]): number {
  if (xs.length < 2) return 0
  const m = mean(xs)
  return Math.sqrt(mean(xs.map(x => (x - m) ** 2)))
}

export function aggregateMoba(
  submissions: MobaSubmissionLike[],
  openQuestions: { key: string; text: string }[],
  roleOptions: { code: string; label: string }[] = MOBA_ROLE_QUESTION.options.map(o => ({ code: o.code, label: o.label }))
): MobaAggregate {
  const n = submissions.length

  const totalPriorityPoints = submissions.reduce(
    (sum, s) => sum + DIMS.reduce((d, dim) => d + (s.priorities[dim.key] ?? 0), 0),
    0
  ) || 1

  const dimensions: DimensionAgg[] = DIMS.map(dim => {
    const values = submissions
      .map(s => s.dimension_scores[dim.key])
      .filter((v): v is number => typeof v === 'number')
    const m = Math.round(mean(values))
    const min = values.length ? Math.min(...values) : 0
    const max = values.length ? Math.max(...values) : 0
    const priorityPoints = submissions.reduce((sum, s) => sum + (s.priorities[dim.key] ?? 0), 0)
    return {
      key: dim.key,
      label: dim.label,
      icon: dim.icon,
      n: values.length,
      mean: m,
      min,
      max,
      std: Math.round(stddev(values) * 10) / 10,
      range: max - min,
      values,
      level: maturityLevelFor(m),
      priorityPoints,
      prioritySharePct: Math.round((priorityPoints / totalPriorityPoints) * 100),
    }
  })

  const overallMean = Math.round(mean(dimensions.map(d => d.mean)))

  const mostDivergent = [...dimensions].sort((a, b) => b.std - a.std).slice(0, 3)

  // ── Segment overlay ──────────────────────────────────────────────────────
  const segMean = (pred: (seg: number) => boolean): { means: Record<string, number>; nn: number } => {
    const group = submissions.filter(s => s.segment != null && pred(s.segment))
    const means: Record<string, number> = {}
    for (const dim of DIMS) {
      const vals = group.map(s => s.dimension_scores[dim.key]).filter((v): v is number => typeof v === 'number')
      means[dim.key] = Math.round(mean(vals))
    }
    return { means, nn: group.length }
  }
  const tech = segMean(s => s <= 2)
  const mkt = segMean(s => s >= 4)

  const segments: SegmentAgg = {
    techniek: tech.nn > 0 ? tech.means : null,
    markt: mkt.nn > 0 ? mkt.means : null,
    techniekN: tech.nn,
    marktN: mkt.nn,
  }

  const openAnswers = openQuestions.map(q => ({
    key: q.key,
    text: q.text,
    answers: submissions
      .map(s => s.open_answers?.[q.key])
      .filter((a): a is string => typeof a === 'string' && a.trim().length > 0),
  }))

  // ── Rol-van-marketing aggregatie ─────────────────────────────────────────
  const roleSelectedLists = submissions.map(s =>
    Array.isArray(s.role_answers?.selected) ? s.role_answers!.selected! : []
  )
  const roleOtherAnswers = submissions
    .map(s => s.role_answers?.other)
    .filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
  const roleN = submissions.filter(
    (s, i) => roleSelectedLists[i].length > 0 || (typeof s.role_answers?.other === 'string' && s.role_answers.other.trim().length > 0)
  ).length
  const roleOptionsAgg = roleOptions.map(o => {
    const count = roleSelectedLists.filter(sel => sel.includes(o.code)).length
    return {
      code: o.code,
      label: o.label,
      count,
      sharePct: roleN > 0 ? Math.round((count / roleN) * 100) : 0,
    }
  })
  const role: RoleAgg = {
    n: roleN,
    options: roleOptionsAgg,
    otherAnswers: roleOtherAnswers,
  }

  return {
    n,
    overallMean,
    overallLevel: maturityLevelFor(overallMean),
    dimensions,
    mostDivergent,
    segments,
    openAnswers,
    role,
  }
}
