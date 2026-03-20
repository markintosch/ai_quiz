export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/cron/daily-standings/route.ts
// GET — Vercel cron: send daily standings emails to arena subscribers
// Called daily at 08:00 Amsterdam time (7:00 UTC)
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { arenaEmailHtml } from '@/lib/email/arenaEmail'

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Get all active sessions
  const { data: sessions } = await supabase
    .from('arena_sessions')
    .select('id, join_code, title, host_name')
    .eq('status', 'active') as { data: { id: string; join_code: string; title: string | null; host_name: string }[] | null }

  if (!sessions?.length) return NextResponse.json({ ok: true, sent: 0 })

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  let sent = 0

  for (const session of sessions) {
    // Get all participants for this session
    const { data: participants } = await supabase
      .from('arena_participants')
      .select('display_name, email, score')
      .eq('session_id', session.id)

    // Get subscribers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscribers } = await (supabase as any)
      .from('arena_subscribers')
      .select('email')
      .eq('session_id', session.id) as { data: { email: string }[] | null }

    if (!subscribers?.length) continue

    // Build deduplicated leaderboard
    const map = new Map<string, { display_name: string; best_score: number; attempts: number }>()
    for (const p of participants ?? []) {
      const key = (p.email as string | null)?.trim().toLowerCase() || (p.display_name as string)
      const score = (p.score as number) ?? 0
      const existing = map.get(key)
      if (!existing) {
        map.set(key, { display_name: p.display_name as string, best_score: score, attempts: 1 })
      } else {
        existing.best_score = Math.max(existing.best_score, score)
        existing.attempts++
      }
    }

    const leaderboard = Array.from(map.values())
      .sort((a, b) => b.best_score - a.best_score)

    const totalPlayers = leaderboard.length
    const eventName = session.title ?? 'Cloud Arena'
    const joinUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/arena/${session.join_code}`

    for (const sub of subscribers) {
      const subEmail = sub.email.trim().toLowerCase()
      const myEntry = map.get(subEmail)
      const myRank = myEntry ? leaderboard.indexOf(myEntry) + 1 : null
      const attemptsUsed = myEntry?.attempts ?? 0
      const attemptsLeft = Math.max(0, 5 - attemptsUsed)

      // Top 5 leaderboard rows
      const top5 = leaderboard.slice(0, 5)
      const leaderboardRows = top5.map((entry, i) => {
        const isMe = myEntry && entry === myEntry
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
        return `<tr style="background:${isMe ? '#fff7ed' : 'transparent'}">
          <td style="padding:8px 12px;font-size:14px">${medal}</td>
          <td style="padding:8px 12px;font-size:14px;font-weight:${isMe ? '700' : '400'};color:${isMe ? '#E8611A' : '#374151'}">${entry.display_name}${isMe ? ' (you)' : ''}</td>
          <td style="padding:8px 12px;font-size:14px;font-weight:700;text-align:right;color:#354E5E">${entry.best_score}</td>
        </tr>`
      }).join('')

      const rankDisplay = myRank
        ? `<div style="display:flex;gap:12px;margin-bottom:20px">
            <div style="flex:1;background:#f0f4f8;border-radius:10px;padding:14px 16px;text-align:center">
              <p style="margin:0 0 3px;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Your rank</p>
              <p style="margin:0;color:#354E5E;font-size:26px;font-weight:800">#${myRank}<span style="font-size:14px;color:#9ca3af"> / ${totalPlayers}</span></p>
            </div>
            <div style="flex:1;background:#f0f4f8;border-radius:10px;padding:14px 16px;text-align:center">
              <p style="margin:0 0 3px;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Best score</p>
              <p style="margin:0;color:#354E5E;font-size:26px;font-weight:800">${myEntry!.best_score}<span style="font-size:14px;color:#9ca3af"> pts</span></p>
            </div>
            <div style="flex:1;background:${attemptsLeft > 0 ? '#fff7ed' : '#f0fdf4'};border-radius:10px;padding:14px 16px;text-align:center">
              <p style="margin:0 0 3px;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Attempts left</p>
              <p style="margin:0;color:${attemptsLeft > 0 ? '#E8611A' : '#16a34a'};font-size:26px;font-weight:800">${attemptsLeft}</p>
            </div>
          </div>`
        : `<p style="margin:0 0 20px;color:#374151;font-size:15px">You haven't played yet — jump in and set your score!</p>`

      const bodyHtml = `
        <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6">
          Here&rsquo;s your daily update for <strong style="color:#354E5E">${eventName}</strong>.
        </p>
        ${rankDisplay}
        <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:20px">
          <div style="background:#f8f9fa;padding:10px 12px;border-bottom:1px solid #e5e7eb">
            <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Top ${top5.length}</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
            ${leaderboardRows}
          </table>
        </div>
        ${attemptsLeft > 0
          ? `<p style="margin:0;color:#6b7280;font-size:13px">You have <strong>${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''}</strong> remaining. Your best score counts.</p>`
          : `<p style="margin:0;color:#6b7280;font-size:13px">You&rsquo;ve used all 5 attempts. Your best score is locked in!</p>`
        }
      `

      try {
        await resend.emails.send({
          from:    'Cloud Arena <results@brandpwrdmedia.com>',
          to:      sub.email,
          subject: myRank
            ? `You're #${myRank} in ${eventName} — ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left`
            : `Daily update: ${eventName} standings`,
          html: arenaEmailHtml({
            title:     `Daily standings: ${eventName}`,
            preheader: myRank ? `You're ranked #${myRank} with ${myEntry!.best_score} points. ${attemptsLeft} attempts remaining.` : `Check today's leaderboard for ${eventName}.`,
            bodyHtml,
            ctaLabel:  attemptsLeft > 0 ? 'Play now →' : 'See full leaderboard →',
            ctaUrl:    joinUrl,
            joinCode:  session.join_code,
            footerNote: 'You received this because you subscribed to this game.',
          }),
        })
        sent++
      } catch (err) {
        console.error('[arena/cron] failed to send to', sub.email, err)
      }
    }
  }

  return NextResponse.json({ ok: true, sent })
}
