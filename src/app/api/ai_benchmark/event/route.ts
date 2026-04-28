import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_EVENTS = new Set([
  'page_view',
  'dashboard_viewed',
  'intro_started',
  'intro_completed',
  'question_answered',
  'submit_attempt',
  'submit_success',
  'submit_error',
  'results_viewed',
  'share_opened',
  'share_clicked',
])

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  // Generous limit — events are small and frequent during a session.
  const rl = rateLimit(`ai_benchmark_event:${ip}`, 60, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many events' }, { status: 429 })
  }

  try {
    const body = await req.json() as {
      session_id?:   string
      event_type?:   string
      question_id?:  string
      role?:         string
      meta?:         Record<string, unknown>
    }

    const session = (body.session_id || '').slice(0, 80)
    const type    = body.event_type || ''
    if (!session || !VALID_EVENTS.has(type)) {
      return NextResponse.json({ error: 'bad payload' }, { status: 400 })
    }

    const ua = req.headers.get('user-agent')?.slice(0, 300) ?? null

    await supabase.from('ai_benchmark_events').insert({
      session_id:  session,
      event_type:  type,
      question_id: (body.question_id || '').slice(0, 30) || null,
      role:        (body.role        || '').slice(0, 20) || null,
      meta:        body.meta && typeof body.meta === 'object' ? body.meta : null,
      ip,
      user_agent:  ua,
    })
    // Ignore insert errors silently — analytics is best-effort.

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
