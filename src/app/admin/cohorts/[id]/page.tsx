import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { ScoreDistributionChart } from '@/components/cohort/ScoreDistributionChart'
import { DimensionDeltaChart } from '@/components/cohort/DimensionDeltaChart'
import { ShadowAIPanel } from '@/components/cohort/ShadowAIPanel'
import { AddWaveForm } from '@/components/cohort/AddWaveForm'
import { CopyClientLinkButton } from '@/components/cohort/CopyClientLinkButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ wave?: string }>
}

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI?: { flagged: boolean; severity?: string }
}

interface WaveRow { id: string; wave_number: number; label: string; wave_date: string | null; is_open: boolean }
interface ResponseRow {
  id: string
  respondent_id: string
  scores: ScoresJsonb
  shadow_ai_flag: boolean
  created_at: string
}
interface RespondentRow { id: string; name: string; email: string; company_name: string; job_title: string }

type MaturityKey = 'Unaware' | 'Exploring' | 'Experimenting' | 'Scaling' | 'Leading'
const MATURITY_LEVELS: MaturityKey[] = ['Unaware', 'Exploring', 'Experimenting', 'Scaling', 'Leading']
const MATURITY_COLOURS: Record<MaturityKey, string> = {
  Unaware: 'bg-red-100 text-red-700',
  Exploring: 'bg-orange-100 text-orange-700',
  Experimenting: 'bg-yellow-100 text-yellow-700',
  Scaling: 'bg-teal-100 text-teal-700',
  Leading: 'bg-green-100 text-green-700',
}

function barColor(score: number): string {
  if (score < 40) return '#EF4444'
  if (score < 60) return '#F59E0B'
  if (score < 80) return '#2A9D8F'
  return '#22C55E'
}

async function fetchWaveResponses(supabase: ReturnType<typeof createServiceClient>, waveId: string) {
  const { data: cohortResponses } = await supabase
    .from('cohort_responses')
    .select('response_id')
    .eq('wave_id', waveId)

  const responseIds = (cohortResponses ?? []).map(cr => cr.response_id)
  if (!responseIds.length) return { responses: [], respondents: [] }

  const { data: responses } = await supabase
    .from('responses')
    .select('id, respondent_id, scores, shadow_ai_flag, created_at')
    .in('id', responseIds) as unknown as { data: ResponseRow[] | null }

  const respondentIds = Array.from(new Set((responses ?? []).map(r => r.respondent_id)))
  const { data: respondents } = await supabase
    .from('respondents')
    .select('id, name, email, company_name, job_title')
    .in('id', respondentIds) as unknown as { data: RespondentRow[] | null }

  return { responses: responses ?? [], respondents: respondents ?? [] }
}

function aggregateResponses(responses: ResponseRow[]) {
  type DimAccum = { total: number; count: number; label: string }
  const dimMap = new Map<string, DimAccum>()
  const maturityDist: Record<string, number> = {}
  let scoreTotal = 0
  let flagged = 0

  for (const r of responses) {
    const s = r.scores
    if (!s) continue
    scoreTotal += s.overall ?? 0
    if (r.shadow_ai_flag) flagged++
    const lvl = s.maturityLevel ?? 'Unaware'
    maturityDist[lvl] = (maturityDist[lvl] ?? 0) + 1
    for (const ds of s.dimensionScores ?? []) {
      const existing = dimMap.get(ds.dimension) ?? { total: 0, count: 0, label: ds.label }
      dimMap.set(ds.dimension, { total: existing.total + ds.normalized, count: existing.count + 1, label: ds.label })
    }
  }

  const n = responses.length
  const avgScore = n > 0 ? Math.round(scoreTotal / n) : null
  const dimAvgs = Array.from(dimMap.entries()).map(([dim, acc]) => ({
    dimension: dim,
    label: acc.label,
    avg: Math.round(acc.total / acc.count),
  })).sort((a, b) => a.avg - b.avg)

  return { avgScore, dimAvgs, maturityDist, flagged, count: n }
}

