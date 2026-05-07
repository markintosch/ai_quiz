export const dynamic = 'force-dynamic'
export const maxDuration = 300

// FILE: src/app/api/admin/atelier/sources/[id]/crawl/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Admin-only crawl trigger. POSTs from the "Crawl now" button next to a
// source row in /admin/atelier/sources. Fires the crawler in the background
// so the UI returns instantly; the admin page polls last_crawled_at to
// show progress.

import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { isAuthorised } from '@/lib/admin/auth'
import { crawlSource } from '@/lib/atelier/crawl/runner'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id: sourceId } = await params

  waitUntil(
    crawlSource(sourceId).catch(err => {
      console.error('[admin/atelier/sources/crawl]', sourceId, err)
    })
  )

  return NextResponse.json({ status: 'crawling', sourceId }, { status: 202 })
}
