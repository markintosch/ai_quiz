// FILE: src/app/api/admin/blog/upload-init/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/blog/upload-init
//
// Returneert een Supabase signed-upload-URL waarmee de browser RECHTSTREEKS
// naar Storage uploadt. Daarmee omzeilen we de Vercel Edge Network 4.5 MB
// body limit — files tot 50 MB (en theoretisch verder, Storage zelf staat
// 5 GB toe per object) gaan zo goed door.
//
// Body: { filename, contentType, size }
// Returns: { uploadUrl, publicUrl, path }
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_BYTES = 50 * 1024 * 1024              // 50 MB

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/mpeg', 'video/x-m4v',
])

interface InitBody {
  filename:    string
  contentType: string
  size:        number
}

export async function POST(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }

  let body: InitBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  if (!body.filename || typeof body.filename !== 'string') {
    return NextResponse.json({ error: 'filename required' }, { status: 400 })
  }
  if (typeof body.size !== 'number' || body.size <= 0) {
    return NextResponse.json({ error: 'size required' }, { status: 400 })
  }
  if (body.size > MAX_BYTES) {
    return NextResponse.json({ error: `Bestand te groot (max ${MAX_BYTES / 1024 / 1024} MB)` }, { status: 413 })
  }
  if (!ALLOWED_MIME.has(body.contentType)) {
    return NextResponse.json({ error: `Bestandstype niet toegestaan: ${body.contentType}` }, { status: 415 })
  }

  // Pad: yyyymm/<8-hex>-<safe-name>.ext
  const now      = new Date()
  const yyyymm   = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const ext      = inferExt(body.filename, body.contentType)
  const safeBase = sanitiseFilename(body.filename).replace(/\.[^.]+$/, '').slice(0, 40) || 'cover'
  const rand     = Array.from(crypto.getRandomValues(new Uint8Array(4)))
                     .map((b) => b.toString(16).padStart(2, '0'))
                     .join('')
  const path     = `${yyyymm}/${rand}-${safeBase}.${ext}`

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .storage
    .from('blog-images')
    .createSignedUploadUrl(path)

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'kon signed URL niet maken' }, { status: 500 })
  }

  const { data: pub } = supabase.storage.from('blog-images').getPublicUrl(path)

  return NextResponse.json({
    uploadUrl:  data.signedUrl,
    publicUrl:  pub.publicUrl,
    path,
    token:      data.token,
  })
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
