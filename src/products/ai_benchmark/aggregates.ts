// Aggregate respondent answers into per-question peer comparisons.
// Used by the "Hoe je je verhoudt" dashboard on the results page.

import { type Question } from './data'

export type QuestionAggregate = {
  questionId:        string
  totalRespondents:  number
  optionCounts:      Record<string, number>  // optionId → count
  optionPct:         Record<string, number>  // optionId → %
}

type ResponseRow = {
  role:    string
  answers: Record<string, unknown>
}

// ── Real aggregator ─────────────────────────────────────────────────────────
export function computeAggregates(
  rows: ResponseRow[],
  questions: Question[],
): Record<string, QuestionAggregate> {
  const out: Record<string, QuestionAggregate> = {}

  for (const q of questions) {
    if (q.type === 'matrix') continue   // matrix needs its own per-row aggregation; skipped for v1

    const counts: Record<string, number> = {}
    let n = 0

    for (const r of rows) {
      const a = r.answers?.[q.id]
      if (a === undefined || a === null) continue
      n++

      let ids: string[] = []
      if (Array.isArray(a)) {
        ids = a.filter((x): x is string =>
          typeof x === 'string' && x.length > 0 && !x.startsWith('other_detail:')
        )
      } else if (typeof a === 'string' && a.length > 0) {
        ids = [a]
      }

      for (const id of ids) counts[id] = (counts[id] || 0) + 1
    }

    const pct: Record<string, number> = {}
    for (const opt of q.options) {
      pct[opt.id] = n === 0 ? 0 : Math.round(((counts[opt.id] || 0) / n) * 100)
    }

    out[q.id] = { questionId: q.id, totalRespondents: n, optionCounts: counts, optionPct: pct }
  }

  return out
}

// ── Mock generator for ?preview=1 ───────────────────────────────────────────
// Deterministic LCG so the preview looks the same every reload.
export function mockAggregates(
  questions: Question[],
  seed = 42,
  N = 247,
): Record<string, QuestionAggregate> {
  let s = seed
  const rand = () => {
    s = ((s * 1664525) + 1013904223) >>> 0
    return s / 0xFFFFFFFF
  }

  const out: Record<string, QuestionAggregate> = {}

  for (const q of questions) {
    if (q.type === 'matrix') continue

    const counts: Record<string, number> = {}
    const pct:    Record<string, number> = {}

    if (q.type === 'multiselect') {
      // Independent adoption %, 8–78 range — feels realistic for tool/use-case Qs.
      for (const opt of q.options) {
        const p = Math.round(rand() * 70 + 8)
        pct[opt.id]    = p
        counts[opt.id] = Math.round((N * p) / 100)
      }
    } else {
      // Distribution that sums to ~100 across options.
      const raws = q.options.map(() => rand() + 0.05)
      const sum  = raws.reduce((a, b) => a + b, 0)
      q.options.forEach((opt, i) => {
        const p = Math.round((raws[i] / sum) * 100)
        pct[opt.id]    = p
        counts[opt.id] = Math.round((N * p) / 100)
      })
    }

    out[q.id] = { questionId: q.id, totalRespondents: N, optionCounts: counts, optionPct: pct }
  }

  return out
}

// ── Helpers ─────────────────────────────────────────────────────────────────
export function userSelectedIds(answer: unknown): string[] {
  if (answer === undefined || answer === null) return []
  if (Array.isArray(answer)) {
    return answer.filter((x): x is string =>
      typeof x === 'string' && !x.startsWith('other_detail:')
    )
  }
  if (typeof answer === 'string') return [answer]
  return []
}

// ── Skill curve (Q10 trajectory) ────────────────────────────────────────────
// Q10 is a matrix question with 3 rows (12mo / 6mo / 3mo) + 5 ability levels.
// Aggregate gives the % of respondents at each level per timeframe — a moving
// picture of how the whole field has leveled up.

export const SKILL_LEVELS  = ['never', 'beginner', 'comfortable', 'experienced', 'expert'] as const
export const SKILL_LEVEL_LABELS_NL: Record<string, string> = {
  never:       'Niet gebruikt',
  beginner:    'Beginner',
  comfortable: 'Comfortabel',
  experienced: 'Ervaren',
  expert:      'Expert',
}
export const SKILL_TIMEFRAMES = ['m12', 'm6', 'm3'] as const
export const SKILL_TIMEFRAME_LABELS_NL: Record<string, string> = {
  m12: '12 mnd geleden',
  m6:  '6 mnd geleden',
  m3:  '3 mnd geleden',
  now: 'Nu',
}

export type SkillCurvePoint = {
  timeframe: 'm12' | 'm6' | 'm3' | 'now'
  totals:    Record<string, number>  // level → count
  pct:       Record<string, number>  // level → %
  avgIndex:  number                  // weighted average level index 0..4
}

export type SkillCurve = {
  totalRespondents: number
  points:           SkillCurvePoint[]
  fieldShift:       number  // avgIndex(now) − avgIndex(12mo)
}

