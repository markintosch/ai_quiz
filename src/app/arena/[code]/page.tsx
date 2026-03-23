// FILE: src/app/arena/[code]/page.tsx
// Player join page — enter display name to join the lobby
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { Press_Start_2P, VT323 } from 'next/font/google'
import ArenaJoinClient from '@/components/arena/ArenaJoinClient'

const pressStart = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-press-start' })
const vt323 = VT323({ weight: '400', subsets: ['latin'], variable: '--font-vt323' })

interface LeaderboardEntry {
  display_name: string
  best_score: number
  attempts: number
  rank: number
}

export default async function ArenaJoinPage({ params }: { params: { code: string } }) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, join_code, host_name, title, status, question_count, time_per_q, scheduled_at')
    .eq('join_code', code)
    .single() as { data: { id: string; join_code: string; host_name: string; title: string | null; status: string; question_count: number; time_per_q: number; scheduled_at: string | null } | null }

  if (!session) notFound()

  const { data: participants } = await supabase
    .from('arena_participants')
    .select('id, display_name')
    .eq('session_id', session.id)
    .order('joined_at', { ascending: true })

  // Fetch leaderboard if session is active
  let leaderboard: LeaderboardEntry[] = []
  if (session.status === 'active') {
    try {
      const lbRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/arena/sessions/${session.join_code}/leaderboard`,
        { cache: 'no-store' }
      )
      if (lbRes.ok) {
        const lbJson = await lbRes.json() as { leaderboard: LeaderboardEntry[] }
        leaderboard = lbJson.leaderboard
      }
    } catch {
      // Non-fatal — leaderboard will be empty on first render
    }
  }

  const eventName = session.title ?? 'Cloud Arena'

  return (
    <main
      className={`min-h-screen ${pressStart.variable} ${vt323.variable}`}
      style={{ background: '#050A14', fontFamily: 'var(--font-vt323), monospace' }}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-10 opacity-[0.06]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
        }}
      />

      <div className="relative z-0 min-h-screen flex flex-col">

        {/* ── Arena header image ─────────────────────────────── */}
        <div className="w-full relative overflow-hidden" style={{ minHeight: '480px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/truefullstaq-mars.png"
            alt="Cloud Arena"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.5)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,10,20,0.5) 0%, rgba(5,10,20,0.25) 30%, rgba(5,10,20,0.75) 65%, rgba(5,10,20,0.98) 100%)' }} />
          <div className="relative z-10 max-w-5xl mx-auto px-4 h-full flex flex-col items-center justify-end pb-6 pt-8 gap-3">
            <p
              className="text-center tracking-widest"
              style={{ fontFamily: 'var(--font-press-start)', fontSize: 'clamp(14px, 4vw, 26px)', color: '#00E5FF', textShadow: '0 0 20px rgba(0,229,255,0.8), 0 0 60px rgba(0,229,255,0.4)' }}
            >
              ☁ CLOUD ARENA
            </p>
            <p
              className="tracking-[0.4em] text-center"
              style={{ fontFamily: 'var(--font-press-start)', fontSize: '10px', color: 'rgba(0,229,255,0.6)' }}
            >
              {eventName.toUpperCase()}
            </p>
            {/* Game info strip */}
            <div style={{
              display: 'flex', gap: 0, justifyContent: 'center',
              border: '1px solid rgba(0,229,255,0.3)',
              borderRadius: 8, overflow: 'hidden',
              maxWidth: 560, margin: '1rem auto 0',
              background: 'rgba(0,0,0,0.5)',
            }}>
              {[
                { label: 'HOSTED BY', value: session.host_name.toUpperCase() },
                { label: 'QUESTIONS', value: String(session.question_count) },
                { label: 'TIME / Q', value: `${session.time_per_q}S` },
                { label: 'ATTEMPTS', value: '5 MAX' },
              ].map(({ label, value }, i) => (
                <div key={label} style={{
                  flex: 1, padding: '0.65rem 0.5rem', textAlign: 'center',
                  borderLeft: i > 0 ? '1px solid rgba(0,229,255,0.2)' : 'none',
                }}>
                  <p style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.42rem', color: 'rgba(0,229,255,0.55)', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>{label}</p>
                  <p style={{ fontFamily: 'var(--font-vt323)', fontSize: '1.5rem', color: '#FFD700', lineHeight: 1 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── What is Cloud Arena? explainer band ─────────────── */}
        <div style={{ borderBottom: '1px solid rgba(0,229,255,0.1)', background: 'rgba(0,0,0,0.4)' }}>
          <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-1">
              <p
                className="mb-2 tracking-widest"
                style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px', color: '#00E5FF', opacity: 0.7 }}
              >
                WHAT IS THIS?
              </p>
              <p className="text-white/70 text-xl leading-relaxed">
                Cloud Arena is a <span className="text-yellow-400">live knowledge game</span> about cloud technology.
                Answer questions quickly and accurately to climb the leaderboard.
                Every player has <span className="text-orange-400">5 attempts</span> — only your best score counts.
              </p>
            </div>
            <div className="flex-1">
              <p
                className="mb-2 tracking-widest"
                style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px', color: '#00E5FF', opacity: 0.7 }}
              >
                HOW SCORING WORKS
              </p>
              <p className="text-white/70 text-xl leading-relaxed">
                Each correct answer earns points. A <span className="text-green-400">speed bonus</span> rewards
                fast answers. Wrong or slow answers score zero. Final rank is based on your
                <span className="text-cyan-400"> highest score</span> across all attempts.
              </p>
            </div>
          </div>
        </div>

        {/* ── Main interactive content ─────────────────────────── */}
        <div className="flex-1">
          <ArenaJoinClient
            joinCode={session.join_code}
            hostName={session.host_name}
            title={session.title}
            status={session.status}
            questionCount={session.question_count}
            timePerQ={session.time_per_q}
            scheduledAt={session.scheduled_at}
            initialParticipants={participants ?? []}
            initialLeaderboard={leaderboard}
          />
        </div>

        {/* ── Footer credits bar ────────────────────────────────── */}
        <div className="border-t-2 border-cyan-400/20 py-3 text-center">
          <p
            className="tracking-[0.5em]"
            style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px', color: 'rgba(0,229,255,0.25)' }}
          >
            CLOUD ARENA · {code} · INSERT COIN
          </p>
        </div>

      </div>
    </main>
  )
}
