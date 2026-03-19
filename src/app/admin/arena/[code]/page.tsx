// FILE: src/app/admin/arena/[code]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import ArenaSessionManager from '@/components/admin/ArenaSessionManager'

export const dynamic = 'force-dynamic'

export default async function ArenaSessionPage({ params }: { params: { code: string } }) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, join_code, host_name, status, question_count, time_per_q, started_at, ended_at, created_at, company_id')
    .eq('join_code', code)
    .single()

  if (!session) notFound()

  const { data: participants } = await supabase
    .from('arena_participants')
    .select('id, display_name, score, rank, joined_at')
    .eq('session_id', session.id)
    .order('score', { ascending: false })

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/arena" className="text-gray-500 hover:text-gray-600 text-sm">
          ← Arena
        </Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-gray-900 font-mono tracking-widest">{code}</h1>
      </div>

      <ArenaSessionManager
        session={session}
        initialParticipants={participants ?? []}
      />
    </div>
  )
}
