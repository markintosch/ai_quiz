import { createServiceClient } from '@/lib/supabase/server'
import { NewCohortForm } from '@/components/admin/NewCohortForm'

export const dynamic = 'force-dynamic'

export default async function NewCohortPage() {
  const supabase = createServiceClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('active', true)
    .order('name')

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Cohort</h1>
      <NewCohortForm companies={companies ?? []} />
    </div>
  )
}
