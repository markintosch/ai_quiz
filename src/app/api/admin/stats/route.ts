// FILE: src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: Record<string, unknown>
}

const MATURITY_LEVELS = ['Unaware', 'Exploring', 'Experimenting', 'Scaling', 'Leading'] as const
type MaturityKey = (typeof MATURITY_LEVELS)[number]

export async function GET() {
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

  // All responses to calculate avgScore + distribution
  const { data: allResponses } = await supabase
    .from('responses')
    .select('id, respondent_id, scores, maturity_level, created_at')
    .order('created_at', { ascending: false })

  let avgScore = 0
  const scoreDistribution: Record<MaturityKey, number> = {
    Unaware: 0,
    Exploring: 0,
    Experimenting: 0,
    Scaling: 0,
    Leading: 0,
  }

  if (allResponses && allResponses.length > 0) {
    let totalScore = 0
    for (const r of allResponses) {
      const scores = r.scores as unknown as ScoresJsonb
      totalScore += scores.overall ?? 0
      const level = r.maturity_level as MaturityKey
      if (level in scoreDistribution) {
        scoreDistribution[level]++
      }
    }
    avgScore = Math.round(totalScore / allResponses.length)
  }

  // Last 10 responses + respondent info
  const last10 = (allResponses ?? []).slice(0, 10)
  const respondentIds = Array.from(new Set(last10.map((r) => r.respondent_id)))

  const { data: respondentsData } = respondentIds.length
    ? await supabase
        .from('respondents')
        .select('id, name, email, company_name')
        .in('id', respondentIds)
    : { data: [] }

  const respondentMap = new Map(
    (respondentsData ?? []).map((r) => [r.id, r])
  )

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
    recentResponses,
  })
}
