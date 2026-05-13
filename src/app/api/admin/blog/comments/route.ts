// FILE: src/app/api/admin/blog/comments/route.ts
// Admin: lijst alle comments met filter (pending|approved|spam|rejected|all).

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')   // 'pending'|'approved'|'spam'|'rejected'|null

  const supabase = createServiceClient()
  let q = supabase
    .from('blog_comments')
    .select(`
      id, post_id, author_name, author_email, body, status, created_at, source_ip,
      blog_posts ( slug, locale, title )
    `)
    .order('created_at', { ascending: false })
    .limit(200)
  if (status && ['pending','approved','spam','rejected'].includes(status)) {
    q = q.eq('status', status)
  }

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Counts per status (kleine extra query)
  const { data: countRows } = await supabase
    .from('blog_comments')
    .select('status')
  const counts = { pending: 0, approved: 0, spam: 0, rejected: 0 }
  for (const r of (countRows ?? []) as Array<{ status: keyof typeof counts }>) {
    if (r.status in counts) counts[r.status]++
  }

  return NextResponse.json({ comments: data ?? [], counts })
}
