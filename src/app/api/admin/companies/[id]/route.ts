export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/companies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
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
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('companies')
    .update({ active: false })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
