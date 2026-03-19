export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/join/route.ts
// POST — player joins a lobby session
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
  if (session.status !== 'lobby') {
    return NextResponse.json({ error: 'Game has already started' }, { status: 400 })
  }

  const { data: participant, error } = await supabase
    .from('arena_participants')
    .insert({
      session_id:   session.id,
      display_name: body.display_name.trim(),
      email:        body.email?.trim() || null,
      score:        0,
    })
    .select('id')
    .single()

  if (error || !participant) {
    return NextResponse.json({ error: error?.message ?? 'Failed to join' }, { status: 500 })
  }

  return NextResponse.json({ participantId: participant.id, sessionId: session.id }, { status: 201 })
}
