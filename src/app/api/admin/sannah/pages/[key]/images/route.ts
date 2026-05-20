export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/sannah/pages/[key]/images/route.ts
// POST   — upload een foto voor een pagina (Over / CV / Contact / Homepage)
// DELETE — verwijder één foto uit de lijst (path query param)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSannahAuthorised } from '@/lib/sannah/auth'
import type { SannahPageImage } from '@/lib/sannah/types'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const BUCKET = 'sannah-portfolio'
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic']
const MAX_SIZE_BYTES = 20 * 1024 * 1024
const MAX_IMAGES_PER_PAGE = 6

const VALID_KEYS = ['homepage', 'over_mij', 'contact', 'cv'] as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isSannahAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { key } = await params
  if (!VALID_KEYS.includes(key as typeof VALID_KEYS[number])) {
    return NextResponse.json({ error: `Onbekende page_key: ${key}` }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const alt  = formData.get('alt')?.toString() || ''
  if (!file) return NextResponse.json({ error: 'Geen bestand ontvangen.' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `Bestandstype niet toegestaan (${file.type}).` }, { status: 400 })
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Bestand is te groot. Max 20 MB.' }, { status: 400 })
  }

  // Get current images list
  const { data: row } = await sb.from('sannah_pages').select('images').eq('page_key', key).single() as { data: { images: SannahPageImage[] } | null }
  const currentImages = (row?.images ?? [])
  if (currentImages.length >= MAX_IMAGES_PER_PAGE) {
    return NextResponse.json({ error: `Maximaal ${MAX_IMAGES_PER_PAGE} foto's per pagina.` }, { status: 400 })
  }

  const ext = file.name.match(/\.[^.]+$/)?.[0] || `.${file.type.split('/')[1] ?? 'jpg'}`
  const safeName = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9-_]/g, '-').slice(0, 50) || 'foto'
  const path = `pages/${key}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (uploadError) {
    console.error('[sannah/pages/images upload]', uploadError)
    return NextResponse.json({ error: `Upload mislukt: ${uploadError.message}` }, { status: 500 })
  }

  const newImages: SannahPageImage[] = [...currentImages, { path, alt }]
  const { error: updateErr } = await sb.from('sannah_pages')
    .update({ images: newImages, updated_at: new Date().toISOString() })
    .eq('page_key', key)
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, path, images: newImages }, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isSannahAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { key } = await params
  const path = req.nextUrl.searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'path query param verplicht.' }, { status: 400 })

  // Read current list, remove the matching image
  const { data: row } = await sb.from('sannah_pages').select('images').eq('page_key', key).single() as { data: { images: SannahPageImage[] } | null }
  const currentImages = row?.images ?? []
  const newImages = currentImages.filter(img => img.path !== path)

  if (newImages.length === currentImages.length) {
    return NextResponse.json({ error: 'Foto niet gevonden in deze pagina.' }, { status: 404 })
  }

  // Delete from storage
  await sb.storage.from(BUCKET).remove([path])

  // Update list
  const { error: updateErr } = await sb.from('sannah_pages')
    .update({ images: newImages, updated_at: new Date().toISOString() })
    .eq('page_key', key)
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, images: newImages })
}
