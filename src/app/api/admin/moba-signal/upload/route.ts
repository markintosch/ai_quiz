// FILE: src/app/api/admin/moba-signal/upload/route.ts
// POST multipart: file + sourceId + sourceUrl + kind (+ note).
// Accepts PDF (text extracted via unpdf), HTML (tags stripped) and plain
// text/markdown. Everything lands as proposed items in the review queue.

import { NextRequest, NextResponse } from 'next/server'
import { extractText, getDocumentProxy } from 'unpdf'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'
import { htmlToText } from '@/lib/signal/crawl'
import { ingestDocument } from '@/lib/signal/ingest'
import { ocrImageBytes, ocrPdfBytes } from '@/lib/signal/ocr'
import type { ExtractMode } from '@/lib/signal/extract'

const IMAGE_RE = /\.(png|jpe?g|webp)$/i
const isImage = (name: string, type: string) => IMAGE_RE.test(name) || /^image\//.test(type)
const MIN_TEXT = 80

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const MAX_BYTES = 4_000_000 // stay under the serverless request limit

export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 })
  }

  const file = form.get('file')
  const sourceId = String(form.get('sourceId') ?? '')
  const sourceUrl = String(form.get('sourceUrl') ?? '').trim()
  const kindRaw = String(form.get('kind') ?? 'news')
  const note = String(form.get('note') ?? '').trim() || undefined

  if (!(file instanceof File)) return NextResponse.json({ error: 'No file received' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 4 MB). Split it or save fewer pages.' }, { status: 400 })
  if (!sourceId) return NextResponse.json({ error: 'Pick the source this document represents' }, { status: 400 })
  if (!/^https?:\/\//.test(sourceUrl)) {
    return NextResponse.json({ error: 'The original page URL is required — provenance is never optional' }, { status: 400 })
  }
  const kind: ExtractMode = kindRaw === 'research' || kindRaw === 'notes' ? kindRaw : 'news'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any
  const { data: source } = await db.from('moba_signal_sources').select('*').eq('id', sourceId).maybeSingle()
  if (!source) return NextResponse.json({ error: `Unknown source: ${sourceId}` }, { status: 404 })

  // File -> text. PDFs and images with no text layer fall back to vision OCR,
  // so browser "full page capture" screenshots read the same as saved pages.
  const bytes = new Uint8Array(await file.arrayBuffer())
  const name = file.name.toLowerCase()
  let text = ''
  let ocr: string | null = null
  try {
    if (isImage(name, file.type)) {
      text = (await ocrImageBytes(bytes)).trim()
      ocr = 'image OCR'
    } else if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      const pdf = await getDocumentProxy(bytes)
      const r = await extractText(pdf, { mergePages: true })
      text = String(r.text ?? '').replace(/\s+\n/g, '\n').trim()
      if (text.length < MIN_TEXT) {
        // No usable text layer: a screenshot PDF. Read the pixels instead.
        const res = await ocrPdfBytes(bytes)
        if (res.text.trim().length >= MIN_TEXT) { text = res.text.trim(); ocr = `PDF OCR, ${res.pagesOcr} page(s)` }
      }
    } else if (name.endsWith('.html') || name.endsWith('.htm') || file.type === 'text/html') {
      text = htmlToText(new TextDecoder().decode(bytes))
    } else {
      text = new TextDecoder().decode(bytes)
    }
  } catch (err) {
    return NextResponse.json({ error: `Could not read the file: ${err instanceof Error ? err.message : err}` }, { status: 422 })
  }
  text = text.replace(/\s+\n/g, '\n').trim()
  if (text.length < MIN_TEXT) {
    return NextResponse.json({
      error: isImage(name, file.type)
        ? 'OCR could not read enough text from this image. Check it is a legible screenshot of the page.'
        : 'The file contains almost no extractable text, and OCR of it read nothing usable. If this is a screenshot PDF, try uploading the image (PNG/JPG) directly.',
    }, { status: 422 })
  }

  const result = await ingestDocument(db, { source, sourceUrl, filename: file.name, text, kind, note })
  return NextResponse.json({ ok: true, ocr, ...result })
}
