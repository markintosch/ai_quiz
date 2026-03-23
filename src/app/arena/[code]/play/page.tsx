// FILE: src/app/arena/[code]/play/page.tsx
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import ArenaGameClient from '@/components/arena/ArenaGameClient'
import type { ArenaQuestion } from '@/products/cloud_arena/types'
import { Press_Start_2P, VT323 } from 'next/font/google'

const pressStart = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-press-start' })
const vt323 = VT323({ weight: '400', subsets: ['latin'], variable: '--font-vt323' })

interface PageProps {
  params: { code: string }
  searchParams: { pid?: string }
}

export default async function ArenaPlayPage({ params, searchParams }: PageProps) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()
  const participantId = searchParams.pid ?? ''

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, join_code, status, questions, time_per_q, question_count, title')
    .eq('join_code', code)
    .single() as { data: { id: string; join_code: string; status: string; questions: unknown; time_per_q: number; question_count: number; title: string | null } | null }

  if (!session || session.status === 'cancelled') notFound()

  const eventName = session.title ?? 'Cloud Arena'

  // If still in lobby, redirect back to join page
  if (session.status === 'lobby') {
    return (
      <main
        className={`min-h-screen ${pressStart.variable} ${vt323.variable} flex items-center justify-center`}
        style={{ background: '#050A14', fontFamily: 'var(--font-vt323), monospace' }}
      >
        {/* Scanline overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-10 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)' }}
        />
        <div className="text-white text-center border border-cyan-400/30 p-8"
          style={{ boxShadow: '0 0 30px rgba(0,229,255,0.1)' }}>
          <p
            className="mb-2 tracking-widest"
            style={{ fontFamily: 'var(--font-press-start)', fontSize: '10px', color: '#00E5FF', textShadow: '0 0 10px rgba(0,229,255,0.8)' }}
          >
            ☁ CLOUD ARENA
          </p>
          <p className="text-white/60 text-2xl tracking-widest mb-6">WAITING FOR HOST TO START…</p>
          <a
            href={`/arena/${code}`}
            className="text-cyan-400/60 text-xl tracking-widest hover:text-cyan-300 transition-colors underline"
          >
            ← BACK TO LOBBY
          </a>
        </div>
      </main>
    )
  }

  const questions = session.questions as unknown as ArenaQuestion[]

  return (
    <main
      className={`min-h-screen ${pressStart.variable} ${vt323.variable} flex flex-col`}
      style={{ background: '#050A14', fontFamily: 'var(--font-vt323), monospace' }}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-10 opacity-[0.06]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)' }}
      />

      {/* Mars hero strip */}
      <div className="w-full border-b-2 border-cyan-400/20 relative overflow-hidden" style={{ minHeight: '160px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/truefullstaq-mars.png"
          alt="Cloud Arena"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.45)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,10,20,0.95) 0%, rgba(5,10,20,0.3) 60%, rgba(5,10,20,0.1) 100%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 h-full flex flex-col items-center justify-end pb-5 pt-6">
          <p
            className="text-center tracking-widest"
            style={{ fontFamily: 'var(--font-press-start)', fontSize: 'clamp(12px, 3vw, 20px)', color: '#00E5FF', textShadow: '0 0 20px rgba(0,229,255,0.8), 0 0 40px rgba(0,229,255,0.4)' }}
          >
            ☁ CLOUD ARENA
          </p>
          <p className="mt-1 tracking-[0.5em]" style={{ fontFamily: 'var(--font-press-start)', fontSize: '9px', color: '#FF6B1A' }}>
            {eventName.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Game area */}
      <div className="relative z-0 flex-1 flex items-center justify-center px-4 py-8">
        <ArenaGameClient
          joinCode={code}
          participantId={participantId}
          questions={questions}
          timePerQ={session.time_per_q}
          sessionStatus={session.status}
        />
      </div>

      {/* Footer */}
      <div className="border-t-2 border-cyan-400/15 py-3 text-center">
        <p
          className="tracking-[0.5em]"
          style={{ fontFamily: 'var(--font-press-start)', fontSize: '8px', color: 'rgba(0,229,255,0.25)' }}
        >
          CLOUD ARENA · {code} · INSERT COIN
        </p>
      </div>
    </main>
  )
}
