export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import type { SectorResult } from '@/products/nordschleife/data'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`ns_submit:${ip}`, 15, 10 * 60 * 1000)
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 })
  }
  const supabase = createClient(url, key)

  try {
    const body = await req.json() as {
      name: string
      email: string
      totalMs: number
      lapTime: string
      sectors: SectorResult[]
      paidAttempt?: boolean
    }

    const { name, email, totalMs, lapTime, sectors, paidAttempt } = body

    if (!name || !email || !totalMs || !sectors?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const correctCount = sectors.filter(s => s.correct).length

    const { error: insertError } = await supabase
      .from('nordschleife_times')
      .insert({
        name:     name.trim().slice(0, 30),
        email:    email.trim().toLowerCase(),
        total_ms: totalMs,
        lap_time: lapTime,
        sectors:  sectors,
        correct_count: correctCount,
        paid_attempt: !!paidAttempt,
      })

    if (insertError) {
      console.error('[nordschleife/submit] insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save lap' }, { status: 500 })
    }

    const { count } = await supabase
      .from('nordschleife_times')
      .select('id', { count: 'exact', head: true })
      .lt('total_ms', totalMs)

    const rank = (count ?? 0) + 1

    const { data: topRow } = await supabase
      .from('nordschleife_times')
      .select('total_ms')
      .order('total_ms', { ascending: true })
      .limit(1)
      .single()

    const trackRecord = topRow?.total_ms ?? null

    return NextResponse.json({ rank, trackRecord, ok: true })
  } catch (err) {
    console.error('[nordschleife/submit] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
