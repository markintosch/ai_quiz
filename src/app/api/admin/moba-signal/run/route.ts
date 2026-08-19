// FILE: src/app/api/admin/moba-signal/run/route.ts
// POST { sourceId } — run the Collector against one source, synchronously.
// Kept to one source per call so the request fits comfortably inside the
// serverless window; the admin console fans out per source.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'
import { runSource } from '@/lib/signal/runner'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  let sourceId: string
  try {
    const body = await req.json()
    sourceId = String(body.sourceId ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!sourceId) return NextResponse.json({ error: 'sourceId required' }, { status: 400 })

  const result = await runSource(createServiceClient(), sourceId)
  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
