export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/companies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !company) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { count } = await supabase
    .from('respondents')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', params.id)

  return NextResponse.json({ data: { ...company, respondent_count: count ?? 0 } })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const body = await req.json() as {
    name?: string
    slug?: string
    logo_url?: string | null
    active?: boolean
  }

  const { data, error } = await supabase
    .from('companies')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const id = params.id

  // Gather respondent IDs for this company
  const { data: respondents } = await supabase
    .from('respondents')
    .select('id')
    .eq('company_id', id)

  const respondentIds = (respondents ?? []).map((r) => r.id)

  // Cascade: sessions → responses → respondents → cohorts → company
  if (respondentIds.length) {
    await supabase.from('sessions').delete().in('respondent_id', respondentIds)
    await supabase.from('responses').delete().in('respondent_id', respondentIds)
    const { error: respErr } = await supabase
      .from('respondents')
      .delete()
      .in('id', respondentIds)
    if (respErr) {
      return NextResponse.json({ error: respErr.message }, { status: 500 })
    }
  }

  // Cohorts cascade-delete via FK (company_id ON DELETE CASCADE in schema)
  await supabase.from('cohorts').delete().eq('company_id', id)

  const { error } = await supabase.from('companies').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
