import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET /api/pulse/themes
// Returns all published themes with entity count. No auth required.
export async function GET() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: themes, error } = await supabase
    .from('pulse_themes')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[pulse/themes] DB error:', error)
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }

  // Get entity counts per theme
  const themeIds = (themes ?? []).map((t) => (t as { id: string }).id)

  let entityCounts: Record<string, number> = {}
  if (themeIds.length > 0) {
    const { data: entities } = await supabase
      .from('pulse_entities')
      .select('theme_id')
      .in('theme_id', themeIds)
      .eq('ingest_status', 'live')

    for (const e of entities ?? []) {
      const entity = e as { theme_id: string }
      entityCounts[entity.theme_id] = (entityCounts[entity.theme_id] ?? 0) + 1
    }
  }

  const result = (themes ?? []).map((t: Record<string, unknown>) => ({
    ...t,
    entity_count: entityCounts[t.id as string] ?? 0,
  }))

  return NextResponse.json({ themes: result })
}
