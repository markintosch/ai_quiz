export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/upload/route.ts
// POST — upload a logo file, saves to public/logos/, returns { url }
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { isAuthorised } from '@/lib/admin/auth'

const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

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
    return NextResponse.json({ error: 'File type not allowed. Use SVG, PNG, JPG or WebP.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large. Max 2 MB.' }, { status: 400 })
  }

  const ext = extname(file.name) || (file.type === 'image/svg+xml' ? '.svg' : '.png')
  // Sanitise filename: only alphanumeric, hyphen, underscore + original extension
  const safeName = file.name
    .replace(/\.[^.]+$/, '')                     // strip extension
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
  const filename = `${safeName}-${Date.now()}${ext}`

  const uploadDir = join(process.cwd(), 'public', 'logos')
  await mkdir(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  return NextResponse.json({ url: `/logos/${filename}` }, { status: 201 })
}
