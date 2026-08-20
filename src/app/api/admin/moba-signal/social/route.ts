// FILE: src/app/api/admin/moba-signal/social/route.ts
// POST multipart: the LinkedIn competitor analytics export (.xlsx/.xls).
// ?dryRun=1 parses and reports without writing. Unknown pages are added to
// the mapping table with a best-guess entity (marked for verification);
// excluded namesakes stay excluded across every upload.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'
import { parseSocialWorkbook } from '@/lib/signal/social'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

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
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file received' }, { status: 400 })
  const dryRun = req.nextUrl.searchParams.get('dryRun') === '1'

  let parsed
  try {
    parsed = parseSocialWorkbook(new Uint8Array(await file.arrayBuffer()))
  } catch (err) {
    return NextResponse.json({ error: `Could not read the workbook: ${err instanceof Error ? err.message : err}` }, { status: 422 })
  }
  if (parsed.rows.length === 0) {
    return NextResponse.json({
      error: 'No page rows recognised in this workbook.',
      sheetsSkipped: parsed.sheetsSkipped,
    }, { status: 422 })
  }
  if (dryRun) return NextResponse.json({ ok: true, dryRun: true, ...parsed })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any
  const { data: pages } = await db.from('moba_signal_social_pages').select('*')
  const { data: entities } = await db.from('moba_signal_entities').select('id, name, aliases, ownership_kind')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageMap = new Map<string, any>((pages ?? []).map((p: any) => [p.page_name, p]))

  const newPages: string[] = []
  const excluded: string[] = []
  const unmapped: string[] = []
  let statsUpserted = 0

  for (const row of parsed.rows) {
    let page = pageMap.get(row.pageName)
    if (!page) {
      // Best-guess entity by name/alias containment; a wrong guess is visible
      // in the mapping table and fixable there once, for all future uploads.
      const n = norm(row.pageName)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hit = (entities ?? []).find((e: any) =>
        n.includes(norm(e.name)) || (e.aliases ?? []).some((a: string) => n.includes(norm(a))))
      page = { page_name: row.pageName, entity_id: hit?.id ?? null, include: true }
      await db.from('moba_signal_social_pages').insert({
        ...page,
        note: hit ? `Auto-mapped to ${hit.id} on upload — verify.` : 'Auto-added on upload — map to an entity.',
      })
      pageMap.set(row.pageName, page)
      newPages.push(`${row.pageName}${hit ? ` → ${hit.id} (guess)` : ' (unmapped)'}`)
    }
    if (page.include === false) { excluded.push(row.pageName); continue }
    if (!page.entity_id) unmapped.push(row.pageName)

    const { error } = await db.from('moba_signal_social_stats').upsert({
      page_name: row.pageName,
      period_start: row.periodStart,
      period_end: row.periodEnd,
      followers: row.followers,
      new_followers: row.newFollowers,
      engagements: row.engagements,
      posts: row.posts,
      filename: file.name,
      uploaded_at: new Date().toISOString(),
    }, { onConflict: 'page_name,period_start,period_end' })
    if (!error) statsUpserted++
  }

  return NextResponse.json({
    ok: true,
    rowsParsed: parsed.rows.length,
    statsUpserted,
    sheetsParsed: parsed.sheetsParsed,
    sheetsSkipped: parsed.sheetsSkipped,
    newPages,
    excluded: [...new Set(excluded)],
    unmapped: [...new Set(unmapped)],
  })
}
