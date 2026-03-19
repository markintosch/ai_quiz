// FILE: src/app/arena/[code]/page.tsx
// Player join page — enter display name to join the lobby
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import ArenaJoinClient from '@/components/arena/ArenaJoinClient'

export default async function ArenaJoinPage({ params }: { params: { code: string } }) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, join_code, host_name, status, question_count, time_per_q')
    .eq('join_code', code)
    .single()

  if (!session) notFound()

  const { data: participants } = await supabase
    .from('arena_participants')
    .select('id, display_name')
    .eq('session_id', session.id)
    .order('joined_at', { ascending: true })

  return (
    <main className="min-h-screen bg-brand flex items-center justify-center px-4">
      <ArenaJoinClient
        joinCode={session.join_code}
        hostName={session.host_name}
        status={session.status}
        questionCount={session.question_count}
        timePerQ={session.time_per_q}
        initialParticipants={participants ?? []}
      />
    </main>
  )
}
