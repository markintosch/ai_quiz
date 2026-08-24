// FILE: src/app/moba/signal/paper/page.tsx
// ─── Moba Signal — the brand & positioning paper ─────────────────────────────
//
// Full render of the latest APPROVED edition. Same auth gate as the
// dashboard; falls back to the labelled sample edition when the database
// holds no approved paper yet.

import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { isSignalAuthorised, signalPassword } from '@/lib/signal/auth'
import { SIGNAL_DEMO } from '@/products/moba_signal/data'
import type { Entity, PositioningPaper } from '@/products/moba_signal/types'
import { entityLabel } from '@/products/moba_signal/selectors'
import { PaperPageBody } from './view'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Moba Signal — Brand & Positioning Paper',
  robots: { index: false, follow: false },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export default async function PaperPage() {
  if (!signalPassword()) redirect('/moba/signal')
  if (!(await isSignalAuthorised())) redirect('/moba/signal/login')

  let paper: PositioningPaper | null = null
  let names: Record<string, string> = {}
  let live = false
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any
    const [{ data: row }, { data: entities }] = await Promise.all([
      db.from('moba_signal_papers').select('content')
        .eq('status', 'approved').order('edition', { ascending: false }).limit(1).maybeSingle(),
      db.from('moba_signal_entities').select('id, name, ownership_kind, parent_name'),
    ])
    if (row?.content) {
      paper = row.content as PositioningPaper
      live = true
      for (const e of (entities ?? []) as Row[]) {
        names[e.id] = e.parent_name ? `${e.name} (part of ${e.parent_name})` : e.name
      }
    }
  } catch { /* fall through to sample */ }

  if (!paper) {
    paper = SIGNAL_DEMO.paper ?? null
    names = Object.fromEntries(SIGNAL_DEMO.entities.map((e: Entity) => [e.id, entityLabel(e)]))
  }
  if (!paper) redirect('/moba/signal')

  return <PaperPageBody paper={paper} names={names} live={live} />
}
