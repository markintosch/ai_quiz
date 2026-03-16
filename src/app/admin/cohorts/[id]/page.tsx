// FILE: src/app/admin/cohorts/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import ScoreBadge from '@/components/admin/ScoreBadge'

export const dynamic = 'force-dynamic'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: Record<string, unknown>
}

type MaturityKey = 'Unaware' | 'Exploring' | 'Experimenting' | 'Scaling' | 'Leading'

const MATURITY_LEVELS: MaturityKey[] = ['Unaware', 'Exploring', 'Experimenting', 'Scaling', 'Leading']

const MATURITY_COLOURS: Record<MaturityKey, string> = {
  Unaware:       'bg-red-100 text-red-700',
  Exploring:     'bg-orange-100 text-orange-700',
  Experimenting: 'bg-yellow-100 text-yellow-700',
  Scaling:       'bg-teal-100 text-teal-700',
  Leading:       'bg-green-100 text-green-700',
}

function cellBg(score: number | null): string {
  if (score === null) return 'bg-gray-50'
  if (score < 40) return 'bg-red-500'
  if (score < 60) return 'bg-amber-400'
  if (score < 80) return 'bg-teal-400'
  return 'bg-green-500'
}

function barColor(score: number): string {
  if (score < 40) return '#EF4444'
  if (score < 60) return '#F59E0B'
  if (score < 80) return '#2A9D8F'
  return '#22C55E'
}

