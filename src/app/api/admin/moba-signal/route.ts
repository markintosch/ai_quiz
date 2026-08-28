// FILE: src/app/api/admin/moba-signal/route.ts
// GET: everything the admin console needs in one call — sources with health,
// the pending review queue, recent runs, pending proposals.

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  const [sources, pending, recent, runs, proposals, entities, context] = await Promise.all([
    db.from('moba_signal_sources').select('*').order('id'),
    db.from('moba_signal_items').select('*').eq('review_status', 'proposed').order('event_date', { ascending: false }).limit(100),
    db.from('moba_signal_items').select('id, title, event_date, review_status, reviewed_at, entity_id').neq('review_status', 'proposed').order('reviewed_at', { ascending: false }).limit(20),
    db.from('moba_signal_runs').select('*').order('started_at', { ascending: false }).limit(25),
    db.from('moba_signal_proposals').select('*').eq('state', 'pending').order('created_at', { ascending: false }).limit(50),
    db.from('moba_signal_entities').select('id, name, ownership_kind, parent_name').order('id'),
    db.from('moba_signal_context').select('*').order('review_by', { ascending: true }),
  ])

  const firstError = [sources, pending, recent, runs, proposals, entities, context].find(r => r.error)
  if (firstError?.error) {
    return NextResponse.json(
      { error: `${firstError.error.message} — has supabase/migration_moba_signal.sql been run?` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    sources: sources.data ?? [],
    pending: pending.data ?? [],
    recent: recent.data ?? [],
    runs: runs.data ?? [],
    proposals: proposals.data ?? [],
    entities: entities.data ?? [],
    context: context.data ?? [],
  })
}
