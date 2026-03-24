export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: Record<string, unknown>
}

const MATURITY_LEVELS = ['Unaware', 'Exploring', 'Experimenting', 'Scaling', 'Leading'] as const
type MaturityKey = (typeof MATURITY_LEVELS)[number]

const DIMENSIONS = [
  'strategy_vision',
  'current_usage',
  'data_readiness',
  'talent_culture',
  'governance_risk',
  'opportunity_awareness',
] as const

const DIMENSION_LABELS: Record<string, string> = {
  strategy_vision: 'Strategy',
  current_usage: 'Usage',
  data_readiness: 'Data',
  talent_culture: 'Talent',
  governance_risk: 'Governance',
  opportunity_awareness: 'Opportunity',
}

export async function GET() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Total respondents
  const { count: totalRespondents } = await supabase
    .from('respondents')
    .select('*', { count: 'exact', head: true })

  // Total responses
  const { count: totalResponses } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })

  // This week (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: thisWeek } = await supabase
    .from('respondents')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)

  // All responses for score calculations + trend
  const { data: allResponses } = await supabase
    .from('responses')
    .select('id, respondent_id, scores, maturity_level, created_at')
    .order('created_at', { ascending: true }) as unknown as {
      data: {
        id: string
        respondent_id: string
        scores: unknown
        maturity_level: string
        created_at: string
        quiz_type: string | null
      }[] | null
    }

  let avgScore = 0
  const scoreDistribution: Record<MaturityKey, number> = {
    Unaware: 0, Exploring: 0, Experimenting: 0, Scaling: 0, Leading: 0,
  }

  // Dimension averages
  const dimensionTotals: Record<string, number> = {}
  const dimensionCounts: Record<string, number> = {}
  for (const d of DIMENSIONS) { dimensionTotals[d] = 0; dimensionCounts[d] = 0 }

  // Weekly trend
  const weeklyMap: Map<string, { scores: number[]; count: number }> = new Map()

  // Quiz type split
  let liteCount = 0
  let fullCount = 0

  if (allResponses && allResponses.length > 0) {
    let totalScore = 0
    for (const r of allResponses) {
      if (!r.scores) continue                              // skip incomplete/null responses
      const scores = r.scores as unknown as ScoresJsonb
      if (typeof scores !== 'object') continue
      totalScore += scores.overall ?? 0

      const level = r.maturity_level as MaturityKey
      if (level in scoreDistribution) scoreDistribution[level]++

      for (const ds of scores.dimensionScores ?? []) {
        if (ds.dimension in dimensionTotals) {
          dimensionTotals[ds.dimension] += ds.normalized
          dimensionCounts[ds.dimension]++
        }
      }

      const date = new Date(r.created_at)
      const weekKey = getISOWeekLabel(date)
      if (!weeklyMap.has(weekKey)) weeklyMap.set(weekKey, { scores: [], count: 0 })
      const entry = weeklyMap.get(weekKey)!
      entry.scores.push(scores.overall ?? 0)
      entry.count++

      if (r.quiz_type === 'full') fullCount++
      else liteCount++
    }
    avgScore = Math.round(totalScore / allResponses.length)
  }

  // Dimension averages sorted worst → best
  const dimensionAverages = DIMENSIONS.map((d) => ({
    dimension: d,
    label: DIMENSION_LABELS[d],
    avg: dimensionCounts[d] > 0 ? Math.round(dimensionTotals[d] / dimensionCounts[d]) : 0,
  })).sort((a, b) => a.avg - b.avg)

  // Weekly trend — last 12 weeks, fill gaps with null
  const weeklyTrend = buildWeeklyTrend(weeklyMap, 12)

  // All respondents for industry + company size breakdown
  const { data: allRespondents } = await supabase
    .from('respondents')
    .select('industry, company_size, created_at')

  const industryMap: Record<string, number> = {}
  const companySizeMap: Record<string, number> = {}

  for (const r of allRespondents ?? []) {
    if (r.industry) industryMap[r.industry] = (industryMap[r.industry] ?? 0) + 1
    if (r.company_size) {
      const label = formatCompanySize(Number(r.company_size))
      companySizeMap[label] = (companySizeMap[label] ?? 0) + 1
    }
  }

  const industryBreakdown = Object.entries(industryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const companySizeBreakdown = Object.entries(companySizeMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // ── Mentor funnel ─────────────────────────────────────────────────────────
  const { data: mentorResponses } = await supabase
    .from('responses')
    .select('id, utm_source, utm_medium, utm_campaign, created_at, maturity_level')
    .eq('ref_source', 'mentor') as unknown as {
      data: { id: string; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; created_at: string; maturity_level: string }[] | null
    }

  const mentorTotal = mentorResponses?.length ?? 0
  const mentorBySource: Record<string, number> = {}
  for (const r of mentorResponses ?? []) {
    const src = r.utm_source ?? 'direct'
    mentorBySource[src] = (mentorBySource[src] ?? 0) + 1
  }
  const mentorSourceBreakdown = Object.entries(mentorBySource)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)

  // Last 10 responses + respondent info
  const last10 = (allResponses ?? []).slice(-10).reverse()
  const respondentIds = Array.from(new Set(last10.map((r) => r.respondent_id)))
  const { data: respondentsData } = respondentIds.length
    ? await supabase
        .from('respondents')
        .select('id, name, email, company_name')
        .in('id', respondentIds)
    : { data: [] }
  const respondentMap = new Map((respondentsData ?? []).map((r) => [r.id, r]))
  const recentResponses = last10.map((r) => {
    const scores = r.scores as unknown as ScoresJsonb
    const respondent = respondentMap.get(r.respondent_id)
    return {
      id: r.id,
      respondent_id: r.respondent_id,
      maturity_level: r.maturity_level,
      created_at: r.created_at,
      respondentName: respondent?.name ?? '',
      respondentEmail: respondent?.email ?? '',
      respondentCompany: respondent?.company_name ?? '',
      overallScore: scores.overall ?? 0,
    }
  })

  return NextResponse.json({
    totalRespondents: totalRespondents ?? 0,
    totalResponses: totalResponses ?? 0,
    thisWeek: thisWeek ?? 0,
    avgScore,
    scoreDistribution,
    dimensionAverages,
    weeklyTrend,
    liteCount,
    fullCount,
    industryBreakdown,
    companySizeBreakdown,
    recentResponses,
    mentorTotal,
    mentorSourceBreakdown,
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getISOWeekLabel(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNum = 1 + Math.round(
    ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
  )
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function buildWeeklyTrend(
  map: Map<string, { scores: number[]; count: number }>,
  weeks: number
): { week: string; avg: number | null; count: number }[] {
  const result = []
  const now = new Date()
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const key = getISOWeekLabel(d)
    const entry = map.get(key)
    const shortLabel = key.replace(/^\d{4}-W/, 'W')
    result.push({
      week: shortLabel,
      avg: entry ? Math.round(entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length) : null,
      count: entry?.count ?? 0,
    })
  }
  return result
}

function formatCompanySize(size: number): string {
  if (size <= 10) return '1–10'
  if (size <= 50) return '11–50'
  if (size <= 200) return '51–200'
  if (size <= 500) return '201–500'
  if (size <= 1000) return '501–1000'
  return '1000+'
}
