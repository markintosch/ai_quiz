import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { formatLapTime, type SectorResult } from '@/products/hot_lap/data'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`hotlap:${ip}`, 5, 10 * 60 * 1000) // 5 per 10 min
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    const body = await req.json() as {
      name: string
      email: string
      totalMs: number
      lapTime: string
      sectors: SectorResult[]
    }

    const { name, email, totalMs, lapTime, sectors } = body

    if (!name || !email || !totalMs || !sectors?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert the new lap time
    const { error: insertError } = await supabase
      .from('hot_lap_times')
      .insert({
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        total_ms: totalMs,
        lap_time: lapTime,
        sectors:  sectors,
      })

    if (insertError) {
      console.error('[hot_lap/submit] insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save lap' }, { status: 500 })
    }

    // Compute rank: count how many laps are faster than this one
    const { count, error: countError } = await supabase
      .from('hot_lap_times')
      .select('id', { count: 'exact', head: true })
      .lt('total_ms', totalMs)

    const rank = (count ?? 0) + 1

    // Get current track record
    const { data: topRow, error: topError } = await supabase
      .from('hot_lap_times')
      .select('total_ms')
      .order('total_ms', { ascending: true })
      .limit(1)
      .single()

    const trackRecord = topRow?.total_ms ?? null

    return NextResponse.json({ rank, trackRecord, ok: true })
  } catch (err) {
    console.error('[hot_lap/submit] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
