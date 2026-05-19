// FILE: src/app/api/cycle/insights/seen/route.ts

import { NextResponse } from 'next/server'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: Request) {
  const user = await requireCycleUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  if (!rateLimit(`cycle-insights-seen:${user.id}`, 30, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as { rule_key?: string }
  const ruleKey = body.rule_key
  if (!ruleKey) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })

  const supabase = await createClient()
  await supabase.from('cycle_insights_seen').insert({
    user_id:  user.id,
    rule_key: ruleKey,
  })
  return NextResponse.json({ ok: true })
}
