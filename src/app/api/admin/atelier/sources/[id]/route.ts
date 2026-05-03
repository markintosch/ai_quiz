export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAuthorised } from '@/lib/admin/auth'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface PatchBody { active?: boolean; notes?: string | null }

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const { id } = await params
  let body: PatchBody
  try {
    body = (await req.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 })
  }
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.active !== undefined) updates.active = body.active
  if (body.notes !== undefined)  updates.notes  = body.notes
  const { error } = await sb.from('atelier_sources').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const { id } = await params
  // Don't allow deleting system-seeded sources — toggle active instead
  const { data: row } = await sb.from('atelier_sources').select('added_by').eq('id', id).single() as { data: { added_by: string } | null }
  if (row?.added_by === 'system') {
    return NextResponse.json({ error: 'System sources kun je niet verwijderen — zet ze op inactief.' }, { status: 400 })
  }
  const { error } = await sb.from('atelier_sources').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
