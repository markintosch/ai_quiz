// FILE: src/app/admin/arena/new/page.tsx
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import NewArenaSessionForm from '@/components/admin/NewArenaSessionForm'

export const dynamic = 'force-dynamic'

export default async function NewArenaSessionPage() {
  const supabase = createServiceClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('active', true)
    .order('name', { ascending: true })

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/arena" className="text-gray-500 hover:text-gray-600 text-sm">
          ← Arena
        </Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-gray-900">New Session</h1>
      </div>

      <NewArenaSessionForm companies={companies ?? []} />
    </div>
  )
}
