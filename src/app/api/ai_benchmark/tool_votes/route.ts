import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/ai_benchmark/tool_votes?session_id=...
// Returns the user's existing vote map { tool_id: -1 | +1 } so the
// VoteButtons can hydrate correctly on first paint.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const session = (searchParams.get('session_id') || '').slice(0, 80)
  if (!session) return NextResponse.json({})

  const { data } = await supabase
    .from('ai_benchmark_tool_votes')
    .select('tool_id, direction')
    .eq('session_id', session)
    .limit(200)

  const map: Record<string, number> = {}
  for (const row of (data ?? []) as { tool_id: string; direction: number }[]) {
    map[row.tool_id] = row.direction
  }
  return NextResponse.json(map)
}
