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
import type { ExtractMode } from '@/lib/signal/extract'

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

  // File -> text
  const bytes = new Uint8Array(await file.arrayBuffer())
  const name = file.name.toLowerCase()
  let text: string
  try {
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      const pdf = await getDocumentProxy(bytes)
      const r = await extractText(pdf, { mergePages: true })
      text = String(r.text ?? '')
    } else if (name.endsWith('.html') || name.endsWith('.htm') || file.type === 'text/html') {
      text = htmlToText(new TextDecoder().decode(bytes))
    } else {
      text = new TextDecoder().decode(bytes)
    }
  } catch (err) {
    return NextResponse.json({ error: `Could not read the file: ${err instanceof Error ? err.message : err}` }, { status: 422 })
  }
  text = text.replace(/\s+\n/g, '\n').trim()
  if (text.length < 80) {
    return NextResponse.json({ error: 'The file contains almost no extractable text (scanned PDF without a text layer?)' }, { status: 422 })
  }

  const result = await ingestDocument(db, { source, sourceUrl, filename: file.name, text, kind, note })
  return NextResponse.json({ ok: true, ...result })
}
