export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>

interface ShopOrder {
  status: string
  customer_name: string
  product_id: string
}

interface ShopProduct {
  title: string
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  const supabase = createServiceClient() as AnyClient

  try {
    const { data: order, error } = await supabase
      .from('shop_orders')
      .select('status, customer_name, product_id')
      .eq('id', orderId)
      .single() as { data: ShopOrder | null; error: unknown }

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { data: product } = await supabase
      .from('shop_products')
      .select('title')
      .eq('id', order.product_id)
      .single() as { data: ShopProduct | null; error: unknown }

    // Note: customerName intentionally excluded — orderId is in the redirect URL
    // which can appear in referrer headers and analytics. Returning PII here is unsafe.
    return NextResponse.json({
      status: order.status,
      productTitle: product?.title ?? '',
    })
  } catch (err) {
    console.error('Order status error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
