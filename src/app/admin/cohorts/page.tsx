// FILE: src/app/admin/cohorts/page.tsx
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface CohortRow {
  id: string
  company_id: string
  name: string
  date: string | null
  created_at: string
}

export default async function CohortsPage() {
  const supabase = createServiceClient()

  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('*')
    .order('created_at', { ascending: false }) as unknown as { data: CohortRow[] | null }

  const companyIds = Array.from(new Set((cohorts ?? []).map((c) => c.company_id)))
  const { data: companies } = companyIds.length
    ? await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds)
    : { data: [] }

  const companyMap = new Map((companies ?? []).map((c) => [c.id, c.name]))

  const cohortIds = (cohorts ?? []).map((c) => c.id)
  const { data: respondents } = cohortIds.length
    ? await supabase
        .from('respondents')
        .select('cohort_id')
        .in('cohort_id', cohortIds)
    : { data: [] }

  const countMap = new Map<string, number>()
  for (const r of respondents ?? []) {
    if (r.cohort_id) {
      countMap.set(r.cohort_id, (countMap.get(r.cohort_id) ?? 0) + 1)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cohorts</h1>

      {(cohorts ?? []).length === 0 ? (
        <p className="text-gray-500 text-sm">No cohorts yet. Add cohorts from a company page.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Cohort Name</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Respondents</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(cohorts ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {companyMap.get(c.company_id) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.date
                      ? new Date(c.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {countMap.get(c.id) ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(c.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
