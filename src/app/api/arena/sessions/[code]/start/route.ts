export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/start/route.ts
// POST — admin starts the game: snapshots questions, sets status → active
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'
import { arenaEmailHtml } from '@/lib/email/arenaEmail'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, status, question_count, time_per_q, scheduled_at, title, product_key')
    .eq('join_code', code)
    .single() as { data: { id: string; status: string; question_count: number; time_per_q: number; scheduled_at: string | null; title: string | null; product_key: string | null } | null }

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status !== 'lobby') {
    return NextResponse.json({ error: 'Session is not in lobby state' }, { status: 400 })
  }

  // Auth check: admin cookie OR scheduled_at has passed (auto-start)
  const isScheduledAutoStart = session.scheduled_at && new Date(session.scheduled_at) <= new Date()
  if (!isScheduledAutoStart && !(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Pick random active questions filtered by product_key
  const productKey = session.product_key ?? 'cloud_arena'
  const { data: questions } = await supabase
    .from('arena_questions')
    .select('id, question_text, options, correct_value, explanation, difficulty, topic')
    .eq('active', true)
    .eq('product_key', productKey)
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
  void notifySubscribers(supabase, session.id, code, session.title)

  return NextResponse.json({ ok: true, questionCount: selected.length })
}

async function notifySubscribers(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createServiceClient>,
  sessionId: string,
  code: string,
  title: string | null
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
    const eventName = title ?? 'Cloud Arena'

    const bodyHtml = `
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6">
        The game is <strong style="color:#E8611A">live right now</strong> &mdash; jump in before others get ahead of you.
      </p>
      <div style="display:flex;gap:12px;margin-bottom:20px">
        <div style="flex:1;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;text-align:center">
          <p style="margin:0 0 3px;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Attempts</p>
          <p style="margin:0;color:#E8611A;font-size:20px;font-weight:800">5 max</p>
        </div>
        <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;text-align:center">
          <p style="margin:0 0 3px;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Scoring</p>
          <p style="margin:0;color:#16a34a;font-size:20px;font-weight:800">Best wins</p>
        </div>
      </div>
      <p style="margin:0;color:#6b7280;font-size:13px">Your best score across all attempts counts toward the leaderboard.</p>
    `

    await Promise.allSettled(
      subscribers.map(s =>
        resend.emails.send({
          from:    'Cloud Arena <results@brandpwrdmedia.com>',
          to:      s.email,
          subject: '🎮 The game is live — join now!',
          html:    arenaEmailHtml({
            title:     'The game is live!',
            preheader: 'Your Cloud Arena game has just started. Jump in now — 5 attempts, best score wins.',
            bodyHtml,
            ctaLabel:  'Join the game now →',
            ctaUrl:    joinUrl,
            joinCode:  code,
          }),
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
