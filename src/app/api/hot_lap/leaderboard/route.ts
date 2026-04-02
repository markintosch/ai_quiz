import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('hot_lap_times')
      .select('id, name, lap_time, total_ms, created_at')
      .order('total_ms', { ascending: true })
      .limit(10)

    if (error) {
      console.error('[hot_lap/leaderboard] error:', error)
      return NextResponse.json({ rows: [] })
    }

    return NextResponse.json({ rows: data ?? [] })
  } catch (err) {
    console.error('[hot_lap/leaderboard] error:', err)
    return NextResponse.json({ rows: [] })
  }
}
