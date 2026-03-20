import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { ScoreDistributionChart } from '@/components/cohort/ScoreDistributionChart'
import { DimensionDeltaChart } from '@/components/cohort/DimensionDeltaChart'
import { ShadowAIPanel } from '@/components/cohort/ShadowAIPanel'
import { RadarChart } from '@/components/results/RadarChart'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ cohort_id: string }>
  searchParams: Promise<{ token?: string; wave?: string }>
}

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
}

interface WaveRow { id: string; wave_number: number; label: string; wave_date: string | null }
interface ResponseRow { id: string; respondent_id: string; scores: ScoresJsonb; shadow_ai_flag: boolean }

async function fetchWaveResponses(supabase: ReturnType<typeof createServiceClient>, waveId: string): Promise<ResponseRow[]> {
  const { data: cohortResponses } = await supabase
    .from('cohort_responses')
    .select('response_id')
    .eq('wave_id', waveId)

  const responseIds = (cohortResponses ?? []).map(cr => cr.response_id)
  if (!responseIds.length) return []

  const { data: responses } = await supabase
    .from('responses')
    .select('id, respondent_id, scores, shadow_ai_flag')
    .in('id', responseIds) as unknown as { data: ResponseRow[] | null }

  return responses ?? []
}

function aggregateResponses(responses: ResponseRow[]) {
  type DimAccum = { total: number; count: number; label: string }
  const dimMap = new Map<string, DimAccum>()
  let scoreTotal = 0; let flagged = 0

  for (const r of responses) {
    const s = r.scores; if (!s) continue
    scoreTotal += s.overall ?? 0
    if (r.shadow_ai_flag) flagged++
    for (const ds of s.dimensionScores ?? []) {
      const ex = dimMap.get(ds.dimension) ?? { total: 0, count: 0, label: ds.label }
      dimMap.set(ds.dimension, { total: ex.total + ds.normalized, count: ex.count + 1, label: ds.label })
    }
  }

  const n = responses.length
  const avgScore = n > 0 ? Math.round(scoreTotal / n) : null
  const dimAvgs = Array.from(dimMap.entries()).map(([dim, acc]) => ({
    dimension: dim, label: acc.label, avg: Math.round(acc.total / acc.count),
  }))

  return { avgScore, dimAvgs, flagged, count: n }
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Strong foundation'
  if (score >= 60) return 'Good progress'
  if (score >= 40) return 'Developing'
  return 'Attention needed'
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200'
  if (score >= 60) return 'bg-teal-50 border-teal-200'
  if (score >= 40) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

function scoreTextColor(score: number): string {
  if (score >= 80) return 'text-green-700'
  if (score >= 60) return 'text-teal-700'
  if (score >= 40) return 'text-amber-700'
  return 'text-red-700'
}

export default async function ClientDashboardPage({ params, searchParams }: PageProps) {
  const { cohort_id: cohortId } = await params
  const { token, wave: waveParam } = await searchParams

  if (!token) notFound()

  const supabase = createServiceClient()

  // ── Verify token ──────────────────────────────────────────────────────────
  const { data: cohort } = await supabase
    .from('cohorts')
    .select('id, name, organisation, client_token, company_id')
    .eq('id', cohortId)
    .eq('client_token', token)
    .single() as unknown as {
      data: { id: string; name: string; organisation: string | null; client_token: string; company_id: string } | null
    }

  if (!cohort) notFound()

  // ── Waves ─────────────────────────────────────────────────────────────────
  const { data: waves } = await supabase
    .from('cohort_waves')
    .select('id, wave_number, label, wave_date')
    .eq('cohort_id', cohortId)
    .order('wave_number') as unknown as { data: WaveRow[] | null }

  const allWaves = waves ?? []
  if (!allWaves.length) notFound()

  const selectedWaveNumber = waveParam !== undefined ? parseInt(waveParam) : (allWaves.at(-1)?.wave_number ?? 0)
  const selectedWave = allWaves.find(w => w.wave_number === selectedWaveNumber) ?? allWaves.at(-1)!
  const wave0 = allWaves.find(w => w.wave_number === 0)
  const hasMultipleWaves = allWaves.length >= 2

  // ── Fetch responses ───────────────────────────────────────────────────────
  const selResponses = await fetchWaveResponses(supabase, selectedWave.id)
  const stats = aggregateResponses(selResponses)

  let wave0Responses: ResponseRow[] = []
  let wave0Stats: ReturnType<typeof aggregateResponses> | null = null
  if (hasMultipleWaves && wave0 && selectedWave.wave_number !== 0) {
    wave0Responses = await fetchWaveResponses(supabase, wave0.id)
    wave0Stats = aggregateResponses(wave0Responses)
  }

  // ── Chart data ────────────────────────────────────────────────────────────
  const selScores = selResponses.map(r => Math.round(r.scores?.overall ?? 0))
  const wave0Scores = wave0Responses.map(r => Math.round(r.scores?.overall ?? 0))

  const deltas = wave0Stats && stats.dimAvgs.length > 0
    ? stats.dimAvgs.map(d => {
        const w0 = wave0Stats!.dimAvgs.find(x => x.dimension === d.dimension)
        return w0 ? { label: d.label, delta: d.avg - w0.avg } : null
      }).filter((x): x is { label: string; delta: number } => x !== null)
    : []

  // Cast to DimensionScore[] — dimension string values are valid Dimension enum values at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const radarPrimary = stats.dimAvgs.map(d => ({ dimension: d.dimension, label: d.label, normalized: d.avg, score: d.avg, raw: 0, max: 100, weight: 1, questionCount: 1 })) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const radarSecondary = wave0Stats?.dimAvgs.map(d => ({ dimension: d.dimension, label: d.label, normalized: d.avg, score: d.avg, raw: 0, max: 100, weight: 1, questionCount: 1 })) as any[] | undefined

  const displayName = cohort.organisation ?? cohort.name
  const waveDate = selectedWave.wave_date
    ? new Date(selectedWave.wave_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-brand py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-white/60 text-sm font-medium">Kirk &amp; Blackbeard</div>
          <div className="text-white/60 text-xs">AI Maturity Assessment</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        {/* ── Hero ── */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-medium">
              {selectedWave.label}
            </span>
            {waveDate && <span className="text-sm text-gray-500">{waveDate}</span>}
            {stats.avgScore !== null && (
              <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                Overall: {stats.avgScore}/100
              </span>
            )}
          </div>
          {wave0Stats?.avgScore !== null && wave0Stats && stats.avgScore !== null && (
            <p className="text-sm font-medium" style={{ color: stats.avgScore >= wave0Stats.avgScore! ? '#16A34A' : '#DC2626' }}>
              {stats.avgScore >= wave0Stats.avgScore! ? '▲' : '▼'} {Math.abs(stats.avgScore - wave0Stats.avgScore!)} points vs {wave0?.label}
            </p>
          )}
        </div>

        {stats.count === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-600 font-medium">No responses yet for this wave.</p>
          </div>
        ) : (
          <>
            {/* ── Radar chart ── */}
            {radarPrimary.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Dimension overview</h2>
                <RadarChart
                  dimensionScores={radarPrimary}
                  secondaryData={radarSecondary}
                  primaryLabel={selectedWave.label}
                  secondaryLabel={wave0?.label}
                  size={320}
                  dark={false}
                />
              </div>
            )}

            {/* ── Dimension score cards ── */}
            {stats.dimAvgs.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Scores by dimension</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {stats.dimAvgs.map(d => {
                    const w0dim = wave0Stats?.dimAvgs.find(x => x.dimension === d.dimension)
                    const delta = w0dim ? d.avg - w0dim.avg : null
                    return (
                      <div key={d.dimension} className={`rounded-xl border p-5 ${scoreBg(d.avg)}`}>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{d.label}</p>
                        <p className={`text-3xl font-bold ${scoreTextColor(d.avg)}`}>{d.avg}</p>
                        <p className="text-xs text-gray-500 mt-1">{scoreLabel(d.avg)}</p>
                        {delta !== null && (
                          <p className="text-xs font-semibold mt-2" style={{ color: delta >= 0 ? '#16A34A' : '#DC2626' }}>
                            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} vs {wave0?.label}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Shadow AI ── */}
            <ShadowAIPanel
              wave0Flagged={hasMultipleWaves && wave0Stats ? wave0Stats.flagged : stats.flagged}
              wave0Total={hasMultipleWaves && wave0Stats ? wave0Stats.count : stats.count}
              wave1Flagged={hasMultipleWaves && wave0Stats ? stats.flagged : undefined}
              wave1Total={hasMultipleWaves && wave0Stats ? stats.count : undefined}
              wave0Label={hasMultipleWaves && wave0 ? wave0.label : selectedWave.label}
              wave1Label={hasMultipleWaves ? selectedWave.label : undefined}
            />

            {/* ── Score distribution ── */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Score distribution</h2>
              <ScoreDistributionChart
                wave0Scores={hasMultipleWaves && wave0Stats ? wave0Scores : selScores}
                wave1Scores={hasMultipleWaves && wave0Stats ? selScores : undefined}
                wave0Label={hasMultipleWaves && wave0 ? wave0.label : selectedWave.label}
                wave1Label={selectedWave.label}
              />
            </div>

            {/* ── Dimension delta (wave 1+ only) ── */}
            {deltas.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Progress by dimension</h2>
                <DimensionDeltaChart
                  deltas={deltas}
                  wave0Label={wave0?.label}
                  wave1Label={selectedWave.label}
                />
              </div>
            )}
          </>
        )}

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-gray-400 pt-4 pb-8 border-t border-gray-100">
          AI Maturity Assessment by Kirk &amp; Blackbeard · Confidential — for {displayName} only
        </footer>

      </main>
    </div>
  )
}
