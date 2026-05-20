export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSannahAuthorised } from '@/lib/sannah/auth'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface ReorderBody { ids: string[] }

/**
 * POST { ids: [id, id, id, ...] } — assigns position 0..n-1 in array order.
 * Used by drag-and-drop in admin.
 */
export async function POST(req: NextRequest) {
  if (!(await isSannahAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  let body: ReorderBody
  try { body = (await req.json()) as ReorderBody } catch { return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 }) }
  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'ids array is verplicht.' }, { status: 400 })
  }

  // Update each row's position; small N so sequential is fine
  const errors: string[] = []
  for (let i = 0; i < body.ids.length; i++) {
    const { error } = await sb.from('sannah_works').update({ position: i }).eq('id', body.ids[i])
    if (error) errors.push(`${body.ids[i]}: ${error.message}`)
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
