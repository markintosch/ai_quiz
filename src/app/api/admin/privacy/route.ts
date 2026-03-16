export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

// Respondents who have not given GDPR consent and are older than 30 days
const UNCONSENTED_DAYS = 30
// Respondents who have given consent but are older than this many days (GDPR retention)
const RETENTION_DAYS = 730  // 2 years

export async function GET() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const cutoffUnconsented = new Date(Date.now() - UNCONSENTED_DAYS * 86400000).toISOString()
  const cutoffRetention = new Date(Date.now() - RETENTION_DAYS * 86400000).toISOString()

  const { count: unconsentedCount } = await supabase
    .from('respondents')
    .select('*', { count: 'exact', head: true })
    .eq('gdpr_consent', false)
    .lt('created_at', cutoffUnconsented)

  const { count: retentionCount } = await supabase
    .from('respondents')
    .select('*', { count: 'exact', head: true })
    .eq('gdpr_consent', true)
    .lt('created_at', cutoffRetention)

  return NextResponse.json({
    unconsented: { count: unconsentedCount ?? 0, cutoffDays: UNCONSENTED_DAYS },
    retention: { count: retentionCount ?? 0, cutoffDays: RETENTION_DAYS },
  })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const mode = searchParams.get('mode') // 'unconsented' | 'retention'

  const supabase = createServiceClient()

  let query = supabase.from('respondents').select('id')

  if (mode === 'unconsented') {
    const cutoff = new Date(Date.now() - UNCONSENTED_DAYS * 86400000).toISOString()
    query = query.eq('gdpr_consent', false).lt('created_at', cutoff) as typeof query
  } else if (mode === 'retention') {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 86400000).toISOString()
    query = query.eq('gdpr_consent', true).lt('created_at', cutoff) as typeof query
  } else {
    return NextResponse.json({ error: 'Invalid mode. Use ?mode=unconsented or ?mode=retention' }, { status: 400 })
  }

  const { data: toDelete } = await query
  if (!toDelete || toDelete.length === 0) {
    return NextResponse.json({ deleted: 0 })
  }

  const ids = toDelete.map((r: { id: string }) => r.id)

  await supabase.from('sessions').delete().in('respondent_id', ids)
  await supabase.from('responses').delete().in('respondent_id', ids)
  const { error } = await supabase.from('respondents').delete().in('id', ids)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: ids.length })
}
