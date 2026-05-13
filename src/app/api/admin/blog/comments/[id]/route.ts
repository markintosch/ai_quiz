// FILE: src/app/api/admin/blog/comments/[id]/route.ts
// PATCH: update status (approve/reject/spam), DELETE: hard remove.

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const VALID_STATUS = new Set(['pending', 'approved', 'spam', 'rejected'])

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({})) as { status?: string; rejected_reason?: string }
  if (!body.status || !VALID_STATUS.has(body.status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const update: Record<string, unknown> = { status: body.status }
  if (body.status === 'approved') update.approved_at = new Date().toISOString()
  if (body.rejected_reason !== undefined) update.rejected_reason = body.rejected_reason?.slice(0, 500) ?? null

  const { error } = await supabase
    .from('blog_comments')
    .update(update as never)
    .eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('blog_comments')
    .delete()
    .eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
