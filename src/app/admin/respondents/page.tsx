// FILE: src/app/admin/respondents/page.tsx
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

// Legacy responses (pre multi-product) have product_key = NULL. Treat them as ai_maturity.
const AI_MATURITY_KEY = 'ai_maturity'

// Acronyms that should stay uppercase in product labels.
const ACRONYMS = new Set(['ai', 'pr', 'hr', 'cx', 'esg', 'hcss', 'sbs', 'md'])

/** Turn a product_key like "pr_maturity" into a readable label like "PR Maturity". */
function prettifyProduct(key: string): string {
  return key
    .split(/[_-]/)
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/** Each product can have its own results page. Wouterblok lives outside the /results/[id] pipeline. */
function resultHref(productKey: string | null | undefined, responseId: string): string {
  switch (productKey) {
    case 'wouterblok':
      return `/wouterblok/results?id=${responseId}`
    default:
      return `/results/${responseId}`
  }
}

export default async function RespondentsPage(
  props: {
    searchParams: Promise<{ page?: string; version?: string; product?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const version = searchParams.version ?? 'all'
  const product = searchParams.product ?? 'all'
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createServiceClient()

  // ── Build the product filter options from product_keys actually present in the DB ──
  // (only products that have submissions show up). Falls back to no filter if the
  // product_key column is missing on a legacy database.
  let productOptions: { key: string; count: number }[] = []
  try {
    const { data: pkRows } = await supabase.from('responses').select('product_key')
    const counts = new Map<string, number>()
    for (const row of pkRows ?? []) {
      const key = ((row as { product_key: string | null }).product_key) ?? AI_MATURITY_KEY
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    productOptions = Array.from(counts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
  } catch {
    productOptions = []
  }

  // ── When a product is selected, restrict to respondents who took that product ──
  let allowedIds: string[] | null = null
  if (product !== 'all') {
    let idsQuery = supabase.from('responses').select('respondent_id')
    if (product === AI_MATURITY_KEY) {
      idsQuery = idsQuery.or(`product_key.eq.${AI_MATURITY_KEY},product_key.is.null`)
    } else {
      idsQuery = idsQuery.eq('product_key', product)
    }
    const { data: idRows } = await idsQuery
    allowedIds = Array.from(new Set((idRows ?? []).map((r) => (r as { respondent_id: string }).respondent_id)))
  }

  let respondentsQuery = supabase
    .from('respondents')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (allowedIds) {
    respondentsQuery = respondentsQuery.in('id', allowedIds.length ? allowedIds : ['none'])
  }

  const { data: respondents, count } = await respondentsQuery
    .range(from, to) as unknown as { data: RespondentRow[] | null; count: number | null }

  const respondentIds = (respondents ?? []).map((r) => r.id)

  let responsesQuery = supabase
    .from('responses')
    .select('respondent_id, id, quiz_version, scores, maturity_level, product_key')
    .in('respondent_id', respondentIds.length ? respondentIds : ['none'])

  if (version !== 'all') {
    responsesQuery = responsesQuery.eq('quiz_version', version)
  }
  if (product === AI_MATURITY_KEY) {
    responsesQuery = responsesQuery.or(`product_key.eq.${AI_MATURITY_KEY},product_key.is.null`)
  } else if (product !== 'all') {
    responsesQuery = responsesQuery.eq('product_key', product)
  }

  const { data: responses } = await responsesQuery

  const responseMap = new Map<string, {
    id: string
    quiz_version: string
    scores: ScoresJsonb
    maturity_level: string
    product_key: string | null
  }>()

  for (const resp of responses ?? []) {
    if (!responseMap.has(resp.respondent_id)) {
      responseMap.set(resp.respondent_id, {
        id: resp.id,
        quiz_version: resp.quiz_version,
        scores: resp.scores as unknown as ScoresJsonb,
        maturity_level: resp.maturity_level,
        product_key: (resp as { product_key: string | null }).product_key ?? null,
      })
    }
  }

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Carries the current version + product across tab/pagination/export links.
  const qs = (overrides: Record<string, string | number>) => {
    const params = new URLSearchParams({ version, product, page: String(page), ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])) })
    return params.toString()
  }

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
          <p className="text-sm text-gray-600 mt-0.5">{totalCount} total</p>
        </div>
        <a
          href={`/api/admin/export?version=${version}&product=${product}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          ↓ Export CSV
        </a>
      </div>

      {/* Product filter */}
      {productOptions.length > 1 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Assessment</p>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={`/admin/respondents?${qs({ product: 'all', page: 1 })}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                product === 'all'
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All assessments
            </Link>
            {productOptions.map((opt) => (
              <Link
                key={opt.key}
                href={`/admin/respondents?${qs({ product: opt.key, page: 1 })}`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  product === opt.key
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {prettifyProduct(opt.key)}
                <span className={`ml-1.5 ${product === opt.key ? 'text-white/70' : 'text-gray-400'}`}>{opt.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Version filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {VERSION_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/respondents?${qs({ version: tab.value, page: 1 })}`}
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
        <p className="text-gray-500 text-sm">No respondents found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
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
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(respondents ?? []).map((r) => {
                const resp = responseMap.get(r.id)
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.email}</td>
                    <td className="px-4 py-3 text-gray-600">{r.company_name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.job_title}</td>
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
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {resp && (
                        <Link
                          href={resultHref(resp.product_key, resp.id)}
                          className="text-brand-accent hover:underline font-medium"
                        >
                          View →
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteRespondentButton respondentId={r.id} name={r.name} />
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
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/respondents?${qs({ page: page - 1 })}`}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/respondents?${qs({ page: page + 1 })}`}
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
