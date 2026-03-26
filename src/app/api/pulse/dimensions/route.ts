import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET /api/pulse/dimensions?themeId=X
// Returns all dimensions for a theme. No auth required.
export async function GET(req: NextRequest) {
  const themeId = req.nextUrl.searchParams.get('themeId')
  if (!themeId) {
    return NextResponse.json({ error: 'themeId vereist.' }, { status: 400 })
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: dimensions, error } = await supabase
    .from('pulse_dimensions')
    .select('*')
    .eq('theme_id', themeId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[pulse/dimensions] DB error:', error)
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }

  return NextResponse.json({ dimensions: dimensions ?? [] })
}
