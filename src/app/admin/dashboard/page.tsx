// FILE: src/app/admin/dashboard/page.tsx
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import ScoreBadge from '@/components/admin/ScoreBadge'
import { DeleteRespondentButton } from '@/components/admin/DeleteRespondentButton'

export const dynamic = 'force-dynamic'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: Record<string, unknown>
}

type MaturityKey = 'Unaware' | 'Exploring' | 'Experimenting' | 'Scaling' | 'Leading'
const MATURITY_LEVELS: MaturityKey[] = ['Unaware', 'Exploring', 'Experimenting', 'Scaling', 'Leading']

const LEVEL_COLORS: Record<MaturityKey, string> = {
  Unaware: 'bg-red-400',
  Exploring: 'bg-orange-400',
  Experimenting: 'bg-yellow-400',
  Scaling: 'bg-teal-400',
  Leading: 'bg-green-400',
}

export default async function DashboardPage() {
  const supabase = createServiceClient()

  // 1. Total respondents
  const { count: totalRespondents } = await supabase
    .from('respondents')
    .select('*', { count: 'exact', head: true })

  // 2. Total responses
  const { count: totalResponses } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })

  // 3. This week
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: thisWeek } = await supabase
    .from('respondents')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)

  // 4. All responses for score calculations
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
    let total = 0
    for (const r of allResponses) {
      const scores = r.scores as unknown as ScoresJsonb
      total += scores.overall ?? 0
      const level = r.maturity_level as MaturityKey
      if (level in scoreDistribution) scoreDistribution[level]++
    }
    avgScore = Math.round(total / allResponses.length)
  }

  // 5. Last 10 responses + respondent data
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
      name: respondent?.name ?? '—',
      email: respondent?.email ?? '',
      company: respondent?.company_name ?? '—',
      overallScore: scores.overall ?? 0,
    }
  })

  const totalResponsesCount = allResponses?.length ?? 0

  const statCards = [
    { label: 'Total Respondents', value: (totalRespondents ?? 0).toString() },
    { label: 'Total Responses', value: (totalResponses ?? 0).toString() },
    { label: 'This Week', value: (thisWeek ?? 0).toString() },
    { label: 'Avg Score', value: totalResponsesCount > 0 ? `${avgScore}` : '—' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-brand rounded-xl p-5 text-white">
            <p className="text-sm text-white/70 mb-1">{card.label}</p>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Score distribution */}
      {totalResponsesCount > 0 && (
        <div className="bg-gray-50 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Score Distribution
          </h2>
          <div className="flex flex-wrap gap-3">
            {MATURITY_LEVELS.map((level) => {
              const count = scoreDistribution[level]
              const pct = totalResponsesCount > 0
                ? Math.round((count / totalResponsesCount) * 100)
                : 0
              return (
                <div key={level} className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-700">{level}</span>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden ml-2">
                    <div
                      className={`h-full rounded-full ${LEVEL_COLORS[level]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 ml-1">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent responses */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Responses</h2>
        {recentResponses.length === 0 ? (
          <p className="text-gray-500 text-sm">No responses yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3">Level</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentResponses.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.company}</td>
                    <td className="px-4 py-3 font-semibold text-brand">{r.overallScore}</td>
                    <td className="px-4 py-3">
                      <ScoreBadge level={r.maturity_level} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/results/${r.id}`}
                        className="text-brand-accent hover:underline font-medium"
                      >
                        View →
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteRespondentButton respondentId={r.respondent_id} name={r.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
