export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/subscribe/route.ts
// POST — subscribe email to be notified when a scheduled arena session starts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { arenaEmailHtml } from '@/lib/email/arenaEmail'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()

  const body = await req.json() as { email?: string }
  const email = body.email?.trim().toLowerCase()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  // Resolve session
  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, title, scheduled_at, status')
    .eq('join_code', code)
    .single() as { data: { id: string; title: string | null; scheduled_at: string | null; status: string } | null }

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status !== 'lobby') {
    return NextResponse.json({ error: 'Session has already started' }, { status: 400 })
  }

  // Upsert subscriber (ignore duplicate)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('arena_subscribers')
    .upsert({ session_id: session.id, email }, { onConflict: 'session_id,email', ignoreDuplicates: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send confirmation email (fire-and-forget)
  void sendConfirmation(email, code, session.title, session.scheduled_at)

  return NextResponse.json({ ok: true })
}

async function sendConfirmation(
  email: string,
  code: string,
  title: string | null,
  scheduledAt: string | null
) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const joinUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/arena/${code}`
    const eventName = title ?? 'Cloud Arena'
    const scheduledStr = scheduledAt
      ? new Date(scheduledAt).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Amsterdam' })
      : 'shortly'

    const bodyHtml = `
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6">
        You&rsquo;re registered for <strong style="color:#354E5E">${eventName}</strong>.<br>
        We&rsquo;ll email you the moment the game goes live &mdash; no need to keep refreshing.
      </p>
      <div style="background:#f8f9fa;border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <p style="margin:0 0 4px;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Scheduled start</p>
        <p style="margin:0;color:#354E5E;font-size:16px;font-weight:700">${scheduledStr}</p>
      </div>
      <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5">
        You can also bookmark the game page and check back — once the game is live you can play up to <strong>5 times</strong> and your best score counts.
      </p>
    `

    await resend.emails.send({
      from:    'Cloud Arena <results@brandpwrdmedia.com>',
      to:      email,
      subject: `You're signed up for ${eventName}`,
      html:    arenaEmailHtml({
        title:    `You&rsquo;re in for ${eventName}!`,
        preheader: `You're registered for ${eventName}. We'll notify you when the game goes live.`,
        bodyHtml,
        ctaLabel: 'Bookmark the game page →',
        ctaUrl:   joinUrl,
        joinCode: code,
      }),
    })
  } catch (err) {
    console.error('[arena/subscribe] confirmation email failed:', err)
  }
}
