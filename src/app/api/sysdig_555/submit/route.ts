import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { type QuestionResult } from '@/products/sysdig_555/data'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`sysdig555:${ip}`, 5, 10 * 60 * 1000) // 5 per 10 min
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    const body = await req.json() as {
      name:      string
      email:     string
      totalMs:   number
      timeStr:   string
      questions: QuestionResult[]
    }

    const { name, email, totalMs, timeStr, questions } = body

    if (!name || !email || !totalMs || !questions?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const correctCount = questions.filter(q => q.correct).length

    const { error: insertError } = await supabase
      .from('sysdig_555_times')
      .insert({
        name:          name.trim(),
        email:         email.trim().toLowerCase(),
        total_ms:      totalMs,
        time_str:      timeStr,
        correct_count: correctCount,
        questions:     questions,
      })

    if (insertError) {
      console.error('[sysdig_555/submit] insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save time' }, { status: 500 })
    }

    // Rank: count faster times
    const { count, error: countError } = await supabase
      .from('sysdig_555_times')
      .select('id', { count: 'exact', head: true })
      .lt('total_ms', totalMs)

    if (countError) console.error('[sysdig_555/submit] rank error:', countError)
    const rank = (count ?? 0) + 1

    // Current top time
    const { data: topRow, error: topError } = await supabase
      .from('sysdig_555_times')
      .select('total_ms')
      .order('total_ms', { ascending: true })
      .limit(1)
      .single()

    if (topError) console.error('[sysdig_555/submit] topTime error:', topError)
    const topTime = topRow?.total_ms ?? null

    return NextResponse.json({ rank, topTime, ok: true })
  } catch (err) {
    console.error('[sysdig_555/submit] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
