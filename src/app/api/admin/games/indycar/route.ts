export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

interface LapRow {
  id:             string
  name:           string | null
  email:          string | null
  lap_time:       string
  total_ms:       number
  correct_count:  number | null
  paid_attempt:   boolean | null
  created_at:     string
}

export async function GET(_req: NextRequest) {
  if (!await isAuthorised()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Times leaderboard (top 200 by lap time)
  const { data: lapRows, error: lapErr } = await supabase
    .from('indycar_times')
    .select('id, name, email, lap_time, total_ms, correct_count, paid_attempt, created_at')
    .order('total_ms', { ascending: true })
    .limit(200)

  if (lapErr) {
    console.warn('[admin/games/indycar] times error:', lapErr.message)
  }

  const rows: LapRow[] = (lapRows ?? []) as LapRow[]

  // Aggregates — total laps, paid laps, distinct emails
  const totalLaps    = rows.length
  const paidLaps     = rows.filter(r => r.paid_attempt).length
  const uniquePlayers = new Set(rows.map(r => (r.email ?? '').toLowerCase()).filter(Boolean)).size

  // Active racers right now — count of presence rows in last 90 s
  const cutoff = new Date(Date.now() - 90 * 1000).toISOString()
  const { count: activeCount } = await supabase
    .from('indycar_presence')
    .select('id', { count: 'exact', head: true })
    .gte('last_seen', cutoff)

  // Total revenue from indycar-5-laps shop product (count of paid orders × €2)
  const { data: paidOrders, count: paidOrderCount } = await supabase
    .from('shop_orders')
    .select('id, amount_cents, customer_email, created_at, claimed_at, shop_products!inner(slug)', { count: 'exact' })
    .eq('status', 'paid')
    .eq('shop_products.slug', 'indycar-5-laps')
    .order('created_at', { ascending: false })
    .limit(50)

  const revenueCents = (paidOrders ?? []).reduce((s, o) => s + ((o as { amount_cents?: number }).amount_cents ?? 0), 0)

  return NextResponse.json({
    rows,
    aggregates: {
      totalLaps,
      paidLaps,
      uniquePlayers,
      activeCount: activeCount ?? 0,
      paidOrderCount: paidOrderCount ?? 0,
      revenueCents,
    },
    recentOrders: (paidOrders ?? []).map(o => {
      const row = o as { id: string; amount_cents: number; customer_email: string; created_at: string; claimed_at: string | null }
      return {
        id:        row.id,
        amount:    row.amount_cents,
        email:     row.customer_email,
        createdAt: row.created_at,
        claimedAt: row.claimed_at,
      }
    }),
  })
}

export async function DELETE(req: NextRequest) {
  if (!await isAuthorised()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json() as { id: string }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase.from('indycar_times').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
