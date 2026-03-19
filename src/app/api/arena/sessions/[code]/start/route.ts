export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/start/route.ts
// POST — admin starts the game: snapshots questions, sets status → active
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export async function POST(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const code = params.code.toUpperCase()

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, status, question_count, time_per_q')
    .eq('join_code', code)
    .single()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status !== 'lobby') {
    return NextResponse.json({ error: 'Session is not in lobby state' }, { status: 400 })
  }

  // Pick random active questions
  const { data: questions } = await supabase
    .from('arena_questions')
    .select('id, question_text, options, correct_value, explanation, difficulty, topic')
    .eq('active', true)
    .order('created_at', { ascending: true })
    .limit(200)

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'No questions available' }, { status: 400 })
  }

  // Shuffle and pick question_count
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(session.question_count, shuffled.length))

  const { error } = await supabase
    .from('arena_sessions')
    .update({
      status:     'active',
      started_at: new Date().toISOString(),
      questions:  selected,
    })
    .eq('id', session.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, questionCount: selected.length })
}
