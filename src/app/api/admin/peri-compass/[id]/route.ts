// FILE: src/app/api/admin/peri-compass/[id]/route.ts
// GET volledig assessment + responses. DELETE = AVG hard-delete.

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const [{ data: a }, { data: r }] = await Promise.all([
    supabase.from('perimenopause_compass_assessments').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('perimenopause_compass_responses').select('*').eq('assessment_id', params.id),
  ])
  if (!a) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ assessment: a, responses: r ?? [] })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const supabase = createServiceClient()
  // Responses cascaden via FK
  const { error } = await supabase
    .from('perimenopause_compass_assessments')
    .delete()
    .eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
