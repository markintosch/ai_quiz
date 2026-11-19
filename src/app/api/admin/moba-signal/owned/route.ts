// FILE: src/app/api/admin/moba-signal/owned/route.ts
// POST multipart: one or more Meta Business Suite CSV exports for Moba's own
// pages, any metric, one or several per file. Field "platform" (facebook | instagram | meta)
// applies to files whose title does not name the platform, such as
// "Weergaven". ?dryRun=1 parses and reports without writing. Re-uploading an
// overlapping period updates the stored values.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'
import { parseMetaExport, type MetaPlatform } from '@/lib/signal/meta'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const PLATFORMS: MetaPlatform[] = ['facebook', 'instagram', 'meta']

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
  const files = form.getAll('file').filter((f): f is File => f instanceof File)
  if (files.length === 0) return NextResponse.json({ error: 'No file received' }, { status: 400 })
  const p = String(form.get('platform') ?? 'meta') as MetaPlatform
  const fallback: MetaPlatform = PLATFORMS.includes(p) ? p : 'meta'
  const dryRun = req.nextUrl.searchParams.get('dryRun') === '1'

  const results: Array<{ file: string; title?: string; platform?: string; metric?: string; known?: boolean; days?: number; from?: string; to?: string; error?: string }> = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = dryRun ? null : (createServiceClient() as any)

  for (const file of files) {
    try {
      const parsed = parseMetaExport(new Uint8Array(await file.arrayBuffer()), fallback)
      if (db) {
        const titleOf = new Map(parsed.sections.map(s => [s.metric, s.title]))
        const now = new Date().toISOString()
        const payload = parsed.rows.map(r => ({ ...r, source_title: titleOf.get(r.metric) ?? null, filename: file.name, uploaded_at: now }))
        for (let i = 0; i < payload.length; i += 500) {
          const { error } = await db.from('moba_signal_owned_daily').upsert(payload.slice(i, i + 500), { onConflict: 'platform,metric,day' })
          if (error) throw new Error(error.message)
        }
      }
      for (const s of parsed.sections) {
        const days = [...new Set(s.rows.map(r => r.day))].sort()
        results.push({ file: file.name, title: s.title, platform: s.platforms.join('+'), metric: s.metric, known: s.known, days: days.length, from: days[0], to: days[days.length - 1] })
      }
    } catch (err) {
      results.push({ file: file.name, error: err instanceof Error ? err.message : String(err) })
    }
  }

  const failed = results.filter(r => r.error)
  return NextResponse.json({ ok: failed.length === 0, dryRun, results }, { status: failed.length === files.length ? 422 : 200 })
}
