export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/atelier/icp/[id]/route.ts
// PATCH — update an ICP's validation_status, note, or supersede link.
// Admin layout middleware already enforces auth.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAuthorised } from '@/lib/admin/auth'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const VALID_STATUSES = ['pending', 'validated', 'dismissed', 'superseded'] as const

interface PatchBody {
  validation_status?: typeof VALID_STATUSES[number]
  validation_note?:   string | null
  superseded_by_id?:  string | null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const updates: Record<string, unknown> = {}

  if (body.validation_status !== undefined) {
    if (!VALID_STATUSES.includes(body.validation_status)) {
      return NextResponse.json({ error: `validation_status moet een van: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
    }
    updates.validation_status = body.validation_status
    if (body.validation_status === 'validated') {
      updates.validated_at = new Date().toISOString()
    }
  }

  if (body.validation_note !== undefined) {
    updates.validation_note = body.validation_note
  }

  if (body.superseded_by_id !== undefined) {
    updates.superseded_by_id = body.superseded_by_id
    // If we're pointing this ICP at a successor, mark it superseded too
    if (body.superseded_by_id) updates.validation_status = 'superseded'
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Geen velden om te updaten.' }, { status: 400 })
  }

  const { error } = await sb
    .from('atelier_icp_profiles')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('[admin/atelier/icp/PATCH]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
