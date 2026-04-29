import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { getQuestions } from '@/products/ai_benchmark/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Build the canonical Q2 tool-id allowlist once. Anything outside this set
// is rejected (no spamming arbitrary IDs).
const Q2_TOOL_IDS = (() => {
  const q2 = getQuestions('marketing').find(q => q.id === 'q2')
  if (!q2) return new Set<string>()
  return new Set(q2.options.map(o => o.id).filter(id => id !== 'none'))
})()

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`ai_benchmark_tool_vote:${ip}`, 30, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many votes' }, { status: 429 })
  }

  try {
    const body = await req.json() as {
      tool_id?:    string
      direction?:  number
      session_id?: string
    }

    const toolId  = (body.tool_id || '').slice(0, 50)
    const session = (body.session_id || '').slice(0, 80)
    const dir     = Number(body.direction)

    if (!toolId || !Q2_TOOL_IDS.has(toolId)) {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })
    }
    if (!session) {
      return NextResponse.json({ error: 'Missing session' }, { status: 400 })
    }
    if (![-1, 0, 1].includes(dir)) {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
    }

    const ua = req.headers.get('user-agent')?.slice(0, 300) ?? null

    // direction = 0 → unvote (delete row)
    if (dir === 0) {
      await supabase
        .from('ai_benchmark_tool_votes')
        .delete()
        .eq('tool_id', toolId)
        .eq('session_id', session)
      return NextResponse.json({ ok: true, direction: 0 })
    }

    // Upsert: try insert; if row exists, update direction + bump updated_at
    const { data: existing } = await supabase
      .from('ai_benchmark_tool_votes')
      .select('id, direction')
      .eq('tool_id', toolId)
      .eq('session_id', session)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('ai_benchmark_tool_votes')
        .update({ direction: dir, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('ai_benchmark_tool_votes')
        .insert({ tool_id: toolId, session_id: session, direction: dir, ip, user_agent: ua })
    }

    return NextResponse.json({ ok: true, direction: dir })
  } catch (e) {
    console.error('[ai_benchmark/tool_vote]', e)
    return NextResponse.json({ error: 'Vote failed' }, { status: 500 })
  }
}
