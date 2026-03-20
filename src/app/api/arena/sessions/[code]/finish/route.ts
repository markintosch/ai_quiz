export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/finish/route.ts
// POST — called when a player has answered all questions
// When all participants have finished, sets session status to 'completed' and assigns ranks.
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()
  const body = await req.json() as { participant_id: string }

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, status, question_count')
    .eq('join_code', code)
    .single()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  // Always recalculate and assign ranks based on current scores
  const { data: participants } = await supabase
    .from('arena_participants')
    .select('id, score')
    .eq('session_id', session.id)
    .order('score', { ascending: false })

  // Update ranks based on best score per unique player (deduplicated by email → display_name)
  if (participants) {
    const map = new Map<string, { id: string; score: number }>()
    for (const p of participants) {
      const key = (p as unknown as Record<string, unknown>)['email'] as string | null
        ? ((p as unknown as Record<string, unknown>)['email'] as string).trim().toLowerCase()
        : (p as unknown as Record<string, unknown>)['display_name'] as string
      const score = (p.score as number) ?? 0
      const existing = map.get(key)
      if (!existing || score > existing.score) {
        // Track the best-score row id for each player
        map.set(key, { id: p.id, score })
      }
    }

    // Rank the deduplicated best rows
    const ranked = Array.from(map.values()).sort((a, b) => b.score - a.score)
    for (let i = 0; i < ranked.length; i++) {
      await supabase
        .from('arena_participants')
        .update({ rank: i + 1 })
        .eq('id', ranked[i].id)
    }
  }

  // Session stays ACTIVE — only admin can end it via /end route.
  // This allows multi-attempt gameplay (up to 5 attempts per player).

  return NextResponse.json({ ok: true })
}
