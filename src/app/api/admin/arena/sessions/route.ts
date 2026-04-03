export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export async function GET(_req: NextRequest) {
  if (!await isAuthorised()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: sessions } = await supabase
    .from('arena_sessions')
    .select('id, join_code, host_name, status, question_count, time_per_q, started_at, created_at, company_id')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: companies } = await supabase.from('companies').select('id, name')
  const companyMap = new Map((companies ?? []).map((c: { id: string; name: string }) => [c.id, c.name]))

  const { data: participants } = await supabase.from('arena_participants').select('session_id')
  const countMap = new Map<string, number>()
  for (const p of participants ?? []) {
    if (p.session_id) countMap.set(p.session_id, (countMap.get(p.session_id) ?? 0) + 1)
  }

  const enriched = (sessions ?? []).map((s: { id: string; company_id?: string }) => ({
    ...s,
    company_name: s.company_id ? (companyMap.get(s.company_id) ?? null) : null,
    participant_count: countMap.get(s.id) ?? 0,
  }))

  return NextResponse.json(enriched)
}
