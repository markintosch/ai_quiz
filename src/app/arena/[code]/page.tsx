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
    .select('id, join_code, host_name, title, status, question_count, time_per_q, scheduled_at')
    .eq('join_code', code)
    .single() as { data: { id: string; join_code: string; host_name: string; title: string | null; status: string; question_count: number; time_per_q: number; scheduled_at: string | null } | null }

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
        title={session.title}
        status={session.status}
        questionCount={session.question_count}
        timePerQ={session.time_per_q}
        scheduledAt={session.scheduled_at}
        initialParticipants={participants ?? []}
      />
    </main>
  )
}
