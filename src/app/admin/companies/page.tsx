// FILE: src/app/admin/companies/page.tsx
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { DeleteCompanyButton } from '@/components/admin/DeleteCompanyButton'

export const dynamic = 'force-dynamic'

interface CompanyRow {
  id: string
  name: string
  slug: string
  logo_url: string | null
  active: boolean
  created_at: string
  product_id: string | null
}

interface ProductRow {
  id: string
  key: string
  name: string
}

export default async function CompaniesPage() {
  const supabase = createServiceClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, slug, logo_url, active, created_at, product_id')
    .order('name', { ascending: true }) as unknown as { data: CompanyRow[] | null }

  const { data: products } = await supabase
    .from('quiz_products')
    .select('id, key, name') as unknown as { data: ProductRow[] | null }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]))

  const { data: respondents } = await supabase
    .from('respondents')
    .select('company_id')
    .not('company_id', 'is', null)

  const countMap = new Map<string, number>()
  for (const r of respondents ?? []) {
    if (r.company_id) {
      countMap.set(r.company_id, (countMap.get(r.company_id) ?? 0) + 1)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <Link
          href="/admin/companies/new"
          className="bg-brand-accent hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Company
        </Link>
      </div>

      {(companies ?? []).length === 0 ? (
        <p className="text-gray-500 text-sm">No companies yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Respondents</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(companies ?? []).map((c) => {
                const product = c.product_id ? productMap.get(c.product_id) : null
                return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`/quiz/${c.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-accent hover:underline font-mono text-xs"
                    >
                      /quiz/{c.slug}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {product ? (
                      <code className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {product.key}
                      </code>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {countMap.get(c.id) ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      c.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
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
                      href={`/admin/companies/${c.id}`}
                      className="text-brand-accent hover:underline font-medium mr-3"
                    >
                      Edit
                    </Link>
                    <DeleteCompanyButton
                      companyId={c.id}
                      name={c.name}
                      respondentCount={countMap.get(c.id) ?? 0}
                    />
                  </td>
                </tr>
              )})}

            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