export function computeSkillCurve(rows: { answers: Record<string, unknown> }[]): SkillCurve {
  // Q10 answer shape: ['m12_level', 'm6_level', 'm3_level'] indexed by row.
  // For 'now', we use the most recent row (m3) — the questionnaire doesn't
  // have a literal "now" cell; the most recent self-assessment IS now.
  const tfData: Record<string, Record<string, number>> = { m12: {}, m6: {}, m3: {}, now: {} }
  let n = 0

  for (const r of rows) {
    const a = r.answers?.q10
    if (!Array.isArray(a) || a.length < 3) continue
    n++
    const m12 = String(a[0] ?? ''); const m6 = String(a[1] ?? ''); const m3 = String(a[2] ?? '')
    if (m12) tfData.m12[m12] = (tfData.m12[m12] || 0) + 1
    if (m6)  tfData.m6[m6]   = (tfData.m6[m6]   || 0) + 1
    if (m3)  tfData.m3[m3]   = (tfData.m3[m3]   || 0) + 1
    if (m3)  tfData.now[m3]  = (tfData.now[m3]  || 0) + 1
  }

  const points: SkillCurvePoint[] = (['m12', 'm6', 'm3', 'now'] as const).map(tf => {
    const totals = tfData[tf]
    const total  = Object.values(totals).reduce((a, b) => a + b, 0)
    const pct: Record<string, number> = {}
    let weighted = 0
    SKILL_LEVELS.forEach((lvl, i) => {
      pct[lvl]   = total === 0 ? 0 : Math.round(((totals[lvl] || 0) / total) * 100)
      weighted  += i * (totals[lvl] || 0)
    })
    return { timeframe: tf, totals, pct, avgIndex: total === 0 ? 0 : weighted / total }
  })

  const fieldShift = points[points.length - 1].avgIndex - points[0].avgIndex

  return { totalRespondents: n, points, fieldShift }
}

export function mockSkillCurve(seed = 7): SkillCurve {
  // A plausible "field is leveling up" curve — fewer 'never'/'beginner' over
  // time, more 'experienced'/'expert'.
  const points: SkillCurvePoint[] = ([
    { tf: 'm12' as const, p: { never: 38, beginner: 36, comfortable: 18, experienced: 7,  expert: 1  } },
    { tf: 'm6'  as const, p: { never: 22, beginner: 32, comfortable: 26, experienced: 16, expert: 4  } },
    { tf: 'm3'  as const, p: { never: 11, beginner: 24, comfortable: 30, experienced: 26, expert: 9  } },
    { tf: 'now' as const, p: { never: 6,  beginner: 17, comfortable: 30, experienced: 33, expert: 14 } },
  ]).map(({ tf, p }) => {
    let weighted = 0
    SKILL_LEVELS.forEach((lvl, i) => { weighted += i * (p as Record<string, number>)[lvl] })
    return {
      timeframe: tf,
      totals: Object.fromEntries(Object.entries(p).map(([k, v]) => [k, Math.round(247 * v / 100)])),
      pct: p as Record<string, number>,
      avgIndex: weighted / 100,
    }
  })
  void seed
  return {
    totalRespondents: 247,
    points,
    fieldShift: points[points.length - 1].avgIndex - points[0].avgIndex,
  }
}

export function userSkillShift(answer: unknown): number | null {
  if (!Array.isArray(answer) || answer.length < 3) return null
  const idxs = answer.slice(0, 3).map(a => SKILL_LEVELS.indexOf(a as typeof SKILL_LEVELS[number]))
  if (idxs.some(i => i < 0)) return null
  return idxs[2] - idxs[0]
}

// ── Sub-insight selectors ───────────────────────────────────────────────────
// Pick auto-generated insight strings. Used for the "What sets you apart" + the
// rotating insight strip on the results page.

export type Insight = {
  kind:   'distinctive' | 'gap' | 'tribe' | 'mover' | 'blocker' | 'time'
  emoji:  string
  title:  string
  body:   string
  trend?: 'up' | 'down' | 'flat'
  delta?: string  // e.g. "+12pp"
}

// Selector: tools/use-cases the user picked that few peers picked.
export function distinctiveInsights(
  questionId: string,
  agg: QuestionAggregate,
  userIds: string[],
  optionLabel: (id: string) => string,
  max = 1,
): Insight[] {
  const out: Insight[] = []
  const sortedByLow = userIds
    .filter(id => id !== 'none' && agg.optionPct[id] !== undefined && agg.optionPct[id] > 0)
    .sort((a, b) => agg.optionPct[a] - agg.optionPct[b])
  for (const id of sortedByLow.slice(0, max)) {
    out.push({
      kind:  'distinctive',
      emoji: '🦄',
      title: `Slechts ${agg.optionPct[id]}% gebruikt ${optionLabel(id)}`,
      body:  `Jij wel — dat is een onderscheidende keuze in jouw segment.`,
    })
  }
  void questionId
  return out
}

// Selector: most-adopted option the user did NOT pick.
export function gapInsights(
  agg: QuestionAggregate,
  userIds: string[],
  optionLabel: (id: string) => string,
  max = 1,
): Insight[] {
  const sortedByHigh = Object.entries(agg.optionPct)
    .filter(([id, pct]) => !userIds.includes(id) && id !== 'none' && pct >= 25)
    .sort((a, b) => b[1] - a[1])
  return sortedByHigh.slice(0, max).map(([id, pct]) => ({
    kind:  'gap',
    emoji: '🎯',
    title: `${pct}% gebruikt ${optionLabel(id)} — jij niet`,
    body:  `Een populaire keuze in jouw segment die op je radar mag.`,
  }))
}
