export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/end/route.ts
// POST — admin ends the game; fires game-over + winner emails (fire-and-forget)
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'
import { arenaEmailHtml, gameOverBodyHtml, winnerBodyHtml, type LeaderboardEntry } from '@/lib/email/arenaEmail'

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
    .select('id, status, title, host_name')
    .eq('join_code', code)
    .single() as { data: { id: string; status: string; title: string | null; host_name: string } | null }

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status === 'completed' || session.status === 'cancelled') {
    return NextResponse.json({ error: 'Session already ended' }, { status: 400 })
  }

  const { error } = await supabase
    .from('arena_sessions')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', session.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fire completion emails — non-blocking
  void sendCompletionEmails(supabase, session.id, code, session.title, session.host_name)

  return NextResponse.json({ ok: true })
}

// ── Completion email sender ───────────────────────────────────────────────────

async function sendCompletionEmails(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createServiceClient>,
  sessionId: string,
  code: string,
  title: string | null,
  hostName: string,
) {
  try {
    // Fetch all participants
    const { data: participants } = await supabase
      .from('arena_participants')
      .select('display_name, email, score')
      .eq('session_id', sessionId) as {
        data: { display_name: string; email: string | null; score: number }[] | null
      }

    if (!participants?.length) return

    // Deduplicate by email (or display_name fallback) — keep best score
    const map = new Map<string, { display_name: string; email: string | null; best_score: number }>()
    for (const p of participants) {
      const key = p.email?.trim().toLowerCase() ?? p.display_name.trim().toLowerCase()
      const existing = map.get(key)
      if (!existing || p.score > existing.best_score) {
        map.set(key, { display_name: p.display_name, email: p.email ?? null, best_score: p.score })
      }
    }

    // Sort by best score descending → assign ranks
    const ranked: (LeaderboardEntry & { email: string | null })[] = Array.from(map.values())
      .sort((a, b) => b.best_score - a.best_score)
      .map((p, i) => ({ ...p, rank: i + 1 }))

    const totalPlayers = ranked.length
    const top3 = ranked.slice(0, 3)
    const sessionTitle = title ?? 'Cloud Arena'
    const resultsUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/arena/${code}/results`

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    await Promise.allSettled(
      ranked
        .filter(p => !!p.email)
        .map(p => {
          const isWinner = p.rank === 1

          // Winner gets the trophy email
          if (isWinner) {
            return resend.emails.send({
              from:    'Cloud Arena <results@brandpwrdmedia.com>',
              to:      p.email!,
              subject: `🏆 You won ${sessionTitle}`,
              html:    arenaEmailHtml({
                title:     `You won — ${sessionTitle}`,
                preheader: `You topped the leaderboard with ${p.best_score.toLocaleString()} points. Your host will be in touch.`,
                bodyHtml:  winnerBodyHtml({
                  winnerName:   p.display_name,
                  winnerScore:  p.best_score,
                  totalPlayers,
                  top3,
                  sessionTitle,
                }),
                ctaLabel:  'See the full leaderboard →',
                ctaUrl:    resultsUrl,
                joinCode:  code,
                footerNote: `Hosted by ${hostName}`,
              }),
            })
          }

          // Everyone else gets the game-over email
          return resend.emails.send({
            from:    'Cloud Arena <results@brandpwrdmedia.com>',
            to:      p.email!,
            subject: `🏁 ${sessionTitle} — Final results`,
            html:    arenaEmailHtml({
              title:     `${sessionTitle} — Game over`,
              preheader: `The battle is over. You finished #${p.rank} with ${p.best_score.toLocaleString()} points. See the final leaderboard.`,
              bodyHtml:  gameOverBodyHtml({
                playerName:   p.display_name,
                playerRank:   p.rank,
                playerScore:  p.best_score,
                totalPlayers,
                top3,
                resultsUrl,
              }),
              ctaLabel:  'See the full leaderboard →',
              ctaUrl:    resultsUrl,
              joinCode:  code,
              footerNote: `Hosted by ${hostName}`,
            }),
          })
        })
    )
  } catch (err) {
    console.error('[arena/end] completion email failed:', err)
  }
}
