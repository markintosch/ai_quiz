import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/oncology/sales
// Returns { [marketId]: { [quarter]: revenue } }
export async function GET() {
  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('oncology_sales')
    .select('market_id, quarter, revenue')
    .order('market_id')
    .order('quarter')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Reshape flat rows → nested map
  const result: Record<string, Record<string, number>> = {}
  for (const row of data ?? []) {
    if (!result[row.market_id]) result[row.market_id] = {}
    result[row.market_id][row.quarter] = row.revenue
  }

  return NextResponse.json(result)
}

// PUT /api/oncology/sales
// Body: { market_id: string, quarter: string, revenue: number }
export async function PUT(req: Request) {
  const body = await req.json() as { market_id: string; quarter: string; revenue: number }

  if (!body.market_id || !body.quarter || typeof body.revenue !== 'number') {
    return NextResponse.json({ error: 'market_id, quarter, revenue required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('oncology_sales')
    .upsert({
      market_id:  body.market_id,
      quarter:    body.quarter,
      revenue:    body.revenue,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'market_id,quarter' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
