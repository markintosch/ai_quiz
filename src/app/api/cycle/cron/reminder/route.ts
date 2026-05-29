// FILE: src/app/api/cycle/cron/reminder/route.ts
// Vercel Cron entry — fires once daily (Hobby tier limit: one cron/day).
// For each onboarded cycle user without an entry for today (in their
// timezone), send a rich email nudge via Resend with progress bar,
// yesterday recap, and rotating motivation in the user's language.
//
// Note: per-user `reminder_time` is stored in cycle_profiles for future use,
// but ignored on Hobby. When upgraded to Pro the schedule can flip back to
// `*/15 * * * *` and the time-window check returns.
//
// Authorization: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`.

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import {
  buildReminderHtml,
  buildReminderSubject,
} from '@/lib/email/templates/cycleReminder'

type Lang = 'nl' | 'en' | 'fr' | 'de'
const VALID_LANGS = new Set<Lang>(['nl', 'en', 'fr', 'de'])

const REMINDER_FROM =
  process.env.CYCLE_REMINDER_FROM ?? 'Cycle <results@brandpwrdmedia.com>'

const TOTAL_DAYS = 30

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

function yesterdayInTimezone(timezone: string): string {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 86_400_000)
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  const parts = fmt.formatToParts(yesterday)
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  return `${map.year}-${map.month}-${map.day}`
}

/** Days elapsed since onboarded_at (clamped to 1..TOTAL_DAYS). */
function dayNumber(onboardedAt: string, timezone: string): number {
  const today = todayInTimezone(timezone)
  const onboarded = new Date(onboardedAt + 'T00:00:00')
  const current = new Date(today + 'T00:00:00')
  const diffMs = current.getTime() - onboarded.getTime()
  const days = Math.floor(diffMs / 86_400_000) + 1  // day 1 = first day
  return Math.max(1, Math.min(days, TOTAL_DAYS))
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Fetch profiles with onboarded_at for day-number calculation
  const { data: profiles } = await supabase
    .from('cycle_profiles')
    .select('user_id, timezone, reminder_time, onboarded_at')
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

    // Resolve user email
    const { data: userResp } = await supabase.auth.admin.getUserById(p.user_id)
    const email = userResp?.user?.email
    if (!email) continue

    // Detect language from compass assessment (fallback: 'nl')
    const { data: assessment } = await supabase
      .from('perimenopause_compass_assessments')
      .select('language')
      .eq('user_id', p.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const rawLang = ((assessment as { language?: string } | null)?.language ?? 'nl') as string
    const lang: Lang = VALID_LANGS.has(rawLang as Lang) ? (rawLang as Lang) : 'nl'

    // Fetch yesterday's scores
    const yesterday = yesterdayInTimezone(tz)
    const { data: yEntry } = await supabase
      .from('cycle_daily_entries')
      .select('mood_score, sleep, stress')
      .eq('user_id', p.user_id)
      .eq('entry_date', yesterday)
      .maybeSingle()

    const yesterdayScores = yEntry
      ? { mood: yEntry.mood_score ?? 5, sleep: yEntry.sleep ?? 5, stress: yEntry.stress ?? 5 }
      : null

    // Calculate day number
    const day = dayNumber(p.onboarded_at as string, tz)

    try {
      await resend.emails.send({
        from:    REMINDER_FROM,
        to:      email,
        subject: buildReminderSubject(lang),
        html:    buildReminderHtml({
          lang,
          dayNumber: day,
          totalDays: TOTAL_DAYS,
          yesterday: yesterdayScores,
          ctaUrl: 'https://markdekock.com/Cycle/today',
        }),
      })
      sent++
    } catch (err) {
      console.error('[cycle reminder] send failed for', p.user_id, err)
    }
  }

  return NextResponse.json({ ok: true, sent })
}
