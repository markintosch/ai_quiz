// FILE: src/app/api/admin/blog/upload/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Admin blog image upload — multipart/form-data with field 'file'.
// Stores into Supabase Storage bucket 'blog-images' (public).
// Returns { url } pointing to the public Storage URL.
//
// Limits enforced server-side: max 8 MB, only image/* mime types.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'                 // Buffer-based ops below need Node runtime

const MAX_BYTES = 50 * 1024 * 1024               // 50 MB (voor cover-video's)
const ALLOWED_MIME = new Set([
  // Afbeeldingen
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  // Video — als cover hero of inline
  'video/mp4',         // H.264, werkt in alle browsers — beste keuze
  'video/webm',        // VP9, werkt in alle moderne browsers
  'video/quicktime',   // .mov van iPhone/Mac
  'video/mpeg',        // .mpg/.mpeg — speelt niet altijd in browsers
  'video/x-m4v',       // .m4v
])

export async function POST(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no file' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `file too large (max ${MAX_BYTES / 1024 / 1024}MB)` }, { status: 413 })
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: `unsupported type ${file.type}` }, { status: 415 })
  }

  // Build a unique filename: yyyymm/<8-hex>-<safe-name>.ext
  const now      = new Date()
  const yyyymm   = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const ext      = inferExt(file.name, file.type)
  const safeBase = sanitiseFilename(file.name).replace(/\.[^.]+$/, '').slice(0, 40) || 'image'
  const rand     = Array.from(crypto.getRandomValues(new Uint8Array(4)))
                     .map((b) => b.toString(16).padStart(2, '0'))
                     .join('')
  const path     = `${yyyymm}/${rand}-${safeBase}.${ext}`

  const supabase = createServiceClient()
  const buf      = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase
    .storage
    .from('blog-images')
    .upload(path, buf, {
      contentType: file.type,
      upsert:      false,
    })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('blog-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl, path })
}

// ── helpers ────────────────────────────────────────────────────────────────
function sanitiseFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
}

function inferExt(name: string, mime: string): string {
  const fromName = name.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName
  switch (mime) {
    case 'image/jpeg':       return 'jpg'
    case 'image/png':        return 'png'
    case 'image/webp':       return 'webp'
    case 'image/gif':        return 'gif'
    case 'image/avif':       return 'avif'
    case 'image/svg+xml':    return 'svg'
    case 'video/mp4':        return 'mp4'
    case 'video/webm':       return 'webm'
    case 'video/quicktime':  return 'mov'
    case 'video/mpeg':       return 'mpg'
    case 'video/x-m4v':      return 'm4v'
    default:                 return 'bin'
  }
}
