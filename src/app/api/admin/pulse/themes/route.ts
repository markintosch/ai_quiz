import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data: themes, error } = await supabase
    .from('pulse_themes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enrich with entity and response counts
  const themeIds = (themes ?? []).map((t) => (t as { id: string }).id)
  const entityCounts: Record<string, number> = {}
  const responseCounts: Record<string, number> = {}

  if (themeIds.length > 0) {
    const { data: entities } = await supabase
      .from('pulse_entities')
      .select('theme_id')
      .in('theme_id', themeIds)

    for (const e of entities ?? []) {
      const entity = e as { theme_id: string }
      entityCounts[entity.theme_id] = (entityCounts[entity.theme_id] ?? 0) + 1
    }

    const { data: responses } = await supabase
      .from('pulse_responses_v2')
      .select('theme_id')
      .in('theme_id', themeIds)

    for (const r of responses ?? []) {
      const resp = r as { theme_id: string }
      responseCounts[resp.theme_id] = (responseCounts[resp.theme_id] ?? 0) + 1
    }
  }

  const result = (themes ?? []).map((t: Record<string, unknown>) => ({
    ...t,
    entity_count: entityCounts[t.id as string] ?? 0,
    response_count: responseCounts[t.id as string] ?? 0,
  }))

  return NextResponse.json({ themes: result })
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
  if (typeof b.slug !== 'string' || !b.slug.trim()) {
    return NextResponse.json({ error: 'slug is verplicht.' }, { status: 400 })
  }
  if (typeof b.title !== 'string' || !b.title.trim()) {
    return NextResponse.json({ error: 'title is verplicht.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('pulse_themes')
    .insert({
      slug: (b.slug as string).trim(),
      title: (b.title as string).trim(),
      description: typeof b.description === 'string' ? b.description : null,
      editorial_intro: typeof b.editorial_intro === 'string' ? b.editorial_intro : null,
      linked_episode_url: typeof b.linked_episode_url === 'string' ? b.linked_episode_url : null,
      presub_open_at: typeof b.presub_open_at === 'string' ? b.presub_open_at : null,
      presub_close_at: typeof b.presub_close_at === 'string' ? b.presub_close_at : null,
      opens_at: typeof b.opens_at === 'string' ? b.opens_at : null,
      closes_at: typeof b.closes_at === 'string' ? b.closes_at : null,
      disclaimer_text: typeof b.disclaimer_text === 'string' ? b.disclaimer_text : null,
      published: b.published === true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ theme: data }, { status: 201 })
}
