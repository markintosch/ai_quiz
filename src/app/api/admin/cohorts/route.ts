export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/cohorts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface CohortRow {
  id: string
  company_id: string
  name: string
  date: string | null
  created_at: string
}

export async function GET() {
  const supabase = createServiceClient()

  const { data: cohorts, error } = await supabase
    .from('cohorts')
    .select('*')
    .order('created_at', { ascending: false }) as unknown as { data: CohortRow[] | null; error: { message: string } | null }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch companies for name lookup
  const companyIds = Array.from(new Set((cohorts ?? []).map((c) => c.company_id)))
  const { data: companies } = companyIds.length
    ? await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds)
    : { data: [] }

  const companyMap = new Map((companies ?? []).map((c) => [c.id, c.name]))

  // Respondent count per cohort
  const { data: respondents } = await supabase
    .from('respondents')
    .select('cohort_id')
    .not('cohort_id', 'is', null)

  const countMap = new Map<string, number>()
  for (const r of respondents ?? []) {
    if (r.cohort_id) {
      countMap.set(r.cohort_id, (countMap.get(r.cohort_id) ?? 0) + 1)
    }
  }

  const data = (cohorts ?? []).map((c) => ({
    ...c,
    company_name: companyMap.get(c.company_id) ?? '—',
    respondent_count: countMap.get(c.id) ?? 0,
  }))

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json() as {
    company_id: string
    name: string
    date?: string
  }

  const { data, error } = await supabase
    .from('cohorts')
    .insert({
      company_id: body.company_id,
      name: body.name,
      date: body.date ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
