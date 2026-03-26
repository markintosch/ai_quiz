import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function confidenceLabel(total: number): string {
  if (total < 50) return 'Vroege signalen'
  if (total < 200) return 'Eerste patroon zichtbaar'
  if (total < 1000) return 'Groeiend beeld'
  return 'Stevige responsbasis'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const themeId = searchParams.get('themeId')
  const entityId = searchParams.get('entityId')

  if (!themeId || !entityId) {
    return NextResponse.json({ error: 'themeId en entityId zijn verplicht.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('pulse_responses_v2')
    .select('scores')
    .eq('theme_id', themeId)
    .eq('entity_id', entityId)

  if (error) {
    console.error('[pulse/results] DB error:', error)
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ averages: {}, total: 0, confidenceLabel: 'Vroege signalen' })
  }

  const sums: Record<string, number> = {}
  const counts: Record<string, number> = {}

  for (const row of data) {
    const scores = row.scores as Record<string, number>
    for (const [key, val] of Object.entries(scores)) {
      if (typeof val === 'number') {
        sums[key] = (sums[key] ?? 0) + val
        counts[key] = (counts[key] ?? 0) + 1
      }
    }
  }

  const averages: Record<string, number> = {}
  for (const key of Object.keys(sums)) {
    averages[key] = Math.round((sums[key] / counts[key]) * 10) / 10
  }

  return NextResponse.json({
    averages,
    total: data.length,
    confidenceLabel: confidenceLabel(data.length),
  })
}
