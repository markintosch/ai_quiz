// FILE: src/app/api/cycle/cron/reminder/route.ts
// Vercel Cron entry — fires every 15 minutes. For each cycle user whose
// reminder window matches "now" in their timezone AND who hasn't logged
// today, send an email nudge via Resend.
//
// Authorization: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`.

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'

const REMINDER_FROM =
  process.env.CYCLE_REMINDER_FROM ?? 'Cycle <results@brandpwrdmedia.com>'
const REMINDER_SUBJECT_NL = 'Hoe was je dag?'

function nowInTimezone(timezone: string): { date: string; time: string } {
  // Use Intl to get the current local date and HH:MM in the given timezone.
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const parts = fmt.formatToParts(new Date())
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${map.hour}:${map.minute}`,
  }
}

function diffMinutes(timeA: string, timeB: string): number {
  const [aH, aM] = timeA.split(':').map(Number)
  const [bH, bM] = timeB.split(':').map(Number)
  return Math.abs((aH * 60 + aM) - (bH * 60 + bM))
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: profiles } = await supabase
    .from('cycle_profiles')
    .select('user_id, timezone, reminder_time')
    .not('onboarded_at', 'is', null)

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  let sent = 0
  for (const p of profiles) {
    const tz = p.timezone || 'Europe/Amsterdam'
    const local = nowInTimezone(tz)

    // Cron fires every 15 min, so a ±10 min window around reminder_time
    // covers exactly one tick.
    if (diffMinutes(local.time, p.reminder_time) > 10) continue

    // Skip if already entered today
    const { count } = await supabase
      .from('cycle_daily_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', p.user_id)
      .eq('entry_date', local.date)
    if ((count ?? 0) > 0) continue

    // Resolve the user's email via auth.admin
    const { data: userResp } = await supabase.auth.admin.getUserById(p.user_id)
    const email = userResp?.user?.email
    if (!email) continue

    try {
      await resend.emails.send({
        from:    REMINDER_FROM,
        to:      email,
        subject: REMINDER_SUBJECT_NL,
        html: `
          <div style="font-family:'Cormorant Garamond',Georgia,serif;max-width:480px;padding:32px;color:#3D2F2A;background:#FBF1ED">
            <h1 style="font-size:32px;font-weight:400;margin:0 0 12px;letter-spacing:-0.01em">Hoe was je dag?</h1>
            <p style="font-family:Inter,system-ui,sans-serif;font-size:16px;line-height:1.55;margin:0 0 20px">
              Een korte check-in van 30 seconden.
            </p>
            <a href="https://markdekock.com/Cycle/today"
               style="display:inline-block;background:#D4847E;color:#fff;padding:14px 22px;
                      border-radius:14px;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-weight:500">
              Vandaag invullen
            </a>
          </div>
        `,
      })
      sent++
    } catch (err) {
      console.error('[cycle reminder] send failed for', p.user_id, err)
    }
  }

  return NextResponse.json({ ok: true, sent })
}
