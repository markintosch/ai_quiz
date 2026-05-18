export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import {
  COOKIE_NAME,
  creditCookieOptions,
  decodeCreditCookie,
  encodeCreditCookie,
} from '@/lib/indycar/credits'
import { PAID_BUNDLE_ATTEMPTS, PAID_PRODUCT_SLUG } from '@/products/indycar/data'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>

interface OrderRow {
  id:           string
  status:       string
  product_id:   string
  claimed_at:   string | null
}
interface ProductRow {
  slug: string
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`ic_claim:${ip}`, 10, 10 * 60 * 1000)
  if (!rl.allowed) return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })

  let body: { orderId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }
  const orderId = body.orderId
  if (!orderId || typeof orderId !== 'string') {
    return NextResponse.json({ error: 'missing_orderId' }, { status: 400 })
  }

  const supabase = createServiceClient() as AnyClient

  try {
    const { data: order, error: orderErr } = await supabase
      .from('shop_orders')
      .select('id, status, product_id, claimed_at')
      .eq('id', orderId)
      .single() as { data: OrderRow | null; error: unknown }

    if (orderErr || !order) {
      return NextResponse.json({ error: 'order_not_found' }, { status: 404 })
    }
    if (order.status === 'pending') {
      return NextResponse.json({ error: 'not_paid_yet' }, { status: 202 })
    }
    if (order.status !== 'paid') {
      return NextResponse.json({ error: `order_${order.status}` }, { status: 400 })
    }

    const { data: product } = await supabase
      .from('shop_products')
      .select('slug')
      .eq('id', order.product_id)
      .single() as { data: ProductRow | null; error: unknown }

    if (!product || product.slug !== PAID_PRODUCT_SLUG) {
      return NextResponse.json({ error: 'wrong_product' }, { status: 400 })
    }

    // Single-use claim: only the first request flips claimed_at from NULL → now()
    if (order.claimed_at) {
      // Already claimed elsewhere — refuse to re-issue (would let someone share an order ID)
      const store   = await cookies()
      const existing = decodeCreditCookie(store.get(COOKIE_NAME)?.value)
      return NextResponse.json({ error: 'already_claimed', credits: existing }, { status: 409 })
    }

    const nowIso = new Date().toISOString()
    const { error: updErr, count } = await supabase
      .from('shop_orders')
      .update({ claimed_at: nowIso }, { count: 'exact' })
      .eq('id', orderId)
      .is('claimed_at', null)

    if (updErr) {
      console.error('[indycar/claim] update error:', updErr)
      return NextResponse.json({ error: 'claim_failed' }, { status: 500 })
    }
    if (count === 0) {
      // race: someone else claimed in the meantime
      return NextResponse.json({ error: 'already_claimed' }, { status: 409 })
    }

    // Add the bundle credits on top of any existing balance for this device.
    const store    = await cookies()
    const existing = decodeCreditCookie(store.get(COOKIE_NAME)?.value)
    const total    = existing + PAID_BUNDLE_ATTEMPTS

    const res = NextResponse.json({ ok: true, credits: total, added: PAID_BUNDLE_ATTEMPTS })
    res.cookies.set(COOKIE_NAME, encodeCreditCookie(total), creditCookieOptions())
    return res
  } catch (err) {
    console.error('[indycar/claim] error:', err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
