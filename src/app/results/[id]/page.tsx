import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { ScoreDashboard } from '@/components/results/ScoreDashboard'
import { LiteResultsDashboard } from '@/components/results/LiteResultsDashboard'
import type { QuizScore, MaturityLevel, ShadowAIResult } from '@/types'
import type { Recommendation } from '@/lib/scoring/recommendations'
import type { BenchmarkData } from '@/components/results/BenchmarkComparison'

interface PageProps {
  params: { id: string }
}

export const metadata: Metadata = {
  title: 'Your AI Maturity Results — Brand PWRD Media',
  description: 'Your personalised AI Maturity Score, dimension breakdown and recommendations.',
}

export default async function ResultsPage({ params }: PageProps) {
  const supabase = createServiceClient()

  // Fetch response
  const { data: response } = await supabase
    .from('responses')
    .select('id, quiz_version, maturity_level, shadow_ai_flag, shadow_ai_severity, scores, recommendation_payload, respondent_id')
    .eq('id', params.id)
    .single()

  if (!response) {
    notFound()
  }

  // Fetch respondent (name, email, company_name, job_title, cohort_id, source)
  const { data: respondent } = response.respondent_id
    ? await supabase
        .from('respondents')
        .select('name, email, company_name, job_title, cohort_id, source')
        .eq('id', response.respondent_id)
        .single()
    : { data: null }

  // Cast stored JSON back to typed shapes
  const scores = response.scores as unknown as QuizScore
  const recommendations = response.recommendation_payload as unknown as Recommendation[]

  // Reconstruct shadowAI from stored columns
  const shadowAI: ShadowAIResult = {
    triggered: response.shadow_ai_flag,
    severity:  response.shadow_ai_severity as ShadowAIResult['severity'],
    gap:       (scores.shadowAI?.gap) ?? 0,
  }

  const fullScore: QuizScore = {
    ...scores,
    maturityLevel: response.maturity_level as MaturityLevel,
    shadowAI,
  }

  // ── Benchmark data ────────────────────────────────────────────
  const benchmarkData = await fetchBenchmarkData({
    supabase,
    jobTitle:  respondent?.job_title ?? null,
    cohortId:  respondent?.cohort_id ?? null,
    currentResponseId: params.id,
  })

  const isLite      = response.quiz_version === 'lite'
  const isCompany   = respondent?.source === 'company_slug'
  const quizVariant = isLite ? 'lite' : isCompany ? 'company' : 'extended'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Lite quiz → new redesigned dashboard */}
        {isLite ? (
          <LiteResultsDashboard
            score={fullScore}
            recommendations={recommendations}
            respondentName={respondent?.name ?? ''}
            respondentEmail={respondent?.email ?? ''}
            respondentCompany={respondent?.company_name ?? ''}
          />
        ) : (
          /* Extended / company quiz → original full dashboard */
          <ScoreDashboard
            score={fullScore}
            recommendations={recommendations}
            quizVariant={quizVariant}
            respondentName={respondent?.name ?? ''}
            respondentEmail={respondent?.email ?? ''}
            respondentCompany={respondent?.company_name ?? ''}
            benchmarkData={benchmarkData}
          />
        )}

      </div>
    </main>
  )
}

// Extract overall score from stored jsonb
const getOverall = (r: { scores: unknown }): number | null => {
  const s = r.scores as Record<string, unknown>
  if (typeof s?.overall === 'number') return s.overall
  return null
}

// ── Benchmark helper ──────────────────────────────────────────────────────────
async function fetchBenchmarkData({
  supabase,
  jobTitle,
  cohortId,
  currentResponseId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
  jobTitle: string | null
  cohortId: string | null
  currentResponseId: string
}): Promise<BenchmarkData | undefined> {
  try {
    // Fetch all full-assessment scores (limit 2000 for safety)
    const { data: allResponses } = await supabase
      .from('responses')
      .select('id, scores, respondent_id')
      .eq('quiz_version', 'full')
      .limit(2000)

    if (!allResponses || allResponses.length < 2) return undefined

    // Market average (all responses except current)
    const marketScores = allResponses
      .filter((r: { id: string }) => r.id !== currentResponseId)
      .map(getOverall)
      .filter((v: number | null): v is number => v !== null)

    if (marketScores.length < 1) return undefined

    const marketAvg = marketScores.reduce((a: number, b: number) => a + b, 0) / marketScores.length

    const result: BenchmarkData = {
      market: { avg: Math.round(marketAvg * 10) / 10, count: marketScores.length },
    }

    // Cohort average
    if (cohortId) {
      const { data: cohortRespondents } = await supabase
        .from('respondents')
        .select('id')
        .eq('cohort_id', cohortId)

      if (cohortRespondents && cohortRespondents.length > 1) {
        const cohortIds = new Set((cohortRespondents as { id: string }[]).map(r => r.id))

        const { data: cohortInfo } = await supabase
          .from('cohorts')
          .select('name')
          .eq('id', cohortId)
          .single()

        const cohortScores = allResponses
          .filter((r: { respondent_id: string; id: string }) =>
            r.id !== currentResponseId && cohortIds.has(r.respondent_id)
          )
          .map(getOverall)
          .filter((v: number | null): v is number => v !== null)

        if (cohortScores.length >= 1) {
          const cohortAvg = cohortScores.reduce((a: number, b: number) => a + b, 0) / cohortScores.length
          result.cohort = {
            avg:   Math.round(cohortAvg * 10) / 10,
            count: cohortScores.length,
            name:  cohortInfo?.name ?? 'Your cohort',
          }
        }
      }
    }

    // Role average
    if (jobTitle) {
      const { data: sameRoleRespondents } = await supabase
        .from('respondents')
        .select('id')
        .ilike('job_title', jobTitle)
        .limit(500)

      if (sameRoleRespondents && sameRoleRespondents.length > 1) {
        const roleIds = new Set((sameRoleRespondents as { id: string }[]).map(r => r.id))

        const roleScores = allResponses
          .filter((r: { respondent_id: string; id: string }) =>
            r.id !== currentResponseId && roleIds.has(r.respondent_id)
          )
          .map(getOverall)
          .filter((v: number | null): v is number => v !== null)

        if (roleScores.length >= 2) {
          const roleAvg = roleScores.reduce((a: number, b: number) => a + b, 0) / roleScores.length
          result.role = {
            avg:   Math.round(roleAvg * 10) / 10,
            count: roleScores.length,
            role:  jobTitle,
          }
        }
      }
    }

    return result
  } catch {
    // Benchmark is non-critical — don't break the results page
    return undefined
  }
}
