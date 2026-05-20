export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSannahAuthorised } from '@/lib/sannah/auth'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const VALID_KEYS = ['homepage', 'over_mij', 'contact', 'cv'] as const

interface PatchBody {
  draft_body_nl?: string
  draft_body_en?: string
  /** If true, copy draft → body (publish). */
  publish?: boolean
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isSannahAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { key } = await params
  if (!VALID_KEYS.includes(key as typeof VALID_KEYS[number])) {
    return NextResponse.json({ error: `Onbekende page_key: ${key}` }, { status: 400 })
  }

  let body: PatchBody
  try { body = (await req.json()) as PatchBody } catch { return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 }) }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.draft_body_nl !== undefined) updates.draft_body_nl = body.draft_body_nl
  if (body.draft_body_en !== undefined) updates.draft_body_en = body.draft_body_en

  if (body.publish) {
    // Promote drafts to published bodies. Read current drafts first.
    const { data: row } = await sb.from('sannah_pages').select('draft_body_nl, draft_body_en').eq('page_key', key).single() as { data: { draft_body_nl: string | null; draft_body_en: string | null } | null }
    updates.body_nl = (body.draft_body_nl !== undefined) ? body.draft_body_nl : row?.draft_body_nl ?? null
    updates.body_en = (body.draft_body_en !== undefined) ? body.draft_body_en : row?.draft_body_en ?? null
  }

  const { error } = await sb.from('sannah_pages').update(updates).eq('page_key', key)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
