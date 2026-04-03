export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { mollie } from '@/lib/mollie'
import type { SupabaseClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>

// Always use markdekock.com for shop redirects — the app runs on multiple
// domains (aiquiz.brandpwrdmedia.com etc.) but the shop lives on markdekock.com
const SHOP_BASE_URL = 'https://www.markdekock.com'

interface ShopProduct {
  id: string
  title: string
  price_cents: number
  vat_rate: number
  active: boolean
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`shop_create:${ip}`, 5, 10 * 60 * 1000) // 5 orders per 10 min per IP
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  let body: { productSlug?: string; customerName?: string; customerEmail?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { productSlug, customerName, customerEmail } = body

  // Validate fields
  if (!productSlug || !customerName || !customerEmail) {
    return NextResponse.json({ error: 'Missing required fields: productSlug, customerName, customerEmail' }, { status: 400 })
  }

  if (customerName.length > 200) {
    return NextResponse.json({ error: 'Name too long' }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(customerEmail)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const supabase = createServiceClient() as AnyClient

  try {
    // Fetch product
    const { data: product, error: productError } = await supabase
      .from('shop_products')
      .select('id, title, price_cents, vat_rate, active')
      .eq('slug', productSlug)
      .eq('active', true)
      .single() as { data: ShopProduct | null; error: unknown }

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Compute VAT
    const amountCents = product.price_cents
    const vatCents = Math.round(amountCents - amountCents / (1 + product.vat_rate))

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('shop_orders')
      .insert({
        product_id: product.id,
        customer_name: customerName,
        customer_email: customerEmail,
        amount_cents: amountCents,
        vat_cents: vatCents,
        currency: 'EUR',
        status: 'pending',
      })
      .select('id')
      .single() as { data: { id: string } | null; error: unknown }

    if (orderError || !order) {
      console.error('Order insert error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create Mollie payment
    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: (amountCents / 100).toFixed(2) },
      description: product.title,
      redirectUrl: `${SHOP_BASE_URL}/shop/success/${order.id}`,
      webhookUrl: `${SHOP_BASE_URL}/api/shop/webhook`,
      metadata: { orderId: order.id },
    })

    const checkoutUrl = payment.getCheckoutUrl()

    // Update order with Mollie data
    await supabase
      .from('shop_orders')
      .update({
        mollie_payment_id: payment.id,
        mollie_checkout_url: checkoutUrl ?? null,
      })
      .eq('id', order.id)

    return NextResponse.json({ checkoutUrl, orderId: order.id }, { status: 201 })
  } catch (err) {
    console.error('Create order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
