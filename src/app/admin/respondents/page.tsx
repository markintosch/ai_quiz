// FILE: src/app/admin/respondents/page.tsx
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import ScoreBadge from '@/components/admin/ScoreBadge'

export const dynamic = 'force-dynamic'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: Record<string, unknown>
}

interface RespondentRow {
  id: string
  name: string
  email: string
  job_title: string
  company_name: string
  company_id: string | null
  cohort_id: string | null
  industry: string | null
  company_size: string | null
  source: string
  gdpr_consent: boolean
  calendly_status: string | null
  created_at: string
}

const PAGE_SIZE = 20

export default async function RespondentsPage({
  searchParams,
}: {
  searchParams: { page?: string; version?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const version = searchParams.version ?? 'all'
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createServiceClient()

  const { data: respondents, count } = await supabase
    .from('respondents')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to) as unknown as { data: RespondentRow[] | null; count: number | null }

  const respondentIds = (respondents ?? []).map((r) => r.id)

  let responsesQuery = supabase
    .from('responses')
    .select('respondent_id, id, quiz_version, scores, maturity_level')
    .in('respondent_id', respondentIds.length ? respondentIds : ['none'])

  if (version !== 'all') {
    responsesQuery = responsesQuery.eq('quiz_version', version)
  }

  const { data: responses } = await responsesQuery

  const responseMap = new Map<string, {
    id: string
    quiz_version: string
    scores: ScoresJsonb
    maturity_level: string
  }>()

  for (const resp of responses ?? []) {
    if (!responseMap.has(resp.respondent_id)) {
      responseMap.set(resp.respondent_id, {
        id: resp.id,
        quiz_version: resp.quiz_version,
        scores: resp.scores as unknown as ScoresJsonb,
        maturity_level: resp.maturity_level,
      })
    }
  }

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const VERSION_TABS = [
    { label: 'All', value: 'all' },
    { label: 'Lite', value: 'lite' },
    { label: 'Full', value: 'full' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Respondents</h1>
          <p className="text-sm text-gray-400 mt-0.5">{totalCount} total</p>
        </div>
        <a
          href={`/api/admin/export?version=${version}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          ↓ Export CSV
        </a>
      </div>

      {/* Version filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {VERSION_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/respondents?version=${tab.value}&page=1`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              version === tab.value
                ? 'bg-white text-brand shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {(respondents ?? []).length === 0 ? (
        <p className="text-gray-400 text-sm">No respondents found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Job Title</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Level</th>
                <th className="text-left px-4 py-3">Version</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(respondents ?? []).map((r) => {
                const resp = responseMap.get(r.id)
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-gray-500">{r.email}</td>
                    <td className="px-4 py-3 text-gray-500">{r.company_name}</td>
                    <td className="px-4 py-3 text-gray-500">{r.job_title}</td>
                    <td className="px-4 py-3 font-semibold text-brand">
                      {resp ? resp.scores.overall : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {resp ? <ScoreBadge level={resp.maturity_level} /> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {resp ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          resp.quiz_version === 'lite'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {resp.quiz_version}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {resp && (
                        <Link
                          href={`/results/${resp.id}`}
                          className="text-brand-accent hover:underline font-medium"
                        >
                          View →
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/respondents?version=${version}&page=${page - 1}`}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/respondents?version=${version}&page=${page + 1}`}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
