import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/content?locale=en
// Returns the stored content blob for the given locale (or {} if none)
export async function GET(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const locale = req.nextUrl.searchParams.get('locale') ?? 'en'
  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('site_content')
    .select('content, updated_at')
    .eq('locale', locale)
    .single() as { data: { content: Record<string, unknown>; updated_at: string } | null; error: { message: string; code: string } | null }

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ content: data?.content ?? {}, updated_at: data?.updated_at ?? null })
}

// PUT /api/admin/content
// Body: { locale: 'en' | 'nl', content: { ...landing section... } }
// Upserts the content blob for that locale
export async function PUT(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json() as { locale: string; content: Record<string, unknown> }
  if (!body.locale || !body.content) {
    return NextResponse.json({ error: 'Missing locale or content' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('site_content')
    .upsert(
      { locale: body.locale, content: body.content, updated_at: new Date().toISOString() },
      { onConflict: 'locale' }
    ) as { error: { message: string } | null }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
