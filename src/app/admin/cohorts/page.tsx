import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-xs">—</span>
  const band =
    score >= 66 ? { label: score.toFixed(0), bg: 'bg-green-100', text: 'text-green-700' }
    : score >= 40 ? { label: score.toFixed(0), bg: 'bg-amber-100', text: 'text-amber-700' }
    : { label: score.toFixed(0), bg: 'bg-red-100', text: 'text-red-700' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${band.bg} ${band.text}`}>
      {band.label}
    </span>
  )
}

export default async function CohortsPage() {
  const supabase = createServiceClient()

  // Fetch cohorts with organisation
  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('id, company_id, name, organisation, access_code, created_at')
    .order('created_at', { ascending: false }) as unknown as {
      data: Array<{
        id: string
        company_id: string
        name: string
        organisation: string | null
        access_code: string | null
        created_at: string
      }> | null
    }

  const cohortList = cohorts ?? []
  const cohortIds = cohortList.map(c => c.id)
  const companyIds = Array.from(new Set(cohortList.map(c => c.company_id)))

  // Company names
  const { data: companies } = companyIds.length
    ? await supabase.from('companies').select('id, name').in('id', companyIds)
    : { data: [] }
  const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]))

  // Wave counts per cohort
  const { data: waves } = cohortIds.length
    ? await supabase.from('cohort_waves').select('cohort_id, is_open').in('cohort_id', cohortIds)
    : { data: [] }
  const waveCountMap = new Map<string, number>()
  for (const w of waves ?? []) {
    waveCountMap.set(w.cohort_id, (waveCountMap.get(w.cohort_id) ?? 0) + 1)
  }

  // Latest wave responses: avg score + shadow AI count
  // Fetch cohort_responses → responses for each cohort
  const { data: cohortResponses } = cohortIds.length
    ? await supabase
        .from('cohort_responses')
        .select('cohort_id, wave_id, response_id')
        .in('cohort_id', cohortIds)
    : { data: [] }

  const responseIds = (cohortResponses ?? []).map(r => r.response_id)
  const { data: responses } = responseIds.length
    ? await supabase
        .from('responses')
        .select('id, scores, shadow_ai_flag')
        .in('id', responseIds)
    : { data: [] }

  const responseMap = new Map((responses ?? []).map(r => [r.id, r]))

  // Build per-cohort stats
  const cohortStats = new Map<string, { scores: number[]; shadowAiCount: number }>()
  for (const cr of cohortResponses ?? []) {
    const resp = responseMap.get(cr.response_id)
    if (!resp) continue
    const existing = cohortStats.get(cr.cohort_id) ?? { scores: [], shadowAiCount: 0 }
    const overall = (resp.scores as { overall?: number })?.overall
    if (typeof overall === 'number') existing.scores.push(overall)
    if (resp.shadow_ai_flag) existing.shadowAiCount++
    cohortStats.set(cr.cohort_id, existing)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cohorts</h1>
        <Link
          href="/admin/cohorts/new"
          className="px-4 py-2 bg-brand-accent text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors"
        >
          + New cohort
        </Link>
      </div>

      {cohortList.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">No cohorts yet.</p>
          <Link
            href="/admin/cohorts/new"
            className="px-4 py-2 bg-brand-accent text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Create your first cohort
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Cohort</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Avg score</th>
                <th className="text-left px-4 py-3">Respondents</th>
                <th className="text-left px-4 py-3">Shadow AI</th>
                <th className="text-left px-4 py-3">Waves</th>
                <th className="text-left px-4 py-3">Access code</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cohortList.map((c) => {
                const stats = cohortStats.get(c.id)
                const avgScore = stats && stats.scores.length > 0
                  ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length
                  : null
                const respondentCount = stats?.scores.length ?? 0
                const shadowCount = stats?.shadowAiCount ?? 0

                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      {c.organisation && <p className="text-xs text-gray-400">{c.organisation}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {companyMap.get(c.company_id) ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={avgScore} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{respondentCount}</td>
                    <td className="px-4 py-3">
                      {shadowCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                          {shadowCount}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {waveCountMap.get(c.id) ?? 0}
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                      {c.access_code ? '••••••' : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/cohorts/${c.id}`}
                        className="text-brand-accent hover:underline font-medium text-sm"
                      >
                        Manage →
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
  )
}