export default async function CohortDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServiceClient()
  const cohortId = params.id

  // ── 1. Cohort info ──────────────────────────────────────────────────────────
  const { data: cohort } = await supabase
    .from('cohorts')
    .select('id, name, date, company_id, created_at')
    .eq('id', cohortId)
    .single()

  if (!cohort) notFound()

  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', cohort.company_id)
    .single()

  // ── 2. Respondents in this cohort (with their responses) ───────────────────
  const { data: cohortRespondents } = await supabase
    .from('respondents')
    .select('id, name, email, company_name, job_title, created_at')
    .eq('cohort_id', cohortId)
    .order('created_at', { ascending: false }) as unknown as {
      data: {
        id: string
        name: string
        email: string
        company_name: string
        job_title: string
        created_at: string
      }[] | null
    }

  const respondentIds = (cohortRespondents ?? []).map((r) => r.id)

  const { data: cohortResponses } = respondentIds.length
    ? await supabase
        .from('responses')
        .select('respondent_id, id, scores, maturity_level, quiz_version')
        .in('respondent_id', respondentIds)
    : { data: [] }

  // Map respondent_id → response (most recent per respondent)
  const responseMap = new Map<string, {
    id: string
    scores: ScoresJsonb
    maturity_level: string
    quiz_version: string
  }>()
  for (const resp of cohortResponses ?? []) {
    if (!responseMap.has(resp.respondent_id)) {
      responseMap.set(resp.respondent_id, {
        id: resp.id,
        scores: resp.scores as unknown as ScoresJsonb,
        maturity_level: resp.maturity_level,
        quiz_version: resp.quiz_version,
      })
    }
  }

  // ── 3. Cohort aggregates ───────────────────────────────────────────────────
  type DimAccum = { total: number; count: number; label: string }
  const dimMap = new Map<string, DimAccum>()
  const maturityDist: Record<string, number> = {}
  let scoreTotal = 0
  let scoreCount = 0

  for (const [, resp] of Array.from(responseMap)) {
    const s = resp.scores
    if (!s) continue
    scoreTotal += s.overall ?? 0
    scoreCount++
    const lvl = resp.maturity_level ?? 'Unaware'
    maturityDist[lvl] = (maturityDist[lvl] ?? 0) + 1

    for (const ds of s.dimensionScores ?? []) {
      const existing = dimMap.get(ds.dimension) ?? { total: 0, count: 0, label: ds.label }
      dimMap.set(ds.dimension, {
        total: existing.total + ds.normalized,
        count: existing.count + 1,
        label: ds.label,
      })
    }
  }

  const cohortAvgScore = scoreCount > 0 ? Math.round(scoreTotal / scoreCount) : null
  const cohortDimAvgs = Array.from(dimMap.entries()).map(([dim, acc]) => ({
    dimension: dim,
    label: acc.label,
    avg: Math.round(acc.total / acc.count),
  })).sort((a, b) => a.avg - b.avg) // worst first

  // ── 4. Market averages (all full responses for comparison) ─────────────────
  const { data: allResponses } = await supabase
    .from('responses')
    .select('scores')
    .eq('quiz_version', 'full')

  const marketDimMap = new Map<string, DimAccum>()
  let marketTotal = 0
  let marketCount = 0

  for (const resp of allResponses ?? []) {
    const s = resp.scores as unknown as ScoresJsonb
    if (!s) continue
    marketTotal += s.overall ?? 0
    marketCount++
    for (const ds of s.dimensionScores ?? []) {
      const existing = marketDimMap.get(ds.dimension) ?? { total: 0, count: 0, label: ds.label }
      marketDimMap.set(ds.dimension, {
        total: existing.total + ds.normalized,
        count: existing.count + 1,
        label: ds.label,
      })
    }
  }

  const marketAvgScore = marketCount > 0 ? Math.round(marketTotal / marketCount) : null
  const marketDimAvgs = new Map<string, number>(
    Array.from(marketDimMap.entries()).map(([dim, acc]) => [
      dim,
      Math.round(acc.total / acc.count),
    ])
  )

  // ── 5. Respondent table data ───────────────────────────────────────────────
  const respondentRows = (cohortRespondents ?? []).map((r) => {
    const resp = responseMap.get(r.id)
    return { ...r, response: resp ?? null }
  })

  const respondentCount = (cohortRespondents ?? []).length
  const responseCount = responseMap.size

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Back + header */}
      <div>
        <Link
          href="/admin/cohorts"
          className="text-xs text-gray-500 hover:text-gray-700 mb-3 inline-flex items-center gap-1 transition-colors"
        >
          ← All cohorts
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cohort.name}</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {company?.name ?? '—'}
              {cohort.date && (
                <> · {new Date(cohort.date).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Participants</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{respondentCount}</p>
          <p className="text-xs text-gray-500 mt-1">{responseCount} responded</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Avg score</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {cohortAvgScore !== null ? `${cohortAvgScore}/100` : '—'}
          </p>
          {marketAvgScore !== null && cohortAvgScore !== null && (
            <p className="text-xs mt-1" style={{
              color: cohortAvgScore >= marketAvgScore ? '#22C55E' : '#EF4444'
            }}>
              {cohortAvgScore >= marketAvgScore ? '▲' : '▼'}{' '}
              {Math.abs(cohortAvgScore - marketAvgScore)} vs market ({marketAvgScore})
            </p>
          )}
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Completion</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {respondentCount > 0 ? `${Math.round((responseCount / respondentCount) * 100)}%` : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{responseCount} of {respondentCount}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Market respondents</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{marketCount}</p>
          <p className="text-xs text-gray-500 mt-1">full quiz benchmark</p>
        </div>
      </div>

      {responseCount === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <p className="text-gray-600 font-medium">No responses yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Scores and dimension data will appear here once participants complete the quiz.
          </p>
        </div>
      ) : (
        <>
          {/* Maturity distribution */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
              Maturity distribution
            </h2>
            <div className="flex flex-wrap gap-3">
              {MATURITY_LEVELS.map((level) => {
                const cnt = maturityDist[level] ?? 0
                const pct = responseCount > 0 ? Math.round((cnt / responseCount) * 100) : 0
                return (
                  <div
                    key={level}
                    className="bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3 min-w-[130px]"
                  >
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900">{cnt}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 w-fit ${MATURITY_COLOURS[level]}`}>
                        {level}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 ml-auto">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dimension comparison: cohort vs. market */}
          {cohortDimAvgs.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                Dimension scores — cohort vs. market
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
                {cohortDimAvgs.map((d, i) => {
                  const market = marketDimAvgs.get(d.dimension) ?? null
                  const diff = market !== null ? d.avg - market : null
                  return (
                    <div key={d.dimension}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{d.label}</span>
                        <div className="flex items-center gap-3 text-sm">
                          {diff !== null && (
                            <span
                              className="text-xs font-medium"
                              style={{ color: diff >= 0 ? '#22C55E' : '#EF4444' }}
                            >
                              {diff >= 0 ? '+' : ''}{diff} vs market
                            </span>
                          )}
                          {i === 0 && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Weakest</span>
                          )}
                        </div>
                      </div>
                      {/* Cohort bar */}
                      <div className="flex items-center gap-3 mb-1">
                        <span className="w-14 text-xs text-gray-500 text-right shrink-0">Cohort</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{ width: `${d.avg}%`, backgroundColor: barColor(d.avg) }}
                          />
                        </div>
                        <span className="w-8 text-sm font-semibold text-gray-700 text-right shrink-0">{d.avg}</span>
                      </div>
                      {/* Market bar */}
                      {market !== null && (
                        <div className="flex items-center gap-3">
                          <span className="w-14 text-xs text-gray-400 text-right shrink-0">Market</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${market}%`, backgroundColor: '#CBD5E1' }}
                            />
                          </div>
                          <span className="w-8 text-xs text-gray-400 text-right shrink-0">{market}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
                <p className="text-xs text-gray-500 pt-1">
                  Scores out of 100. Sorted worst → best. Market = all full-quiz responses (n={marketCount}).
                </p>
              </div>
            </div>
          )}

          {/* Dimension heatmap table — snapshot grid */}
          {cohortDimAvgs.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                Score snapshot
              </h2>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="text-sm border-collapse w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 text-gray-600 uppercase text-xs font-semibold border-b border-gray-100">
                        Dimension
                      </th>
                      <th className="px-4 py-3 text-gray-600 uppercase text-xs font-semibold border-b border-gray-100 text-center">
                        Cohort avg
                      </th>
                      <th className="px-4 py-3 text-gray-600 uppercase text-xs font-semibold border-b border-gray-100 text-center">
                        Market avg
                      </th>
                      <th className="px-4 py-3 text-gray-600 uppercase text-xs font-semibold border-b border-gray-100 text-center">
                        Δ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortDimAvgs.map((d, i) => {
                      const market = marketDimAvgs.get(d.dimension) ?? null
                      const diff = market !== null ? d.avg - market : null
                      return (
                        <tr key={d.dimension} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-4 py-3 font-medium text-gray-800 border-b border-gray-50">
                            {d.label}
                          </td>
                          <td className={`px-4 py-3 text-center font-bold border-b border-gray-50 rounded ${cellBg(d.avg)}`}
                              style={{ color: '#fff' }}
                          >
                            {d.avg}
                          </td>
                          <td className={`px-4 py-3 text-center font-bold border-b border-gray-50 ${cellBg(market)}`}
                              style={{ color: market !== null ? '#fff' : undefined }}
                          >
                            {market !== null ? market : '—'}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold border-b border-gray-50">
                            {diff !== null ? (
                              <span style={{ color: diff >= 0 ? '#16A34A' : '#DC2626' }}>
                                {diff >= 0 ? '+' : ''}{diff}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Respondent table */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
          Participants ({respondentCount})
        </h2>
        {respondentRows.length === 0 ? (
          <p className="text-sm text-gray-500">No participants assigned to this cohort yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3">Job title</th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3">Level</th>
                  <th className="text-left px-4 py-3">Version</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {respondentRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.company_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.job_title || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-brand">
                      {r.response ? r.response.scores.overall : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {r.response ? <ScoreBadge level={r.response.maturity_level} /> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {r.response ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          r.response.quiz_version === 'lite'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {r.response.quiz_version}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.response && (
                        <Link
                          href={`/results/${r.response.id}`}
                          className="text-brand-accent hover:underline font-medium"
                        >
                          View →
                        </Link>
                      )}
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
