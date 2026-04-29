// Aggregator for the public Tool Wall (/ai_benchmark/tools).
// Combines two data sources:
//   1. Q2 mentions per role (drawn from ai_benchmark_responses.answers.q2)
//   2. Community votes (ai_benchmark_tool_votes — one row per tool×session)
//
// Output: two ranked lists (marketing / sales) and a vote lookup map.
// Falls back to mock data when N too low so the page is meaningful from day 1.

import { mockPublicDashboard } from './public_dashboard'

const MIN_REAL_THRESHOLD = 30  // below this, use mock mention percentages

export type ToolEntry = {
  id:         string
  label:      string
  mentions:   number
  pct:        number   // % of this role's respondents who mention the tool
  voteScore:  number
  voterCount: number
}

export type ToolWalls = {
  marketing: ToolEntry[]
  sales:     ToolEntry[]
  votesById: Record<string, { score: number; count: number }>
  totalRespondents: { marketing: number; sales: number }
  usingMock: boolean
}

type Row = {
  role:    string
  answers: Record<string, unknown> | null
}

type Vote = {
  tool_id:   string
  direction: number  // +1 | -1
}

export function computeToolWalls(
  rows: Row[],
  votes: Vote[],
  toolLabels: Record<string, string>,
  topN = 15,
): ToolWalls {
  // ── Vote tally ─────────────────────────────────────────────────────────
  const votesById: Record<string, { score: number; count: number }> = {}
  for (const v of votes) {
    if (!votesById[v.tool_id]) votesById[v.tool_id] = { score: 0, count: 0 }
    votesById[v.tool_id].score += v.direction
    votesById[v.tool_id].count += 1
  }

  // ── Mention counts per role ────────────────────────────────────────────
  const counts: Record<'marketing' | 'sales', Record<string, number>> = {
    marketing: {}, sales: {},
  }
  const totals = { marketing: 0, sales: 0 }
  for (const r of rows) {
    if (r.role !== 'marketing' && r.role !== 'sales') continue
    totals[r.role]++
    const a = r.answers?.q2
    if (!Array.isArray(a)) continue
    for (const t of a) {
      if (typeof t !== 'string' || t === 'none' || t.startsWith('other_detail:')) continue
      counts[r.role][t] = (counts[r.role][t] || 0) + 1
    }
  }

  let usingMock = false
  if (totals.marketing + totals.sales < MIN_REAL_THRESHOLD) {
    usingMock = true
    // Use mock dashboard's tool adoption % to seed the lists.
    const mock = mockPublicDashboard()
    totals.marketing = mock.byRole.marketing
    totals.sales     = mock.byRole.sales
    for (const tool of mock.topTools) {
      const m = mock.toolAdoptionByRole.marketing[tool.id] ?? 0
      const s = mock.toolAdoptionByRole.sales[tool.id]     ?? 0
      counts.marketing[tool.id] = Math.round((m / 100) * totals.marketing)
      counts.sales[tool.id]     = Math.round((s / 100) * totals.sales)
    }
    // Also seed any tools that aren't in mock.topTools but ARE in toolLabels
    for (const id of Object.keys(toolLabels)) {
      if (counts.marketing[id] === undefined) counts.marketing[id] = 0
      if (counts.sales[id] === undefined)     counts.sales[id] = 0
    }
  }

  function rank(role: 'marketing' | 'sales'): ToolEntry[] {
    const total = totals[role]
    return Object.entries(counts[role])
      .map(([id, n]) => {
        const v = votesById[id] ?? { score: 0, count: 0 }
        return {
          id,
          label:     toolLabels[id] ?? id,
          mentions:  n,
          pct:       total === 0 ? 0 : Math.round((n / total) * 100),
          voteScore: v.score,
          voterCount:v.count,
        }
      })
      // Drop fully-empty entries to keep the list tight
      .filter(e => e.mentions > 0 || e.voteScore !== 0)
      // Sort by combined signal: vote score weighted slightly higher than raw mentions
      .sort((a, b) => (b.voteScore * 5 + b.mentions) - (a.voteScore * 5 + a.mentions))
      .slice(0, topN)
  }

  return {
    marketing: rank('marketing'),
    sales:     rank('sales'),
    votesById,
    totalRespondents: totals,
    usingMock,
  }
}
