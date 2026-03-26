export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select('id, slug, brand, title, tagline, description, price_cents, vat_rate, type, cover_image_url, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Products fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('Products route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
