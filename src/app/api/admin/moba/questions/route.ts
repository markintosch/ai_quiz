// FILE: src/app/api/admin/moba/questions/route.ts
// Admin CMS for the MOBA survey copy. Structure stays in code; only text/labels
// are editable and stored as a sparse override in moba_survey_content.

import { NextRequest, NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import {
  getMobaContentOverrides,
  resolveMobaContent,
  diffMobaContent,
  isCustomised,
  type MobaContent,
} from '@/lib/moba/content'

export const dynamic = 'force-dynamic'

// GET — resolved (merged) content for the editor.
export async function GET() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const overrides = await getMobaContentOverrides(supabase)
  return NextResponse.json({
    content: resolveMobaContent(overrides),
    customised: isCustomised(overrides),
  })
}

// PUT — save edited copy. Body: { content: MobaContent }. We diff against the
// code defaults and persist only what actually changed.
export async function PUT(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: { content?: MobaContent }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 })
  }

  const edited = body.content
  if (!edited || !Array.isArray(edited.questions) || !edited.segment) {
    return NextResponse.json({ error: 'Ongeldige inhoud' }, { status: 400 })
  }

  const overrides = diffMobaContent(edited)

  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('moba_survey_content') as any).upsert(
    { id: 1, content: overrides, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    content: resolveMobaContent(overrides),
    customised: isCustomised(overrides),
  })
}

// DELETE — reset all copy back to the code defaults.
export async function DELETE() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('moba_survey_content') as any).upsert(
    { id: 1, content: {}, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ content: resolveMobaContent(null), customised: false })
}
