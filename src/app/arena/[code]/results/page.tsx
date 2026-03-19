// FILE: src/app/arena/[code]/results/page.tsx
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

interface PageProps {
  params: { code: string }
  searchParams: { pid?: string }
}

export default async function ArenaResultsPage({ params, searchParams }: PageProps) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()
  const myParticipantId = searchParams.pid ?? ''

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, join_code, host_name, question_count, status')
    .eq('join_code', code)
    .single()

  if (!session) notFound()

  const { data: participants } = await supabase
    .from('arena_participants')
    .select('id, display_name, score, rank')
    .eq('session_id', session.id)
    .order('score', { ascending: false })

  const me = (participants ?? []).find(p => p.id === myParticipantId)
  const myRank = me?.rank ?? (participants ?? []).findIndex(p => p.id === myParticipantId) + 1

  const medal = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null

  return (
    <main className="min-h-screen bg-brand flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Cloud Arena · {code}</p>
          <p className="text-white text-2xl font-black">Final Scores</p>
          <p className="text-white/60 text-sm mt-1">Hosted by {session.host_name}</p>
        </div>

        {/* My result highlight */}
        {me && (
          <div className="bg-white/10 rounded-2xl p-5 text-center backdrop-blur-sm border border-white/20">
            <p className="text-white/60 text-xs mb-1">Your score</p>
            <p className="text-5xl font-black text-white mb-1">{me.score}</p>
            <p className="text-white/70 text-sm">
              {medal(myRank) ?? `#${myRank}`} out of {(participants ?? []).length}
            </p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white/70 text-xs uppercase tracking-wide font-semibold">Leaderboard</p>
          </div>
          <div className="divide-y divide-white/10">
            {(participants ?? []).map((p, i) => {
              const rank = p.rank ?? i + 1
              const isMe = p.id === myParticipantId
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-white/10' : ''}`}
                >
                  <span className="w-6 text-center text-sm">
                    {medal(rank) ?? <span className="text-white/40 font-mono text-xs">{rank}</span>}
                  </span>
                  <span className={`flex-1 text-sm ${isMe ? 'text-white font-bold' : 'text-white/80'}`}>
                    {p.display_name}
                    {isMe && <span className="text-white/50 font-normal ml-1">(you)</span>}
                  </span>
                  <span className="font-bold text-white tabular-nums">{p.score}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs">
          Cloud Arena · Powered by TrueFullstaq
        </p>
      </div>
    </main>
  )
}
