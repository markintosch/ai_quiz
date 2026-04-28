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
