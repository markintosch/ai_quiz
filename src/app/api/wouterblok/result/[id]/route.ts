export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { normaliseLocale } from '@/products/wouterblok/data'

const PRODUCT_KEY = 'wouterblok'
const MIN_BENCHMARK = 3   // don't show a "peers" number until it's meaningful

// Returns a stored Growth Flywheel scan plus an aggregate benchmark, so the
// results page can render from a saved id (shareable, emailable) instead of only
// from the URL-encoded payload.
export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = createServiceClient()

  const { data: row, error } = await supabase
    .from('responses')
    .select('id, answers, scores, respondent_id')
    .eq('id', id)
    .maybeSingle()

  if (error || !row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scores = (row.scores ?? {}) as any
  const role  = scores.role
  const stage = scores.stage
  const lang  = normaliseLocale(scores.lang)

  if (!role || !stage || !row.answers) {
    return NextResponse.json({ error: 'Incomplete result' }, { status: 422 })
  }

  // Respondent first name for the greeting (no other PII exposed)
  let firstName = ''
  try {
    const { data: r } = await supabase
      .from('respondents').select('name').eq('id', row.respondent_id).maybeSingle()
    firstName = ((r?.name as string | undefined) ?? '').trim().split(/\s+/)[0] ?? ''
  } catch { /* non-fatal */ }

  // Benchmark: mean overall % across all wouterblok scans, excluding this one.
  let benchmark: { avg: number; count: number } | null = null
  try {
    const { data: all } = await supabase
      .from('responses').select('id, scores').eq('product_key', PRODUCT_KEY).limit(2000)
    if (all) {
      const others = all
        .filter(x => x.id !== row.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(x => Number((x.scores as any)?.overall))
        .filter(v => Number.isFinite(v))
      if (others.length >= MIN_BENCHMARK) {
        const avg = others.reduce((a, b) => a + b, 0) / others.length
        benchmark = { avg: Math.round(avg), count: others.length }
      }
    }
  } catch { /* product_key column may be absent on legacy DBs — skip benchmark */ }

  return NextResponse.json({ answers: row.answers, role, stage, lang, firstName, benchmark })
}
