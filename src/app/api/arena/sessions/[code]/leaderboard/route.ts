export const dynamic = 'force-dynamic'

// FILE: src/app/api/arena/sessions/[code]/leaderboard/route.ts
// GET — top 20 best scores, deduplicated by email (or display_name if no email)
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface LeaderboardEntry {
  display_name: string
  best_score: number
  attempts: number
  rank: number
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id')
    .eq('join_code', code)
    .single()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const { data: participants } = await supabase
    .from('arena_participants')
    .select('display_name, email, score')
    .eq('session_id', session.id as string)
    .order('score', { ascending: false })

  // Deduplicate: best score per unique email (fallback to display_name)
  const map = new Map<string, { display_name: string; best_score: number; attempts: number }>()
  for (const p of participants ?? []) {
    const key = (p.email as string | null)?.trim().toLowerCase() || (p.display_name as string)
    const score = (p.score as number) ?? 0
    const existing = map.get(key)
    if (!existing) {
      map.set(key, { display_name: p.display_name as string, best_score: score, attempts: 1 })
    } else {
      existing.best_score = Math.max(existing.best_score, score)
      existing.attempts++
    }
  }

  const leaderboard: LeaderboardEntry[] = Array.from(map.values())
    .sort((a, b) => b.best_score - a.best_score)
    .slice(0, 20)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))

  return NextResponse.json({ leaderboard, total: map.size })
}
