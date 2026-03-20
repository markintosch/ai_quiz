export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/join/route.ts
// POST — player joins a lobby or active session (up to 5 attempts per email)
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()
  const body = await req.json() as { display_name: string; email?: string }

  if (!body.display_name?.trim()) {
    return NextResponse.json({ error: 'display_name is required' }, { status: 400 })
  }

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, status')
    .eq('join_code', code)
    .single()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status !== 'lobby' && session.status !== 'active') {
    return NextResponse.json({ error: 'This game has ended' }, { status: 400 })
  }

  // Check attempt limit (by email)
  let attemptNumber = 1
  if (body.email?.trim()) {
    const email = body.email.trim().toLowerCase()
    const { count } = await supabase
      .from('arena_participants')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session.id as string)
      .eq('email', email)

    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: 'You have used all 5 attempts for this game. Only your best score counts.' },
        { status: 400 }
      )
    }
    attemptNumber = (count ?? 0) + 1
  }

  const { data: participant, error } = await supabase
    .from('arena_participants')
    .insert({
      session_id:     session.id as string,
      display_name:   body.display_name.trim(),
      email:          body.email?.trim().toLowerCase() || null,
      score:          0,
      attempt_number: attemptNumber,
    })
    .select('id')
    .single()

  if (error || !participant) {
    return NextResponse.json({ error: error?.message ?? 'Failed to join' }, { status: 500 })
  }

  return NextResponse.json({ participantId: participant.id, sessionId: session.id, attemptNumber }, { status: 201 })
}
