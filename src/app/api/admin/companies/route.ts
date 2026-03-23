export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/companies/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

interface CompanyRow {
  id: string
  name: string
  slug: string
  logo_url: string | null
  active: boolean
  created_at: string
}

export async function GET() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true }) as unknown as { data: CompanyRow[] | null; error: { message: string } | null }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get respondent counts per company
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

  const data = (companies ?? []).map((c) => ({
    ...c,
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
    name: string
    slug: string
    logo_url?: string
    active?: boolean
    product_id?: string | null
    brand_color?: string | null
    secondary_color?: string | null
    bg_color?: string | null
    assessment_mode?: 'internal' | 'external'
  }

  // Resolve product_id — if not supplied, fall back to the ai_maturity product
  let productId = body.product_id ?? null
  if (!productId) {
    const { data: defaultProduct } = await supabase
      .from('quiz_products')
      .select('id')
      .eq('key', 'ai_maturity')
      .single() as unknown as { data: { id: string } | null }
    productId = defaultProduct?.id ?? null
  }

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name: body.name,
      slug: body.slug,
      logo_url: body.logo_url ?? null,
      active: body.active ?? true,
      product_id: productId,
      brand_color: body.brand_color ?? '#E8611A',
      secondary_color: body.secondary_color ?? '#F5A820',
      bg_color: body.bg_color ?? '#354E5E',
      assessment_mode: body.assessment_mode ?? 'internal',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
