// FILE: src/app/api/admin/peri-compass/route.ts
// Admin: list of all Compass assessments. Filter by stage / has-email.
// DELETE single assessment via /api/admin/peri-compass/[id].

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const stage     = searchParams.get('stage')
  const hasEmail  = searchParams.get('email')   // 'yes' | 'no' | null
  const language  = searchParams.get('language') // 'nl'|'en'|'fr'|'de' | null

  const supabase = createServiceClient()
  let q = supabase
    .from('perimenopause_compass_assessments')
    .select('id, email, display_name, stage, age_band, hrt_status, language, score_overall, band, created_at, email_sent_at')
    .order('created_at', { ascending: false })
    .limit(500)
  if (stage)              q = q.eq('stage', stage)
  if (language)           q = q.eq('language', language)
  if (hasEmail === 'yes') q = q.not('email', 'is', null)
  if (hasEmail === 'no')  q = q.is('email', null)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ assessments: data ?? [] })
}
