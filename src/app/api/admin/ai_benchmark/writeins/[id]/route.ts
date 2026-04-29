import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin auth is enforced by middleware (HMAC cookie on /api/admin/*).
// No additional rate limit needed for authenticated admin endpoints.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_STATUSES = new Set(['pending', 'reviewed', 'promoted', 'merged', 'rejected'])

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json() as {
      status?:       string
      merge_target?: string | null
    }

    if (!body.status || !VALID_STATUSES.has(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const update: Record<string, unknown> = { status: body.status }
    if (body.status === 'merged') {
      if (!body.merge_target) {
        return NextResponse.json({ error: 'merge_target required when status=merged' }, { status: 400 })
      }
      update.merge_target = body.merge_target.slice(0, 50)
    } else if (body.merge_target === null) {
      update.merge_target = null
    }

    const { error } = await supabase
      .from('ai_benchmark_writeins')
      .update(update)
      .eq('id', params.id)

    if (error) {
      console.error('[admin/writeins PATCH]', error)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/writeins PATCH]', e)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
