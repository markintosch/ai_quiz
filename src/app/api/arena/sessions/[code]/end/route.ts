export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/end/route.ts
// POST — admin ends the game
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
    .select('id, status')
    .eq('join_code', code)
    .single()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status === 'completed' || session.status === 'cancelled') {
    return NextResponse.json({ error: 'Session already ended' }, { status: 400 })
  }

  const { error } = await supabase
    .from('arena_sessions')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', session.id as string)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
