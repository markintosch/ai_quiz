export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/upload/route.ts
// POST — upload a logo file. Writes to the Supabase Storage 'logos'
// bucket (public read), returns the resolved public URL.
//
// Previous version wrote to public/logos/ on the filesystem — that
// works locally but Vercel's runtime filesystem is read-only, so
// uploads silently failed in production.

import { NextRequest, NextResponse } from 'next/server'
import { extname } from 'path'
import { createClient } from '@supabase/supabase-js'
import { isAuthorised } from '@/lib/admin/auth'

const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const BUCKET = 'logos'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'File type not allowed. Use SVG, PNG, JPG, WebP or GIF.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large. Max 2 MB.' }, { status: 400 })
  }

  const ext = extname(file.name) || (file.type === 'image/svg+xml' ? '.svg' : '.png')
  const safeName = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'logo'
  const filename = `${safeName}-${Date.now()}${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    console.error('[admin/upload] supabase storage', uploadError)
    return NextResponse.json({
      error: `Upload failed: ${uploadError.message}. Make sure the '${BUCKET}' bucket exists in Supabase Storage with public read access.`,
    }, { status: 500 })
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return NextResponse.json({ url: pub.publicUrl }, { status: 201 })
}
