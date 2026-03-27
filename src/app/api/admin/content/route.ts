import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

const ALLOWED_LOCALES     = new Set(['en', 'nl', 'fr'])
const ALLOWED_PRODUCT_KEYS = new Set([
  'ai_maturity',
  'cloud_readiness',
  'cloud_arena',
  'manda_readiness',
  'hr_readiness',
  'zorgmarkt_readiness',
])

// GET /api/admin/content?locale=en&product_key=ai_maturity
// Returns the stored content blob for the given locale + product (or {} if none)
export async function GET(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const locale     = req.nextUrl.searchParams.get('locale') ?? 'en'
  const productKey = req.nextUrl.searchParams.get('product_key') ?? 'ai_maturity'

  if (!ALLOWED_LOCALES.has(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }
  if (!ALLOWED_PRODUCT_KEYS.has(productKey)) {
    return NextResponse.json({ error: 'Invalid product_key' }, { status: 400 })
  }
  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('site_content')
    .select('content, updated_at')
    .eq('locale', locale)
    .eq('product_key', productKey)
    .single() as { data: { content: Record<string, unknown>; updated_at: string } | null; error: { message: string; code: string } | null }

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ content: data?.content ?? {}, updated_at: data?.updated_at ?? null })
}

// PUT /api/admin/content
// Body: { locale: 'en' | 'nl' | 'fr', product_key: string, content: { landing, company } }
// Upserts the content blob for that locale + product
export async function PUT(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json() as { locale: string; product_key?: string; content: Record<string, unknown> }
  if (!body.locale || !body.content) {
    return NextResponse.json({ error: 'Missing locale or content' }, { status: 400 })
  }

  const productKey = body.product_key ?? 'ai_maturity'

  if (!ALLOWED_LOCALES.has(body.locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }
  if (!ALLOWED_PRODUCT_KEYS.has(productKey)) {
    return NextResponse.json({ error: 'Invalid product_key' }, { status: 400 })
  }
  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('site_content')
    .upsert(
      {
        locale: body.locale,
        product_key: productKey,
        content: body.content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'locale,product_key' }
    ) as { error: { message: string } | null }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
