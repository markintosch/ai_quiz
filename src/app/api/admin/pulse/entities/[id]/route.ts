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
    .from('pulse_entities')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  // Load agent profile if exists
  const { data: agentProfile } = await supabase
    .from('pulse_agent_profiles')
    .select('*')
    .eq('entity_id', params.id)
    .maybeSingle()

  return NextResponse.json({ entity: data, agentProfile })
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

  const updatable = [
    'slug', 'label', 'entity_type', 'subtitle', 'description_short',
    'source_url', 'source_domain', 'canonical_url', 'hero_image_url',
    'og_image_url', 'logo_url', 'location_text', 'organizer_name',
    'start_date', 'end_date', 'edition_label', 'ingest_status', 'sort_order',
    'metadata_reviewed_by',
  ]

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  for (const field of updatable) {
    if (field in b) updatePayload[field] = b[field]
  }

  const { data, error } = await supabase
    .from('pulse_entities')
    .update(updatePayload)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entity: data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('pulse_entities')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
