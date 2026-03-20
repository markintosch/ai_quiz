export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/start/route.ts
// POST — admin starts the game: snapshots questions, sets status → active
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, status, question_count, time_per_q, scheduled_at')
    .eq('join_code', code)
    .single() as { data: { id: string; status: string; question_count: number; time_per_q: number; scheduled_at: string | null } | null }

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status !== 'lobby') {
    return NextResponse.json({ error: 'Session is not in lobby state' }, { status: 400 })
  }

  // Auth check: admin cookie OR scheduled_at has passed (auto-start)
  const isScheduledAutoStart = session.scheduled_at && new Date(session.scheduled_at) <= new Date()
  if (!isScheduledAutoStart && !(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
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

  // Notify subscribers (fire-and-forget)
  void notifySubscribers(supabase, session.id, code)

  return NextResponse.json({ ok: true, questionCount: selected.length })
}

async function notifySubscribers(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createServiceClient>,
  sessionId: string,
  code: string
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscribers } = await (supabase as any)
      .from('arena_subscribers')
      .select('email')
      .eq('session_id', sessionId)
      .eq('notified', false) as { data: { email: string }[] | null }

    if (!subscribers?.length) return

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const joinUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/arena/${code}`

    await Promise.allSettled(
      subscribers.map(s =>
        resend.emails.send({
          from:    'Cloud Arena <results@brandpwrdmedia.com>',
          to:      s.email,
          subject: '🎮 The Cloud Arena game is starting now!',
          html:    `<div style="font-family:sans-serif;max-width:480px;padding:24px">
            <h2 style="color:#354E5E">The game is live!</h2>
            <p>The Cloud Arena session you signed up for is starting right now.</p>
            <p style="margin:24px 0">
              <a href="${joinUrl}" style="background:#E8611A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">
                Join the game →
              </a>
            </p>
            <p style="color:#9ca3af;font-size:12px">Join code: <strong>${code}</strong></p>
          </div>`,
        })
      )
    )

    // Mark as notified
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('arena_subscribers')
      .update({ notified: true })
      .eq('session_id', sessionId)
  } catch (err) {
    console.error('[arena/start] subscriber notification failed:', err)
  }
}
