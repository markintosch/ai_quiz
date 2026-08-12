import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

function token(): string {
  return randomBytes(9).toString('base64url') // ~12 url-safe chars
}

// GET /api/admin/moba — list all MOBA teams with submission counts
export async function GET() {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: teams, error } = await (supabase.from('moba_teams') as any)
    .select('id, name, submit_token, results_token, segmentation_enabled, min_responses, active, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = await (supabase.from('moba_submissions') as any).select('team_id')
  const counts = new Map<string, number>()
  for (const s of subs ?? []) counts.set(s.team_id, (counts.get(s.team_id) ?? 0) + 1)

  const data = (teams ?? []).map((t: Record<string, unknown>) => ({
    ...t,
    submission_count: counts.get(t.id as string) ?? 0,
  }))

  // Evaluation feedback (durable store). Defensive: table may not exist yet.
  let feedback: Array<Record<string, unknown>> = []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: fb } = await (supabase.from('moba_feedback') as any)
      .select('id, message, context, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    feedback = fb ?? []
  } catch {
    feedback = []
  }

  return NextResponse.json({ data, feedback })
}

// POST /api/admin/moba — create a new MOBA team (afname)
export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: { name?: string; code?: string; segmentationEnabled?: boolean; minResponses?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = (body.name ?? '').trim()
  if (!name) return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })

  // ── Optional custom access code → becomes the submit token (e.g. "2027") ──
  const RESERVED = ['demo', 'results']
  let submitToken = token()
  const rawCode = (body.code ?? '').trim().toLowerCase()
  if (rawCode) {
    if (!/^[a-z0-9-]{2,40}$/.test(rawCode)) {
      return NextResponse.json({ error: 'Code mag alleen letters, cijfers en streepjes bevatten (2–40 tekens).' }, { status: 400 })
    }
    if (RESERVED.includes(rawCode)) {
      return NextResponse.json({ error: `"${rawCode}" is gereserveerd. Kies een andere code.` }, { status: 400 })
    }
    submitToken = rawCode
  }

  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('moba_teams') as any)
    .insert({
      name,
      submit_token: submitToken,
      results_token: token(),
      segmentation_enabled: body.segmentationEnabled ?? true,
      min_responses: Number.isFinite(body.minResponses) ? Math.max(1, Math.round(body.minResponses!)) : 4,
    })
    .select('id, name, submit_token, results_token, segmentation_enabled, min_responses, active, created_at')
    .single()

  if (error) {
    // Unique-violation on a duplicate custom code → friendly message
    if ((error.code === '23505') || /duplicate|unique/i.test(error.message ?? '')) {
      return NextResponse.json({ error: 'Die code is al in gebruik. Kies een andere.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: { ...data, submission_count: 0 } }, { status: 201 })
}
