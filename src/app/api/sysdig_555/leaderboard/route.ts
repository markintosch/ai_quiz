export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 5-second in-memory cache — prevents Supabase connection pool saturation under burst load
let cache: { rows: unknown[]; expiresAt: number } | null = null

export async function GET(_req: NextRequest) {
  const now = Date.now()

  if (cache && now < cache.expiresAt) {
    return NextResponse.json({ rows: cache.rows })
  }

  try {
    const { data, error } = await supabase
      .from('sysdig_555_times')
      .select('id, name, time_str, total_ms, correct_count, created_at')
      .order('total_ms', { ascending: true })
      .limit(10)

    if (error) {
      console.error('[sysdig_555/leaderboard] error:', error)
      return NextResponse.json({ rows: [] })
    }

    const rows = data ?? []
    cache = { rows, expiresAt: now + 5_000 }
    return NextResponse.json({ rows })
  } catch (err) {
    console.error('[sysdig_555/leaderboard] error:', err)
    return NextResponse.json({ rows: [] })
  }
}
