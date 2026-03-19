export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/finish/route.ts
// POST — called when a player has answered all questions
// When all participants have finished, sets session status to 'completed' and assigns ranks.
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()
  const body = await req.json() as { participant_id: string }

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, status, question_count')
    .eq('join_code', code)
    .single()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  // Always recalculate and assign ranks based on current scores
  const { data: participants } = await supabase
    .from('arena_participants')
    .select('id, score')
    .eq('session_id', session.id)
    .order('score', { ascending: false })

  if (participants) {
    for (let i = 0; i < participants.length; i++) {
      await supabase
        .from('arena_participants')
        .update({ rank: i + 1 })
        .eq('id', participants[i].id)
    }
  }

  // Mark session completed if still active (first finisher triggers it)
  if (session.status === 'active') {
    await supabase
      .from('arena_sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', session.id)
  }

  return NextResponse.json({ ok: true })
}