export default async function CohortDetailPage({ params, searchParams }: PageProps) {
  const { id: cohortId } = await params
  const { wave: waveParam } = await searchParams
  const supabase = createServiceClient()

  // ── 1. Cohort + company ───────────────────────────────────────────────────
  const { data: cohort } = await supabase
    .from('cohorts')
    .select('id, name, organisation, access_code, client_token, company_id, date')
    .eq('id', cohortId)
    .single() as unknown as {
      data: {
        id: string; name: string; organisation: string | null
        access_code: string | null; client_token: string | null
        company_id: string; date: string | null
      } | null
    }

  if (!cohort) notFound()

  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', cohort.company_id)
    .single()

  // ── 2. Waves ──────────────────────────────────────────────────────────────
  const { data: waves } = await supabase
    .from('cohort_waves')
    .select('id, wave_number, label, wave_date, is_open')
    .eq('cohort_id', cohortId)
    .order('wave_number') as unknown as { data: WaveRow[] | null }

  const allWaves = waves ?? []

  // Determine selected wave
  const selectedWaveNumber = waveParam !== undefined ? parseInt(waveParam) : (allWaves.at(-1)?.wave_number ?? 0)
  const selectedWave = allWaves.find(w => w.wave_number === selectedWaveNumber) ?? allWaves.at(-1)
  const wave0 = allWaves.find(w => w.wave_number === 0)
  const hasMultipleWaves = allWaves.length >= 2

  // ── 3. Fetch responses for selected wave ──────────────────────────────────
  const { responses: selResponses, respondents: selRespondents } = selectedWave
    ? await fetchWaveResponses(supabase, selectedWave.id)
    : { responses: [], respondents: [] }

  const respondentMap = new Map(selRespondents.map(r => [r.id, r]))
  const stats = aggregateResponses(selResponses)

  // ── 4. Fetch wave 0 responses for comparison (if on wave 1+) ─────────────
  let wave0Responses: ResponseRow[] = []
  let wave0Stats: ReturnType<typeof aggregateResponses> | null = null
  if (hasMultipleWaves && wave0 && selectedWave?.wave_number !== 0) {
    const { responses } = await fetchWaveResponses(supabase, wave0.id)
    wave0Responses = responses
    wave0Stats = aggregateResponses(responses)
  }

  // ── 5. Market averages ────────────────────────────────────────────────────
  const { data: allResponses } = await supabase
    .from('responses')
    .select('scores')
    .eq('quiz_version', 'full')

  const marketDimMap = new Map<string, { total: number; count: number }>()
  let marketTotal = 0; let marketCount = 0
  for (const resp of allResponses ?? []) {
    const s = resp.scores as unknown as ScoresJsonb
    if (!s) continue
    marketTotal += s.overall ?? 0; marketCount++
    for (const ds of s.dimensionScores ?? []) {
      const ex = marketDimMap.get(ds.dimension) ?? { total: 0, count: 0 }
      marketDimMap.set(ds.dimension, { total: ex.total + ds.normalized, count: ex.count + 1 })
    }
  }
  const marketAvgScore = marketCount > 0 ? Math.round(marketTotal / marketCount) : null
  const marketDimAvgs = new Map<string, number>(
    Array.from(marketDimMap.entries()).map(([dim, acc]) => [dim, Math.round(acc.total / acc.count)])
  )

  // ── 6. Build chart data ───────────────────────────────────────────────────
  const selScores = selResponses.map(r => Math.round(r.scores?.overall ?? 0))
  const wave0Scores = wave0Responses.map(r => Math.round(r.scores?.overall ?? 0))

  const deltas = wave0Stats && stats.dimAvgs.length > 0
    ? stats.dimAvgs.map(d => {
        const w0 = wave0Stats!.dimAvgs.find(x => x.dimension === d.dimension)
        return w0 ? { label: d.label, delta: d.avg - w0.avg } : null
      }).filter((x): x is { label: string; delta: number } => x !== null)
    : []

  const showCharts = stats.count > 0

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Back + header ── */}
      <div>
        <Link href="/admin/cohorts" className="text-xs text-gray-500 hover:text-gray-700 mb-3 inline-flex items-center gap-1 transition-colors">
          ← All cohorts
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cohort.name}</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {cohort.organisation ?? company?.name ?? '—'}
              {company && cohort.organisation && <> · {company.name}</>}
            </p>
            {cohort.access_code && (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Access code: <span className="select-all">{cohort.access_code}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {cohort.client_token && (
              <CopyClientLinkButton cohortId={cohortId} token={cohort.client_token} />
            )}
            {selectedWave && (
              <a
                href={`/api/admin/cohorts/${cohortId}/export?wave=${selectedWave.wave_number}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                ↓ Export CSV
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Wave selector tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {allWaves.map(w => (
          <Link
            key={w.id}
            href={`/admin/cohorts/${cohortId}?wave=${w.wave_number}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedWave?.wave_number === w.wave_number
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {w.label}
            {w.is_open && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-400 align-middle" />}
          </Link>
        ))}
        <AddWaveForm cohortId={cohortId} />
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Participants</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.count}</p>
          {selectedWave && <p className="text-xs text-gray-500 mt-1">{selectedWave.label}</p>}
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Avg score</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {stats.avgScore !== null ? `${stats.avgScore}/100` : '—'}
          </p>
          {wave0Stats?.avgScore !== null && wave0Stats && stats.avgScore !== null && (
            <p className="text-xs mt-1" style={{ color: stats.avgScore >= wave0Stats.avgScore! ? '#22C55E' : '#EF4444' }}>
              {stats.avgScore >= wave0Stats.avgScore! ? '▲' : '▼'}{Math.abs(stats.avgScore - wave0Stats.avgScore!)} vs {wave0?.label}
            </p>
          )}
          {!wave0Stats && marketAvgScore !== null && stats.avgScore !== null && (
            <p className="text-xs mt-1" style={{ color: stats.avgScore >= marketAvgScore ? '#22C55E' : '#EF4444' }}>
              {stats.avgScore >= marketAvgScore ? '▲' : '▼'}{Math.abs(stats.avgScore - marketAvgScore)} vs market
            </p>
          )}
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Shadow AI</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.flagged}</p>
          <p className="text-xs text-gray-500 mt-1">of {stats.count} respondents</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Market benchmark</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{marketAvgScore ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">n={marketCount} full responses</p>
        </div>
      </div>

      {!showCharts ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <p className="text-gray-600 font-medium">No responses in this wave yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Scores and charts will appear here once participants complete the assessment.
          </p>
        </div>
      ) : (
        <>
          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score distribution */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                Score distribution
              </h2>
              <ScoreDistributionChart
                wave0Scores={hasMultipleWaves && wave0Stats ? wave0Scores : selScores}
                wave1Scores={hasMultipleWaves && wave0Stats ? selScores : undefined}
                wave0Label={hasMultipleWaves && wave0 ? wave0.label : selectedWave?.label}
                wave1Label={selectedWave?.label}
              />
            </div>

            {/* Dimension delta / teaser */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                Progress by dimension
              </h2>
              {deltas.length > 0 ? (
                <DimensionDeltaChart
                  deltas={deltas}
                  wave0Label={wave0?.label}
                  wave1Label={selectedWave?.label}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <p className="text-4xl mb-3">📈</p>
                  <p className="text-sm font-medium text-gray-700">Add a follow-up wave to unlock progress tracking</p>
                  <p className="text-xs text-gray-500 mt-1">Dimension deltas appear when you compare two waves.</p>
                </div>
              )}
            </div>
          </div>

          {/* Shadow AI panel */}
          <ShadowAIPanel
            wave0Flagged={hasMultipleWaves && wave0Stats ? wave0Stats.flagged : stats.flagged}
            wave0Total={hasMultipleWaves && wave0Stats ? wave0Stats.count : stats.count}
            wave1Flagged={hasMultipleWaves && wave0Stats ? stats.flagged : undefined}
            wave1Total={hasMultipleWaves && wave0Stats ? stats.count : undefined}
            wave0Label={hasMultipleWaves && wave0 ? wave0.label : selectedWave?.label}
            wave1Label={hasMultipleWaves ? selectedWave?.label : undefined}
          />

          {/* Maturity distribution */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Maturity distribution</h2>
            <div className="flex flex-wrap gap-3">
              {MATURITY_LEVELS.map(level => {
                const cnt = stats.maturityDist[level] ?? 0
                const pct = stats.count > 0 ? Math.round((cnt / stats.count) * 100) : 0
                return (
                  <div key={level} className="bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3 min-w-[130px]">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900">{cnt}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 w-fit ${MATURITY_COLOURS[level]}`}>{level}</span>
                    </div>
                    <span className="text-sm text-gray-500 ml-auto">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dimension scores vs market */}
          {stats.dimAvgs.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                Dimension scores — cohort vs. market
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
                {stats.dimAvgs.map((d, i) => {
                  const market = marketDimAvgs.get(d.dimension) ?? null
                  const diff = market !== null ? d.avg - market : null
                  return (
                    <div key={d.dimension}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{d.label}</span>
                        <div className="flex items-center gap-3 text-sm">
                          {diff !== null && (
                            <span className="text-xs font-medium" style={{ color: diff >= 0 ? '#22C55E' : '#EF4444' }}>
                              {diff >= 0 ? '+' : ''}{diff} vs market
                            </span>
                          )}
                          {i === 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Weakest</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="w-14 text-xs text-gray-500 text-right shrink-0">Cohort</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${d.avg}%`, backgroundColor: barColor(d.avg) }} />
                        </div>
                        <span className="w-8 text-sm font-semibold text-gray-700 text-right shrink-0">{d.avg}</span>
                      </div>
                      {market !== null && (
                        <div className="flex items-center gap-3">
                          <span className="w-14 text-xs text-gray-400 text-right shrink-0">Market</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="h-2 rounded-full" style={{ width: `${market}%`, backgroundColor: '#CBD5E1' }} />
                          </div>
                          <span className="w-8 text-xs text-gray-400 text-right shrink-0">{market}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Participants table ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
          Participants in {selectedWave?.label ?? 'this wave'} ({stats.count})
        </h2>
        {selResponses.length === 0 ? (
          <p className="text-sm text-gray-500">No responses recorded for this wave yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3">Job title</th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3">Shadow AI</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {selResponses.map(r => {
                  const person = respondentMap.get(r.respondent_id)
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{person?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{person?.company_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{person?.job_title || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-brand">{Math.round(r.scores?.overall ?? 0)}</td>
                      <td className="px-4 py-3">
                        {r.shadow_ai_flag ? (
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">⚠ Flagged</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/results/${r.id}`} className="text-brand-accent hover:underline font-medium text-xs">
                          View →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
