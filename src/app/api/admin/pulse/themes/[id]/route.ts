import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('pulse_themes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  // Load dimensions too
  const { data: dimensions } = await supabase
    .from('pulse_dimensions')
    .select('*')
    .eq('theme_id', params.id)
    .order('sort_order')

  return NextResponse.json({ theme: data, dimensions: dimensions ?? [] })
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek.' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const supabase = createServiceClient()

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  const fields = [
    'slug', 'title', 'description', 'editorial_intro', 'linked_episode_url',
    'presub_open_at', 'presub_close_at', 'opens_at', 'closes_at',
    'disclaimer_text', 'published',
  ]
  for (const field of fields) {
    if (field in b) updatePayload[field] = b[field]
  }

  const { data, error } = await supabase
    .from('pulse_themes')
    .update(updatePayload)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Handle dimension upserts if provided
  if (Array.isArray(b.dimensions)) {
    for (const dim of b.dimensions as Record<string, unknown>[]) {
      if (dim.id) {
        await supabase
          .from('pulse_dimensions')
          .update({
            label: String(dim.label ?? ''),
            anchor_low: String(dim.anchor_low ?? ''),
            anchor_high: String(dim.anchor_high ?? ''),
            sort_order: typeof dim.sort_order === 'number' ? dim.sort_order : undefined,
          })
          .eq('id', String(dim.id))
      } else {
        await supabase.from('pulse_dimensions').insert({
          theme_id: params.id,
          slug: String(dim.slug ?? ''),
          label: String(dim.label ?? ''),
          anchor_low: String(dim.anchor_low ?? ''),
          anchor_high: String(dim.anchor_high ?? ''),
          sort_order: typeof dim.sort_order === 'number' ? dim.sort_order : 0,
        })
      }
    }
  }

  return NextResponse.json({ theme: data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('pulse_themes')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
