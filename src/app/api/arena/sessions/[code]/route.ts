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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: session, error } = await (supabase as any)
    .from('arena_sessions')
    .select('id, join_code, host_name, title, status, question_count, time_per_q, questions, started_at, ended_at, created_at, company_id, scheduled_at')
    .eq('join_code', code)
    .single() as { data: Record<string, unknown> | null; error: unknown }

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const { data: participants } = await supabase
    .from('arena_participants')
    .select('id, display_name, score, rank, joined_at')
    .eq('session_id', session.id as string)
    .order('score', { ascending: false })

  // Strip correct_value and explanation from questions — public endpoint.
  // Answers are only revealed through the /answer route after submission.
  const safeSession = { ...session }
  if (Array.isArray(safeSession.questions)) {
    safeSession.questions = (safeSession.questions as Record<string, unknown>[]).map(
      ({ correct_value: _cv, explanation: _ex, ...rest }) => rest
    )
  }

  return NextResponse.json({ session: safeSession, participants: participants ?? [] })
}
