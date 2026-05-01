export const dynamic = 'force-dynamic'

// FILE: src/app/api/sannahremco/upload/route.ts
// POST — accepts a single file upload from the briefing forms and stores it
// in the private `sannahremco-uploads` bucket. Returns the storage path
// (NOT a public URL — bucket is private; admin uses signed URLs).

import { NextRequest, NextResponse } from 'next/server'
import { extname } from 'path'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const ALLOWED_TYPES = [
  'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/heic',
  'application/pdf',
]
const MAX_SIZE_BYTES = 15 * 1024 * 1024 // 15 MB
const BUCKET = 'sannahremco-uploads'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`sannahremco-upload:${ip}`, 40, 10 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Te veel uploads in korte tijd. Even wachten en opnieuw proberen.' },
      { status: 429 }
    )
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const briefingType = (formData.get('briefing_type') as string | null) ?? 'unknown'
  const folder = briefingType === 'sannah_portfolio' ? 'sannah' :
                 briefingType === 'remco_presence'  ? 'remco'  : 'misc'

  if (!file) return NextResponse.json({ error: 'Geen bestand ontvangen.' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Bestandstype niet toegestaan (${file.type}). Gebruik PNG, JPG, WebP, GIF, HEIC, SVG of PDF.` },
      { status: 400 }
    )
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Bestand is te groot. Max 15 MB.' }, { status: 400 })
  }

  const ext = extname(file.name) || `.${(file.type.split('/')[1] ?? 'bin')}`
  const safeName = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'upload'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    console.error('[sannahremco/upload] storage', error)
    return NextResponse.json(
      { error: `Upload mislukt: ${error.message}. Bucket "${BUCKET}" bestaat misschien nog niet.` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    path,
    filename: file.name,
    size: file.size,
    mime: file.type,
  }, { status: 201 })
}
