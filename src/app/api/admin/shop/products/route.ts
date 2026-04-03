export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export async function GET(_req: NextRequest) {
  if (!await isAuthorised()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('shop_products')
    .select('id, slug, brand, type, active, sort_order, price_cents, vat_rate, cover_image_url, title, tagline, description, delivery_notes, title_en, tagline_en, description_en, delivery_notes_en')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  if (!await isAuthorised()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { id: string } & Record<string, unknown>
  const { id, ...fields } = body

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Whitelist editable fields
  const allowed = [
    'title', 'tagline', 'description', 'delivery_notes',
    'title_en', 'tagline_en', 'description_en', 'delivery_notes_en',
    'price_cents', 'vat_rate', 'active', 'sort_order', 'brand', 'cover_image_url',
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in fields) update[key] = fields[key]
  }

  const supabase = createServiceClient()
  // Cast to any to work around Supabase generated-type strictness for dynamic update objects.
  // The whitelist above is the actual safety guard.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data, error } = await sb
    .from('shop_products')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
