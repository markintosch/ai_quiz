// FILE: src/app/arena/[code]/play/page.tsx
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import ArenaGameClient from '@/components/arena/ArenaGameClient'
import type { ArenaQuestion } from '@/products/cloud_arena/types'

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
    .select('id, join_code, status, questions, time_per_q, question_count')
    .eq('join_code', code)
    .single()

  if (!session || session.status === 'cancelled') notFound()

  // If still in lobby, redirect back to join page
  if (session.status === 'lobby') {
    return (
      <main className="min-h-screen bg-brand flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl font-bold mb-2">Game hasn&apos;t started yet</p>
          <a href={`/arena/${code}`} className="text-white/70 underline text-sm">Back to lobby</a>
        </div>
      </main>
    )
  }

  const questions = session.questions as unknown as ArenaQuestion[]

  return (
    <main className="min-h-screen bg-brand flex items-center justify-center px-4">
      <ArenaGameClient
        joinCode={code}
        participantId={participantId}
        questions={questions}
        timePerQ={session.time_per_q}
        sessionStatus={session.status}
      />
    </main>
  )
}
