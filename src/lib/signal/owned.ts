// FILE: src/lib/signal/owned.ts
// ─── Moba Signal — owned-channel read path ───────────────────────────────────
// Loads Moba's own Meta daily insights. Read independently of the signal
// dataset: these are real imported numbers, so they render in live mode and
// in prototype mode alike, labelled as real. Returns [] when the table does
// not exist yet or holds nothing.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { OwnedDaily } from '@/products/moba_signal/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = SupabaseClient<any, any, any>

export async function loadOwnedDaily(supabase: Db): Promise<OwnedDaily[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const out: OwnedDaily[] = []
  const page = 1000 // PostgREST caps a response at 1000 rows by default
  try {
    for (let from = 0; from < 50_000; from += page) {
      const { data, error } = await db.from('moba_signal_owned_daily')
        .select('platform, metric, day, value')
        .order('day', { ascending: true })
        .range(from, from + page - 1)
      if (error || !data) break
      for (const r of data) out.push({ platform: r.platform, metric: r.metric, day: String(r.day).slice(0, 10), value: r.value })
      if (data.length < page) break
    }
  } catch {
    return []
  }
  return out
}
