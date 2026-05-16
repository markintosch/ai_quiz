export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

let cache: { rows: unknown[]; expiresAt: number } | null = null

export async function GET(_req: NextRequest) {
  const now = Date.now()
  if (cache && now < cache.expiresAt) {
    return NextResponse.json({ rows: cache.rows })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    // Env not wired — return empty so the page still renders.
    return NextResponse.json({ rows: [] })
  }

  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase
      .from('nordschleife_times')
      .select('id, name, lap_time, total_ms, created_at')
      .order('total_ms', { ascending: true })
      .limit(10)

    if (error) {
      // Table may not exist yet (migration not run). Soft-fail so the landing renders.
      console.warn('[nordschleife/leaderboard] supabase error (table missing?):', error.message)
      return NextResponse.json({ rows: [] })
    }

    const rows = data ?? []
    cache = { rows, expiresAt: now + 5_000 }
    return NextResponse.json({ rows })
  } catch (err) {
    console.warn('[nordschleife/leaderboard] error:', err)
    return NextResponse.json({ rows: [] })
  }
}
