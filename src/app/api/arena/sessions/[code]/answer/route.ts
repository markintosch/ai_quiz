export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/answer/route.ts
// POST — player submits an answer; returns correctness + points
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateArenaPoints } from '@/products/cloud_arena/types'
import type { ArenaQuestion, ArenaDifficulty } from '@/products/cloud_arena/types'
import { CLOUD_ARENA_CONFIG } from '@/products/cloud_arena/config'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()
  const body = await req.json() as {
    participant_id: string
    question_index: number
    answer_value: string
    time_taken_ms: number
  }

  if (!body.participant_id || body.question_index == null || !body.answer_value) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch session + verify participant belongs to it
  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, status, questions, time_per_q')
    .eq('join_code', code)
    .single()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status !== 'active') {
    return NextResponse.json({ error: 'Game is not active' }, { status: 400 })
  }

  const { data: participant } = await supabase
    .from('arena_participants')
    .select('id, score')
    .eq('id', body.participant_id)
    .eq('session_id', session.id)
    .single()

  if (!participant) return NextResponse.json({ error: 'Participant not found' }, { status: 404 })

  const questions = session.questions as unknown as ArenaQuestion[]
  const question = questions[body.question_index]
  if (!question) {
    return NextResponse.json({ error: 'Invalid question index' }, { status: 400 })
  }

  const isCorrect = question.correct_value === body.answer_value
  const timePerQuestionMs = session.time_per_q * 1000
  const points = calculateArenaPoints(
    isCorrect,
    body.time_taken_ms ?? timePerQuestionMs,
    timePerQuestionMs,
    (question.difficulty ?? 'medium') as ArenaDifficulty,
    CLOUD_ARENA_CONFIG.scoring
  )

  // Insert answer (unique index prevents duplicate answers for same question)
  const { error: answerError } = await supabase
    .from('arena_answers')
    .insert({
      session_id:     session.id,
      participant_id: body.participant_id,
      question_index: body.question_index,
      answer_value:   body.answer_value,
      is_correct:     isCorrect,
      time_taken_ms:  body.time_taken_ms ?? null,
      points,
    })

  if (answerError) {
    // Duplicate answer — idempotent, return existing result
    return NextResponse.json({ is_correct: isCorrect, points: 0, explanation: question.explanation ?? null })
  }

  // Update participant total score
  await supabase
    .from('arena_participants')
    .update({ score: (participant.score ?? 0) + points })
    .eq('id', body.participant_id)

  return NextResponse.json({
    is_correct:  isCorrect,
    points,
    explanation: question.explanation ?? null,
  })
}
