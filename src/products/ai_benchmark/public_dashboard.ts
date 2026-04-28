// Aggregator for the public /ai_benchmark/dashboard page.
// Pulls real submissions + falls back to mock data when N is too small.

import { type Question, getQuestions, type Role, getContent } from './data'
import {
  computeSkillCurve, mockSkillCurve, type SkillCurve,
  computeAggregates, type QuestionAggregate,
} from './aggregates'

const NL = getContent('nl')

export type RoleId = 'marketing' | 'sales' | 'hybrid'
const ROLES: RoleId[] = ['marketing', 'sales', 'hybrid']

export type DashboardData = {
  totalRespondents: number
  lastUpdated:      Date
  usingMock:        boolean

  byRole:           Record<RoleId, number>

  archetypeDist:    { id: string; label: string; emoji: string; count: number; pct: number }[]

  // Average dimension scores per role (for the radar)
  dimensionAvgsByRole: Record<RoleId, Record<string, number>>

  // Heatmap rows = roles, cols = top tools
  topTools:         { id: string; label: string }[]
  toolAdoptionByRole: Record<RoleId, Record<string, number>>  // tool → %

  // Top blockers per role
  topBlockersByRole: Record<RoleId, { id: string; label: string; pct: number }[]>

  // Skill curve (12mo → now)
  skillCurve:       SkillCurve

  // Time-saved distribution (% of respondents in each bucket)
  timeSavedDist:    { id: string; label: string; pct: number }[]

  // Use-case adoption (Q4) — for the marquee one-liner
  topUseCases:      { id: string; label: string; pct: number }[]
}

type Row = {
  role:             string
  archetype:        string
  dimension_scores: Record<string, number> | null
  answers:          Record<string, unknown> | null
  created_at:       string
}

