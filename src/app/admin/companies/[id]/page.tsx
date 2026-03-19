// FILE: src/app/admin/companies/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import CompanyEditForm from '@/components/admin/CompanyEditForm'
import AddCohortForm from '@/components/admin/AddCohortForm'
import SendReportButton from '@/components/admin/SendReportButton'

export const dynamic = 'force-dynamic'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: Record<string, unknown>
}

interface CompanyRow {
  id: string
  name: string
  slug: string
  logo_url: string | null
  active: boolean
  created_at: string
  brand_color: string | null
  welcome_message: string | null
  excluded_question_codes: string[] | null
  product_id: string | null
  access_code: string | null
  notify_email: string | null
}

interface ProductRow {
  id: string
  key: string
  name: string
}

interface CohortRow {
  id: string
  company_id: string
  name: string
  date: string | null
  created_at: string
}

export default async function CompanyDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServiceClient()

  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single() as unknown as { data: CompanyRow | null; error: unknown }

  if (error || !company) {
    notFound()
  }

  // Respondents for this company
  const { data: respondents } = await supabase
    .from('respondents')
    .select('id')
    .eq('company_id', params.id)

  const respondentIds = (respondents ?? []).map((r) => r.id)
  const respondentCount = respondentIds.length

  // Avg score
  let avgScore: number | null = null
  if (respondentIds.length > 0) {
    const { data: responses } = await supabase
      .from('responses')
      .select('scores')
      .in('respondent_id', respondentIds)

    if (responses && responses.length > 0) {
      let total = 0
      for (const r of responses) {
        const scores = r.scores as unknown as ScoresJsonb
        total += scores.overall ?? 0
      }
      avgScore = Math.round(total / responses.length)
    }
  }

  // Products for dropdown
  const { data: products } = await supabase
    .from('quiz_products')
    .select('id, key, name')
    .eq('active', true)
    .order('name', { ascending: true }) as unknown as { data: ProductRow[] | null }

  // Cohorts for this company
  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('*')
    .eq('company_id', params.id)
    .order('created_at', { ascending: false }) as unknown as { data: CohortRow[] | null }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/companies" className="text-gray-500 hover:text-gray-600 text-sm">
          ← Companies
        </Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
      </div>

      {/* Quick stats + actions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-brand rounded-xl p-4 text-white">
          <p className="text-sm text-white/70 mb-1">Total Respondents</p>
          <p className="text-3xl font-bold">{respondentCount}</p>
        </div>
        <div className="bg-brand rounded-xl p-4 text-white">
          <p className="text-sm text-white/70 mb-1">Avg Score</p>
          <p className="text-3xl font-bold">{avgScore !== null ? avgScore : '—'}</p>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex gap-3 mb-8">
        <a
          href={`/api/admin/export?company_id=${company.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          ↓ Export CSV
        </a>
        <SendReportButton companyId={company.id} companyName={company.name} />
      </div>

      {/* Edit form */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Company</h2>
        <CompanyEditForm
          company={{
            id: company.id,
            name: company.name,
            slug: company.slug,
            logo_url: company.logo_url,
            active: company.active,
            brand_color: company.brand_color,
            welcome_message: company.welcome_message,
            excluded_question_codes: company.excluded_question_codes,
            product_id: company.product_id,
            access_code: company.access_code,
            notify_email: company.notify_email,
          }}
          products={products ?? []}
        />
      </div>

      {/* Cohorts section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Cohorts</h2>

        {(cohorts ?? []).length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-100 mb-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(cohorts ?? []).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.date
                        ? new Date(c.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(c.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/cohorts/${c.id}`}
                        className="text-brand-accent hover:underline font-medium text-sm"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Add Cohort</h3>
          <AddCohortForm companyId={params.id} />
        </div>
      </div>
    </div>
  )
}
