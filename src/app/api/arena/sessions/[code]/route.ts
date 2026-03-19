export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/route.ts
// GET — public: fetch session state + participants (used by lobby + play pages)
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()

  const { data: session, error } = await supabase
    .from('arena_sessions')
    .select('id, join_code, host_name, status, question_count, time_per_q, questions, started_at, ended_at, created_at, company_id')
    .eq('join_code', code)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const { data: participants } = await supabase
    .from('arena_participants')
    .select('id, display_name, score, rank, joined_at')
    .eq('session_id', session.id)
    .order('score', { ascending: false })

  return NextResponse.json({ session, participants: participants ?? [] })
}
