export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/route.ts
// POST — create a new arena session (admin only)
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

function generateJoinCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // omit O/0, I/1 for readability
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const body = await req.json() as {
    host_name: string
    question_count?: number
    time_per_q?: number
    company_id?: string | null
    difficulty?: string | null
    topic?: string | null
  }

  if (!body.host_name?.trim()) {
    return NextResponse.json({ error: 'host_name is required' }, { status: 400 })
  }

  // Generate a unique join code
  let joinCode = ''
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateJoinCode(6)
    const { data: existing } = await supabase
      .from('arena_sessions')
      .select('id')
      .eq('join_code', candidate)
      .maybeSingle()
    if (!existing) { joinCode = candidate; break }
  }
  if (!joinCode) {
    return NextResponse.json({ error: 'Could not generate unique join code' }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('arena_sessions')
    .insert({
      host_name:      body.host_name.trim(),
      join_code:      joinCode,
      question_count: body.question_count ?? 10,
      time_per_q:     body.time_per_q ?? 30,
      company_id:     body.company_id ?? null,
      status:         'lobby',
      questions:      [],
    })
    .select('id, join_code, status')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json({ sessionId: data.id, joinCode: data.join_code }, { status: 201 })
}
