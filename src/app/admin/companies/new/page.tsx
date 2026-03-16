// FILE: src/app/admin/companies/new/page.tsx
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import NewCompanyForm from '@/components/admin/NewCompanyForm'

export const dynamic = 'force-dynamic'

export default async function NewCompanyPage() {
  const supabase = createServiceClient()

  const { data: products } = await supabase
    .from('quiz_products')
    .select('id, key, name')
    .eq('active', true)
    .order('name', { ascending: true }) as unknown as {
      data: { id: string; key: string; name: string }[] | null
    }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/companies" className="text-gray-500 hover:text-gray-600 text-sm">
          ← Companies
        </Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-gray-900">New Company</h1>
      </div>

      <NewCompanyForm products={products ?? []} />
    </div>
  )
}
