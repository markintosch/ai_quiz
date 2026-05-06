export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAuthorised } from '@/lib/admin/auth'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
const BUCKET = 'sannah-portfolio'

interface PatchBody {
  title?:        string | null
  year?:         string | null
  medium?:       string | null
  description?:  string | null
  is_published?: boolean
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  let body: PatchBody
  try { body = (await req.json()) as PatchBody } catch { return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 }) }
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of ['title', 'year', 'medium', 'description', 'is_published'] as const) {
    if (body[k] !== undefined) updates[k] = body[k]
  }
  const { error } = await sb.from('sannah_works').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  // Get image path first to delete from storage
  const { data: row } = await sb.from('sannah_works').select('image_path').eq('id', id).maybeSingle() as { data: { image_path: string } | null }
  if (row?.image_path) {
    await sb.storage.from(BUCKET).remove([row.image_path])
  }
  const { error } = await sb.from('sannah_works').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
