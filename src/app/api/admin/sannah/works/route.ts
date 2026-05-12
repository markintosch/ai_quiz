export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSannahAuthorised } from '@/lib/sannah/auth'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic']
const MAX_SIZE_BYTES = 20 * 1024 * 1024  // 20 MB
const BUCKET = 'sannah-portfolio'

/** POST: upload a new image and create a sannah_works row (unpublished by default). */
export async function POST(req: NextRequest) {
  if (!(await isSannahAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Geen bestand ontvangen.' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `Bestandstype niet toegestaan (${file.type}).` }, { status: 400 })
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Bestand is te groot. Max 20 MB.' }, { status: 400 })
  }

  const ext = file.name.match(/\.[^.]+$/)?.[0] || `.${file.type.split('/')[1] ?? 'jpg'}`
  const safeName = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9-_]/g, '-').slice(0, 50) || 'werk'
  const path = `werken/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (uploadError) {
    console.error('[sannah/works upload]', uploadError)
    return NextResponse.json({ error: `Upload mislukt: ${uploadError.message}. Bucket "${BUCKET}" bestaat misschien nog niet.` }, { status: 500 })
  }

  // Determine next position
  const { data: maxRow } = await sb.from('sannah_works').select('position').order('position', { ascending: false }).limit(1).maybeSingle()
  const nextPos = ((maxRow as { position: number } | null)?.position ?? -1) + 1

  const { data: row, error: insertErr } = await sb.from('sannah_works').insert({
    image_path:   path,
    title:        formData.get('title')?.toString() || null,
    year:         formData.get('year')?.toString()  || null,
    medium:       formData.get('medium')?.toString() || null,
    description:  formData.get('description')?.toString() || null,
    position:     nextPos,
    is_published: false,
  }).select('id').single()

  if (insertErr || !row) {
    return NextResponse.json({ error: insertErr?.message ?? 'Insert mislukt.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: (row as { id: string }).id, path }, { status: 201 })
}
