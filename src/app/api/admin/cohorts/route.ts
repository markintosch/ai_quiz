export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/cohorts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

interface CohortRow {
  id: string
  company_id: string
  name: string
  date: string | null
  created_at: string
}

export async function GET() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

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
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const body = await req.json() as {
    company_id: string
    name: string
    organisation?: string | null
    access_code?: string | null
    date?: string
    wave_label?: string
    wave_date?: string | null
  }

  const { data: cohort, error } = await supabase
    .from('cohorts')
    .insert({
      company_id:   body.company_id,
      name:         body.name,
      organisation: body.organisation ?? null,
      access_code:  body.access_code ?? null,
      date:         body.date ?? null,
    })
    .select()
    .single() as unknown as { data: { id: string } | null; error: { message: string } | null }

  if (error || !cohort) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  // Auto-create wave 0 (baseline) for every new cohort
  await supabase.from('cohort_waves').insert({
    cohort_id:   cohort.id,
    wave_number: 0,
    label:       body.wave_label ?? 'Baseline',
    wave_date:   body.wave_date ?? null,
    is_open:     true,
  })

  return NextResponse.json({ data: cohort }, { status: 201 })
}
