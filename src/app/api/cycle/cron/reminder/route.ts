// FILE: src/app/api/cycle/cron/reminder/route.ts
// Vercel Cron entry — fires once daily (Hobby tier limit: one cron/day).
// For each onboarded cycle user without an entry for today (in their
// timezone), send an email nudge via Resend.
//
// Note: per-user `reminder_time` is stored in cycle_profiles for future use,
// but ignored on Hobby. When upgraded to Pro the schedule can flip back to
// `*/15 * * * *` and the time-window check returns.
//
// Authorization: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`.

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'

const REMINDER_FROM =
  process.env.CYCLE_REMINDER_FROM ?? 'Cycle <results@brandpwrdmedia.com>'
const REMINDER_SUBJECT_NL = 'Hoe was je dag?'

function todayInTimezone(timezone: string): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  const parts = fmt.formatToParts(new Date())
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  return `${map.year}-${map.month}-${map.day}`
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
    const today = todayInTimezone(tz)

    // Skip if already entered today
    const { count } = await supabase
      .from('cycle_daily_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', p.user_id)
      .eq('entry_date', today)
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
