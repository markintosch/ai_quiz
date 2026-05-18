export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>

/**
 * Presence endpoint.
 *
 * POST { id: <uuid> }  → upsert presence row, return current active count
 * GET                  → return active count only
 *
 * "Active" = last_seen > NOW() - 90 seconds. The landing page pings every
 * 30 s so 90 s is two missed pings before we consider a tab gone.
 *
 * Soft-fails to count=0 if Supabase env is missing or the table doesn't
 * yet exist (migration not run). This keeps the landing rendering before
 * the SQL has been applied.
 */

const ACTIVE_WINDOW_SECONDS = 90
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getClient(): AnyClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key) as AnyClient
}

let cache: { count: number; expiresAt: number } | null = null

async function countActive(supabase: AnyClient): Promise<number> {
  const now = Date.now()
  if (cache && now < cache.expiresAt) return cache.count

  const cutoff = new Date(now - ACTIVE_WINDOW_SECONDS * 1000).toISOString()
  const { count, error } = await supabase
    .from('indycar_presence')
    .select('id', { count: 'exact', head: true })
    .gte('last_seen', cutoff)

  if (error) {
    console.warn('[indycar/presence] count error:', error.message)
    return 0
  }

  const c = count ?? 0
  cache = { count: c, expiresAt: now + 3_000 }
  return c
}

export async function POST(req: NextRequest) {
  let body: { id?: string }
  try { body = await req.json() } catch { return NextResponse.json({ count: 0 }, { status: 200 }) }
  const id = body.id
  if (!id || !UUID_RE.test(id)) return NextResponse.json({ count: 0 }, { status: 200 })

  const supabase = getClient()
  if (!supabase) return NextResponse.json({ count: 0 }, { status: 200 })

  try {
    const { error } = await supabase
      .from('indycar_presence')
      .upsert({ id, last_seen: new Date().toISOString() }, { onConflict: 'id' })

    if (error) {
      console.warn('[indycar/presence] upsert error:', error.message)
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    // Invalidate the count cache so the caller sees themselves immediately
    cache = null
    const count = await countActive(supabase)
    return NextResponse.json({ count })
  } catch (err) {
    console.warn('[indycar/presence] error:', err)
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}

export async function GET() {
  const supabase = getClient()
  if (!supabase) return NextResponse.json({ count: 0 })
  try {
    const count = await countActive(supabase)
    return NextResponse.json({ count })
  } catch (err) {
    console.warn('[indycar/presence] GET error:', err)
    return NextResponse.json({ count: 0 })
  }
}
