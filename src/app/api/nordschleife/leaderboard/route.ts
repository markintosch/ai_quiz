export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// No in-memory cache — the previous module-level cache was returning stale
// empty arrays on Vercel even after the table got populated. Cache via
// Cache-Control headers instead so the CDN does the heavy lifting.

export async function GET(_req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json(
      { rows: [], _debug: 'env_missing' },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const supabase = createClient(url, key)
    const { data, error, count } = await supabase
      .from('nordschleife_times')
      .select('id, name, lap_time, total_ms, created_at', { count: 'exact' })
      .order('total_ms', { ascending: true })
      .limit(10)

    if (error) {
      console.warn('[nordschleife/leaderboard] supabase error:', error.message)
      return NextResponse.json(
        { rows: [], _debug: 'supabase_error', _message: error.message },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    return NextResponse.json(
      { rows: data ?? [], _total: count ?? 0 },
      {
        headers: {
          // 5-second CDN cache (matches the old in-memory cache behaviour)
          'Cache-Control': 's-maxage=5, stale-while-revalidate=15',
        },
      },
    )
  } catch (err) {
    console.warn('[nordschleife/leaderboard] exception:', err)
    return NextResponse.json(
      { rows: [], _debug: 'exception', _message: String(err) },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
