// FILE: src/app/admin/products/page.tsx
import { createServiceClient } from '@/lib/supabase/server'
import { getAllProducts } from '@/products'

export const dynamic = 'force-dynamic'

interface ProductRow {
  id: string
  key: string
  name: string
  subdomain: string | null
  description: string | null
  active: boolean
  created_at: string
}

export default async function ProductsPage() {
  const supabase = createServiceClient()

  const { data: products } = await supabase
    .from('quiz_products')
    .select('*')
    .order('name', { ascending: true }) as unknown as { data: ProductRow[] | null }

  // Company counts per product
  const { data: companies } = await supabase
    .from('companies')
    .select('product_id')
    .not('product_id', 'is', null)

  const countMap = new Map<string, number>()
  for (const c of companies ?? []) {
    if (c.product_id) {
      countMap.set(c.product_id, (countMap.get(c.product_id) ?? 0) + 1)
    }
  }

  // Cross-check which product keys have a TypeScript config registered
  const registeredKeys = new Set(getAllProducts().map((p) => p.key))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Assessment products configured in code — developer-managed
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
        <strong>Developer note:</strong> Products are defined in{' '}
        <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">src/products/</code>.
        To add a new product, create a config file and register it in{' '}
        <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">src/products/index.ts</code>,
        then seed a matching row in the{' '}
        <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">quiz_products</code> table.
      </div>

      {(products ?? []).length === 0 ? (
        <p className="text-gray-500 text-sm">No products found in database.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Key</th>
                <th className="text-left px-4 py-3">Subdomain</th>
                <th className="text-left px-4 py-3">Companies</th>
                <th className="text-left px-4 py-3">Code config</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(products ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {p.key}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {p.subdomain ? (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {p.subdomain}.brandpwrdmedia.com
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {countMap.get(p.id) ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    {registeredKeys.has(p.key) ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-medium">
                        ✓ Registered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                        ⚠ Missing
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      p.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
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
