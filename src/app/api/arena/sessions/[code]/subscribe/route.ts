export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/subscribe/route.ts
// POST — subscribe email to be notified when a scheduled arena session starts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

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

    await resend.emails.send({
      from:    'Cloud Arena <results@brandpwrdmedia.com>',
      to:      email,
      subject: `You're signed up for ${eventName}`,
      html:    `<div style="font-family:sans-serif;max-width:480px;padding:24px">
        <h2 style="color:#354E5E">You're in!</h2>
        <p>We'll send you an email the moment <strong>${eventName}</strong> goes live.</p>
        <p style="color:#6b7280;font-size:14px">Scheduled for: <strong>${scheduledStr}</strong></p>
        <p style="margin:24px 0">
          <a href="${joinUrl}" style="background:#354E5E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">
            Bookmark the game page →
          </a>
        </p>
        <p style="color:#9ca3af;font-size:12px">Join code: <strong>${code}</strong></p>
      </div>`,
    })
  } catch (err) {
    console.error('[arena/subscribe] confirmation email failed:', err)
  }
}
