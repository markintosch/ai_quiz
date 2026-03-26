import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const themeId = req.nextUrl.searchParams.get('themeId')
  if (!themeId) {
    return NextResponse.json({ error: 'themeId is verplicht.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('pulse_entities')
    .select('*')
    .eq('theme_id', themeId)
    .order('sort_order')
    .order('created_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entities: data ?? [] })
}

export async function POST(req: NextRequest) {
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
  if (typeof b.themeId !== 'string' || !b.themeId.trim()) {
    return NextResponse.json({ error: 'themeId is verplicht.' }, { status: 400 })
  }
  if (typeof b.label !== 'string' || !b.label.trim()) {
    return NextResponse.json({ error: 'label is verplicht.' }, { status: 400 })
  }

  // Auto-generate slug from label if not provided
  const slug = typeof b.slug === 'string' && b.slug.trim()
    ? b.slug.trim()
    : (b.label as string).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('pulse_entities')
    .insert({
      theme_id: (b.themeId as string).trim(),
      slug,
      label: (b.label as string).trim(),
      entity_type: typeof b.entity_type === 'string' ? b.entity_type : 'festival',
      subtitle: typeof b.subtitle === 'string' ? b.subtitle : null,
      description_short: typeof b.description_short === 'string' ? b.description_short : null,
      source_url: typeof b.source_url === 'string' ? b.source_url : null,
      source_domain: typeof b.source_domain === 'string' ? b.source_domain : null,
      canonical_url: typeof b.canonical_url === 'string' ? b.canonical_url : null,
      hero_image_url: typeof b.hero_image_url === 'string' ? b.hero_image_url : null,
      og_image_url: typeof b.og_image_url === 'string' ? b.og_image_url : null,
      logo_url: typeof b.logo_url === 'string' ? b.logo_url : null,
      location_text: typeof b.location_text === 'string' ? b.location_text : null,
      organizer_name: typeof b.organizer_name === 'string' ? b.organizer_name : null,
      start_date: typeof b.start_date === 'string' ? b.start_date : null,
      end_date: typeof b.end_date === 'string' ? b.end_date : null,
      edition_label: typeof b.edition_label === 'string' ? b.edition_label : null,
      ingest_status: typeof b.ingest_status === 'string' ? b.ingest_status : 'draft',
      sort_order: typeof b.sort_order === 'number' ? b.sort_order : 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entity: data }, { status: 201 })
}
