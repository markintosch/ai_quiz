// FILE: src/app/api/admin/summercourse/questions/route.ts
// Admin: list all questions submitted via the public form on /summercourse.

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Status = 'new' | 'answered' | 'spam'
const ALL_STATUSES: Status[] = ['new', 'answered', 'spam']

export async function GET(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (supabase as any)
    .from('summercourse_questions')
    .select('id, email, message, status, ip, user_agent, answered_at, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (status && (ALL_STATUSES as string[]).includes(status)) {
    q = q.eq('status', status)
  }

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: countRows } = await (supabase as any)
    .from('summercourse_questions')
    .select('status')

  const counts: Record<Status, number> = { new: 0, answered: 0, spam: 0 }
  for (const r of (countRows ?? []) as Array<{ status: Status }>) {
    if (r.status in counts) counts[r.status]++
  }

  return NextResponse.json({ questions: data ?? [], counts })
}