// ── Real aggregator ─────────────────────────────────────────────────────────
export function computePublicDashboard(rows: Row[]): DashboardData {
  const total = rows.length

  const byRole: Record<RoleId, number> = { marketing: 0, sales: 0, hybrid: 0 }
  for (const r of rows) {
    if (r.role === 'marketing' || r.role === 'sales' || r.role === 'hybrid') {
      byRole[r.role]++
    }
  }

  // Archetype distribution
  const archCounts: Record<string, number> = {}
  for (const r of rows) {
    if (r.archetype) archCounts[r.archetype] = (archCounts[r.archetype] || 0) + 1
  }
  const archetypeDist = NL.ARCHETYPES.map(a => ({
    id:    a.id,
    label: a.name,
    emoji: a.emoji,
    count: archCounts[a.id] || 0,
    pct:   total === 0 ? 0 : Math.round(((archCounts[a.id] || 0) / total) * 100),
  })).sort((a, b) => b.pct - a.pct)

  // Dimension avgs per role
  const dimSums:  Record<RoleId, Record<string, number[]>> = {
    marketing: {}, sales: {}, hybrid: {},
  }
  for (const r of rows) {
    const role = r.role as RoleId
    if (!ROLES.includes(role)) continue
    const ds = r.dimension_scores
    if (!ds) continue
    for (const [k, v] of Object.entries(ds)) {
      if (typeof v !== 'number') continue
      ;(dimSums[role][k] ||= []).push(v)
    }
  }
  const dimensionAvgsByRole: Record<RoleId, Record<string, number>> = {
    marketing: {}, sales: {}, hybrid: {},
  }
  for (const role of ROLES) {
    for (const [k, arr] of Object.entries(dimSums[role])) {
      dimensionAvgsByRole[role][k] = arr.length === 0
        ? 0
        : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
    }
  }

  // Tools heatmap — Q2 (specialised stack)
  const q2 = getQuestions('marketing').find(q => q.id === 'q2')
  const toolLabels: Record<string, string> = {}
  if (q2) for (const opt of q2.options) toolLabels[opt.id] = opt.label

  const toolCountsByRole: Record<RoleId, Record<string, number>> = {
    marketing: {}, sales: {}, hybrid: {},
  }
  for (const r of rows) {
    const role = r.role as RoleId
    if (!ROLES.includes(role)) continue
    const a = r.answers?.q2
    if (!Array.isArray(a)) continue
    for (const t of a) {
      if (typeof t !== 'string' || t.startsWith('other_detail:') || t === 'none') continue
      toolCountsByRole[role][t] = (toolCountsByRole[role][t] || 0) + 1
    }
  }
  const toolAdoptionByRole: Record<RoleId, Record<string, number>> = {
    marketing: {}, sales: {}, hybrid: {},
  }
  for (const role of ROLES) {
    const denom = byRole[role]
    for (const [t, c] of Object.entries(toolCountsByRole[role])) {
      toolAdoptionByRole[role][t] = denom === 0 ? 0 : Math.round((c / denom) * 100)
    }
  }
  // Pick top-N tools by overall adoption to keep the heatmap compact
  const overallTool: Record<string, number> = {}
  for (const role of ROLES) {
    for (const [t, c] of Object.entries(toolCountsByRole[role])) {
      overallTool[t] = (overallTool[t] || 0) + c
    }
  }
  const topToolIds = Object.entries(overallTool)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id)
  const topTools = topToolIds.map(id => ({ id, label: toolLabels[id] || id }))

  // Top blockers per role — Q17
  const q17 = getQuestions('marketing').find(q => q.id === 'q17')
  const blockerLabels: Record<string, string> = {}
  if (q17) for (const opt of q17.options) blockerLabels[opt.id] = opt.label

  const blockerCountsByRole: Record<RoleId, Record<string, number>> = {
    marketing: {}, sales: {}, hybrid: {},
  }
  for (const r of rows) {
    const role = r.role as RoleId
    if (!ROLES.includes(role)) continue
    const a = r.answers?.q17
    if (!Array.isArray(a)) continue
    for (const b of a) {
      if (typeof b !== 'string' || b === 'none') continue
      blockerCountsByRole[role][b] = (blockerCountsByRole[role][b] || 0) + 1
    }
  }
  const topBlockersByRole: Record<RoleId, { id: string; label: string; pct: number }[]> = {
    marketing: [], sales: [], hybrid: [],
  }
  for (const role of ROLES) {
    const denom = byRole[role]
    topBlockersByRole[role] = Object.entries(blockerCountsByRole[role])
      .map(([id, c]) => ({ id, label: blockerLabels[id] || id, pct: denom === 0 ? 0 : Math.round((c / denom) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3)
  }

  // Skill curve from Q10
  const skillCurve = computeSkillCurve(rows.map(r => ({ answers: r.answers || {} })))

  // Time saved (Q6) overall
  const q6 = getQuestions('marketing').find(q => q.id === 'q6')
  const timeAgg: QuestionAggregate | undefined = q6
    ? computeAggregates(rows.map(r => ({ role: r.role, answers: r.answers || {} })), [q6])['q6']
    : undefined
  const timeSavedDist = q6 && timeAgg
    ? q6.options.map(o => ({ id: o.id, label: o.label, pct: timeAgg.optionPct[o.id] ?? 0 }))
    : []

  // Top use cases (Q4)
  const q4 = getQuestions('marketing').find(q => q.id === 'q4')
  const useAgg: QuestionAggregate | undefined = q4
    ? computeAggregates(rows.map(r => ({ role: r.role, answers: r.answers || {} })), [q4])['q4']
    : undefined
  const topUseCases = q4 && useAgg
    ? q4.options
        .filter(o => o.id !== 'none')
        .map(o => ({ id: o.id, label: o.label, pct: useAgg.optionPct[o.id] ?? 0 }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 5)
    : []

  return {
    totalRespondents: total,
    lastUpdated:      new Date(),
    usingMock:        false,
    byRole,
    archetypeDist,
    dimensionAvgsByRole,
    topTools,
    toolAdoptionByRole,
    topBlockersByRole,
    skillCurve,
    timeSavedDist,
    topUseCases,
  }
}

// ── Mock generator (when real N too small) ──────────────────────────────────
export function mockPublicDashboard(): DashboardData {
  const total = 247
  const byRole: Record<RoleId, number> = { marketing: 132, sales: 84, hybrid: 31 }

  const archetypes = NL.ARCHETYPES.map(a => ({ id: a.id, label: a.name, emoji: a.emoji }))
  const archPcts: Record<string, number> = {
    pragmatist: 28, power_user: 14, curious_skeptic: 19,
    strategist: 12, lagging_builder: 17, shadow_operator: 10,
  }
  const archetypeDist = archetypes.map(a => ({
    ...a, count: Math.round(total * (archPcts[a.id] || 0) / 100), pct: archPcts[a.id] || 0,
  })).sort((a, b) => b.pct - a.pct)

  const dimensionAvgsByRole: Record<RoleId, Record<string, number>> = {
    marketing: { adoption: 64, workflow: 52, outcome: 58, data: 49, skill: 56, governance: 47 },
    sales:     { adoption: 71, workflow: 61, outcome: 64, data: 55, skill: 60, governance: 42 },
    hybrid:    { adoption: 68, workflow: 66, outcome: 60, data: 58, skill: 64, governance: 58 },
  }

  const topTools = [
    { id: 'notion_ai', label: 'Notion AI' },
    { id: 'jasper',    label: 'Jasper' },
    { id: 'clay',      label: 'Clay' },
    { id: 'apollo',    label: 'Apollo' },
    { id: 'canva_magic', label: 'Canva Magic Studio' },
    { id: 'gong',      label: 'Gong' },
    { id: 'lavender',  label: 'Lavender' },
    { id: 'midjourney',label: 'Midjourney' },
    { id: 'fathom',    label: 'Fathom / Granola / Otter' },
    { id: 'hubspot_ai',label: 'HubSpot AI (Breeze)' },
  ]
  const toolAdoptionByRole: Record<RoleId, Record<string, number>> = {
    marketing: { notion_ai: 62, jasper: 58, clay: 8,  apollo: 11, canva_magic: 71, gong: 6,  lavender: 9,  midjourney: 54, fathom: 32, hubspot_ai: 47 },
    sales:     { notion_ai: 41, jasper: 12, clay: 56, apollo: 64, canva_magic: 18, gong: 49, lavender: 38, midjourney: 6,  fathom: 58, hubspot_ai: 51 },
    hybrid:    { notion_ai: 55, jasper: 31, clay: 38, apollo: 42, canva_magic: 44, gong: 28, lavender: 24, midjourney: 26, fathom: 49, hubspot_ai: 60 },
  }

  const topBlockersByRole: Record<RoleId, { id: string; label: string; pct: number }[]> = {
    marketing: [
      { id: 'strategy', label: 'Geen strategie',          pct: 47 },
      { id: 'time',     label: 'Geen tijd',               pct: 38 },
      { id: 'leadership', label: 'Leiderschap niet aan boord', pct: 31 },
    ],
    sales: [
      { id: 'data',     label: 'Data niet op orde',       pct: 42 },
      { id: 'skill',    label: 'Vaardigheden',            pct: 36 },
      { id: 'compliance', label: 'Privacy / compliance',  pct: 28 },
    ],
    hybrid: [
      { id: 'strategy', label: 'Geen strategie',          pct: 51 },
      { id: 'budget',   label: 'Geen budget',             pct: 33 },
      { id: 'leadership', label: 'Leiderschap niet aan boord', pct: 29 },
    ],
  }

  const skillCurve = mockSkillCurve()

  const timeSavedDist = [
    { id: 'lt1',  label: '<1 uur',     pct: 9  },
    { id: '1_3',  label: '1–3 uur',    pct: 28 },
    { id: '4_8',  label: '4–8 uur',    pct: 36 },
    { id: '8_15', label: '8–15 uur',   pct: 19 },
    { id: '15p',  label: '15+ uur',    pct: 8  },
  ]

  const topUseCases = [
    { id: 'draft',     label: 'Schrijven (concept)', pct: 78 },
    { id: 'research',  label: 'Research',            pct: 71 },
    { id: 'summarize', label: 'Samenvatten',         pct: 64 },
    { id: 'ideation',  label: 'Ideation / brainstorm', pct: 58 },
    { id: 'imagery',   label: 'Beeld / video',       pct: 41 },
  ]

  return {
    totalRespondents: total,
    lastUpdated:      new Date(),
    usingMock:        true,
    byRole,
    archetypeDist,
    dimensionAvgsByRole,
    topTools,
    toolAdoptionByRole,
    topBlockersByRole,
    skillCurve,
    timeSavedDist,
    topUseCases,
  }
}
