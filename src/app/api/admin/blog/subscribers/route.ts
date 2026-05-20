// FILE: src/app/api/admin/blog/subscribers/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Admin: list blog newsletter subscribers (admin only).
// GET    /api/admin/blog/subscribers    — list (filterable)
// DELETE /api/admin/blog/subscribers?id=...  — hard-delete (AVG verzoek)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')         // confirmed | pending | unsubscribed | all

  const supabase = createServiceClient()
  let q = supabase
    .from('blog_subscribers')
    .select('id, email, locale, confirmed, confirmed_at, unsubscribed_at, source_path, source_post_id, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (status === 'confirmed') {
    q = q.eq('confirmed', true).is('unsubscribed_at', null)
  } else if (status === 'pending') {
    q = q.eq('confirmed', false).is('unsubscribed_at', null)
  } else if (status === 'unsubscribed') {
    q = q.not('unsubscribed_at', 'is', null)
  }

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const all = (data ?? []) as Array<{
    confirmed: boolean; unsubscribed_at: string | null
  }>
  const counts = {
    confirmed:    all.filter(r => r.confirmed && !r.unsubscribed_at).length,
    pending:      all.filter(r => !r.confirmed && !r.unsubscribed_at).length,
    unsubscribed: all.filter(r => !!r.unsubscribed_at).length,
    total:        all.length,
  }
  return NextResponse.json({ subscribers: data ?? [], counts })
}

export async function DELETE(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase.from('blog_subscribers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
