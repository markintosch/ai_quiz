// FILE: src/app/api/admin/cyber-compass/route.ts
// Admin: list of all Cyber Compass assessments + counts.

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const band      = searchParams.get('band')
  const orgSize   = searchParams.get('size')
  const language  = searchParams.get('language')
  const hasEmail  = searchParams.get('email')
  const nis2      = searchParams.get('nis2')

  const supabase = createServiceClient()
  let q = supabase
    .from('cyber_compass_assessments')
    .select('id, email, display_name, organisation_name, organisation_size, sector, role, language, score_overall, score_iam, score_awareness, score_data, score_endpoint, score_backup, score_compliance, score_supply_chain, band, nis2_in_scope, iso27001_status, ai_specialist_topic, top_concern, created_at, email_sent_at')
    .order('created_at', { ascending: false })
    .limit(500)
  if (band)               q = q.eq('band', band)
  if (orgSize)            q = q.eq('organisation_size', orgSize)
  if (language)           q = q.eq('language', language)
  if (hasEmail === 'yes') q = q.not('email', 'is', null)
  if (hasEmail === 'no')  q = q.is('email', null)
  if (nis2 === 'yes')     q = q.eq('nis2_in_scope', true)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Counts
  const all = (data ?? []) as Array<{ band: string | null; nis2_in_scope: boolean | null; email: string | null }>
  const counts = {
    total:     all.length,
    exposed:   all.filter(r => r.band === 'exposed').length,
    aware:     all.filter(r => r.band === 'aware').length,
    maturing:  all.filter(r => r.band === 'maturing').length,
    resilient: all.filter(r => r.band === 'resilient').length,
    nis2:      all.filter(r => r.nis2_in_scope === true).length,
    withEmail: all.filter(r => !!r.email).length,
  }

  return NextResponse.json({ assessments: data ?? [], counts })
}
