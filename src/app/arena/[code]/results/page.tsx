// FILE: src/app/arena/[code]/results/page.tsx
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { Press_Start_2P, VT323 } from 'next/font/google'
import Link from 'next/link'

const pressStart = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-press-start' })
const vt323 = VT323({ weight: '400', subsets: ['latin'], variable: '--font-vt323' })

interface PageProps {
  params: { code: string }
  searchParams: { pid?: string }
}

interface ParticipantRow {
  id: string
  display_name: string
  email: string | null
  score: number
}

interface LeaderboardEntry {
  display_name: string
  best_score: number
  attempts: number
  rank: number
  isMe: boolean
}

export default async function ArenaResultsPage({ params, searchParams }: PageProps) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()
  const myParticipantId = searchParams.pid ?? ''

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, join_code, host_name, title, question_count, status')
    .eq('join_code', code)
    .single() as { data: { id: string; join_code: string; host_name: string; title: string | null; question_count: number; status: string } | null }

  if (!session) notFound()

  const { data: participants } = await supabase
    .from('arena_participants')
    .select('id, display_name, email, score, attempt_number')
    .eq('session_id', session.id)
    .order('score', { ascending: false }) as { data: (ParticipantRow & { attempt_number: number })[] | null }

  // Find "me" by participantId
  const me = (participants ?? []).find(p => p.id === myParticipantId)
  const myKey = me ? (me.email?.trim().toLowerCase() || me.display_name) : null

  // Build deduplicated leaderboard (best score per player)
  const map = new Map<string, { display_name: string; best_score: number; attempts: number }>()
  for (const p of participants ?? []) {
    const key = p.email?.trim().toLowerCase() || p.display_name
    const existing = map.get(key)
    if (!existing) {
      map.set(key, { display_name: p.display_name, best_score: p.score ?? 0, attempts: 1 })
    } else {
      existing.best_score = Math.max(existing.best_score, p.score ?? 0)
      existing.attempts++
    }
  }

  const sorted = Array.from(map.entries())
    .sort((a, b) => b[1].best_score - a[1].best_score)

  const top20: LeaderboardEntry[] = sorted.slice(0, 20).map(([key, v], i) => ({
    ...v,
    rank: i + 1,
    isMe: key === myKey,
  }))

  const myInTop20 = top20.some(e => e.isMe)
  const myFullRank = myKey ? sorted.findIndex(([key]) => key === myKey) + 1 : null
  const myEntry = myKey ? map.get(myKey) : null
  const attemptsUsed = myEntry?.attempts ?? 0
  const attemptsLeft = Math.max(0, 5 - attemptsUsed)

  const eventName = session.title ?? 'Cloud Arena'
  const totalUnique = map.size

  return (
    <main
      className={`min-h-screen bg-black ${pressStart.variable} ${vt323.variable}`}
      style={{ fontFamily: 'var(--font-vt323), monospace' }}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
        }}
      />

      <div className="relative z-0 min-h-screen flex flex-col">

        {/* ── Header image area ───────────────────────────── */}
        <div className="w-full border-b-2 border-yellow-400/30 relative overflow-hidden" style={{ minHeight: '220px' }}>
          {/* Hero image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/arena-header.jpg"
            alt="Cloud Arena"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.55)' }}
          />
          {/* Overlay gradient so title stays readable */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)' }} />
          {/* Title on top */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 h-full flex flex-col items-center justify-end pb-6 pt-8">
            <p
              className="text-yellow-400 text-center tracking-widest"
              style={{ fontFamily: 'var(--font-press-start)', fontSize: 'clamp(14px, 4vw, 28px)', textShadow: '0 0 20px #FFD700, 0 0 40px #FFD700' }}
            >
              ☁ CLOUD ARENA
            </p>
            <p className="text-orange-400 mt-2 tracking-[0.5em]" style={{ fontFamily: 'var(--font-press-start)', fontSize: '10px' }}>
              {eventName.toUpperCase()}
            </p>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────── */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex gap-8">

          {/* Left: leaderboard */}
          <div className="flex-1 min-w-0">

            {/* Section title */}
            <div className="mb-6 text-center">
              <p
                className="text-orange-400 tracking-widest mb-1"
                style={{ fontFamily: 'var(--font-press-start)', fontSize: '11px', textShadow: '0 0 10px #FF6600' }}
              >
                HALL OF FAME
              </p>
              <p className="text-white/40 text-xl tracking-widest">TODAY&apos;S GREATEST</p>
            </div>

            {/* My score highlight (if participated) */}
            {me && myEntry && (
              <div className="mb-6 border-2 border-yellow-400/60 rounded-none p-4 text-center bg-yellow-400/5"
                style={{ boxShadow: '0 0 20px rgba(255,215,0,0.2)' }}>
                <p className="text-yellow-400/60 text-lg tracking-widest mb-1">YOUR SCORE</p>
                <p
                  className="text-yellow-400 tabular-nums"
                  style={{ fontFamily: 'var(--font-press-start)', fontSize: 'clamp(28px, 8vw, 48px)', textShadow: '0 0 20px #FFD700' }}
                >
                  {myEntry.best_score.toString().padStart(6, '0')}
                </p>
                <p className="text-orange-400 text-xl tracking-widest mt-1">
                  RANK #{myFullRank} OF {totalUnique}
                  {myEntry.attempts > 1 && (
                    <span className="text-white/40 text-lg ml-3">({myEntry.attempts} PLAYS)</span>
                  )}
                </p>
              </div>
            )}

            {/* Top 20 table */}
            <div className="border border-white/10">
              {/* Table header */}
              <div className="grid grid-cols-[2rem_1fr_auto] gap-4 px-4 py-2 border-b border-yellow-400/30 bg-yellow-400/5">
                <span className="text-yellow-400/60 text-sm tracking-widest">#</span>
                <span className="text-yellow-400/60 text-sm tracking-widest">NAME</span>
                <span className="text-yellow-400/60 text-sm tracking-widest">SCORE</span>
              </div>

              {top20.length === 0 && (
                <div className="px-4 py-8 text-center text-white/30 text-2xl tracking-widest">
                  NO SCORES YET
                </div>
              )}

              {top20.map((entry) => {
                const rankStr = entry.rank.toString().padStart(2, '0')
                const scoreStr = entry.best_score.toString().padStart(6, '0')
                const nameStr = entry.display_name.toUpperCase().slice(0, 16).padEnd(16, ' ')
                return (
                  <div
                    key={entry.rank}
                    className={`grid grid-cols-[2rem_1fr_auto] gap-4 px-4 py-2.5 border-b border-white/5 transition-colors
                      ${entry.isMe
                        ? 'bg-cyan-400/10 border-b-cyan-400/20'
                        : entry.rank <= 3 ? 'bg-yellow-400/5' : 'hover:bg-white/5'
                      }`}
                    style={entry.isMe ? { boxShadow: 'inset 0 0 30px rgba(0,255,255,0.05)' } : {}}
                  >
                    <span
                      className={`tabular-nums text-2xl ${
                        entry.rank === 1 ? 'text-yellow-400' :
                        entry.rank === 2 ? 'text-gray-300' :
                        entry.rank === 3 ? 'text-orange-400' :
                        'text-white/30'
                      }`}
                    >
                      {rankStr}
                    </span>
                    <span
                      className={`text-2xl tracking-wider truncate ${entry.isMe ? 'text-cyan-300' : 'text-white'}`}
                      style={entry.isMe ? { textShadow: '0 0 10px #00FFFF' } : {}}
                    >
                      {nameStr}
                      {entry.isMe && <span className="text-cyan-400/60 text-lg ml-2">&lt;YOU&gt;</span>}
                    </span>
                    <span
                      className={`text-2xl tabular-nums font-bold ${
                        entry.rank === 1 ? 'text-yellow-400' :
                        entry.isMe ? 'text-cyan-300' :
                        'text-green-400'
                      }`}
                      style={{ textShadow: entry.rank === 1 ? '0 0 10px #FFD700' : undefined }}
                    >
                      {scoreStr}
                    </span>
                  </div>
                )
              })}

              {/* My position if not in top 20 */}
              {!myInTop20 && myEntry && myFullRank && (
                <>
                  <div className="px-4 py-1.5 border-b border-white/5 text-center">
                    <span className="text-white/20 text-xl tracking-[0.5em]">· · · · · · · · ·</span>
                  </div>
                  <div
                    className="grid grid-cols-[2rem_1fr_auto] gap-4 px-4 py-2.5 bg-cyan-400/10"
                    style={{ boxShadow: 'inset 0 0 30px rgba(0,255,255,0.08)' }}
                  >
                    <span className="tabular-nums text-2xl text-cyan-400">
                      {myFullRank.toString().padStart(2, '0')}
                    </span>
                    <span className="text-2xl tracking-wider text-cyan-300" style={{ textShadow: '0 0 10px #00FFFF' }}>
                      {myEntry.display_name.toUpperCase().slice(0, 16)}
                      <span className="text-cyan-400/60 text-lg ml-2">&lt;YOU&gt;</span>
                    </span>
                    <span className="text-2xl tabular-nums font-bold text-cyan-300">
                      {myEntry.best_score.toString().padStart(6, '0')}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              {session.status === 'active' && attemptsLeft > 0 && (
                <Link
                  href={`/arena/${code}`}
                  className="inline-block border-2 border-orange-400 text-orange-400 px-8 py-3 text-xl tracking-widest hover:bg-orange-400 hover:text-black transition-colors"
                  style={{ fontFamily: 'var(--font-press-start)', fontSize: '10px', textShadow: '0 0 10px #FF6600' }}
                >
                  PLAY AGAIN ({attemptsLeft} LEFT)
                </Link>
              )}
              {session.status === 'active' && attemptsLeft === 0 && (
                <p className="text-green-400/70 text-xl tracking-widest">
                  ALL 5 ATTEMPTS USED — BEST SCORE COUNTS
                </p>
              )}
              <p className="text-white/20 text-xl tracking-widest">
                POWERED BY TRUEFULLSTAQ
              </p>
            </div>
          </div>

          {/* Right: sponsors sidebar */}
          <div className="hidden lg:flex flex-col gap-4 w-52 flex-shrink-0">
            <div className="border border-white/10 p-3">
              <p
                className="text-white/30 text-center mb-4 tracking-widest"
                style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px' }}
              >
                SPONSORS
              </p>
              {/* Sponsor slot 1 */}
              <div className="border border-white/10 bg-white/5 h-20 flex items-center justify-center mb-3">
                <p className="text-white/20 text-lg tracking-widest text-center">YOUR LOGO<br/>HERE</p>
              </div>
              {/* Sponsor slot 2 */}
              <div className="border border-white/10 bg-white/5 h-20 flex items-center justify-center mb-3">
                <p className="text-white/20 text-lg tracking-widest text-center">YOUR LOGO<br/>HERE</p>
              </div>
              {/* Sponsor slot 3 */}
              <div className="border border-white/10 bg-white/5 h-20 flex items-center justify-center">
                <p className="text-white/20 text-lg tracking-widest text-center">YOUR LOGO<br/>HERE</p>
              </div>
            </div>

            <div className="border border-white/10 p-3 text-center space-y-1">
              <p className="text-white/20 text-xl tracking-widest">{totalUnique} PLAYERS</p>
              <p className="text-white/20 text-xl tracking-widest">{session.question_count} QUESTIONS</p>
            </div>
          </div>

        </div>

        {/* Footer credits bar */}
        <div className="border-t-2 border-yellow-400/20 py-3 text-center">
          <p
            className="text-yellow-400/30 tracking-[0.5em]"
            style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px' }}
          >
            CLOUD ARENA · {code} · INSERT COIN
          </p>
        </div>

      </div>
    </main>
  )
}
