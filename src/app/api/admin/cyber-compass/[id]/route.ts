// FILE: src/app/api/admin/cyber-compass/[id]/route.ts
// GET full assessment + responses, DELETE = AVG hard-delete.

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const [{ data: a }, { data: r }] = await Promise.all([
    supabase.from('cyber_compass_assessments').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('cyber_compass_responses').select('*').eq('assessment_id', params.id),
  ])
  if (!a) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ assessment: a, responses: r ?? [] })
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const { error } = await supabase.from('cyber_compass_assessments').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
