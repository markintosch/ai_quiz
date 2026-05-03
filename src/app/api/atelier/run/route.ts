export const dynamic = 'force-dynamic'
export const maxDuration = 300  // ~5 minutes — orchestrator runs 5 LLM calls

// FILE: src/app/api/atelier/run/route.ts
// POST — accept a brief, create an atelier_session row, run all 5 modules
// via the orchestrator, return the session id + final one-pager.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { orchestrateSession } from '@/lib/atelier/orchestrator'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface RunBody {
  raw_brief:     string
  brand_context?: string
  brand_name?:   string
  owner_name?:   string
  owner_email?:  string
  language?:     'nl' | 'en' | 'fr'
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`atelier-run:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel runs deze uur. Probeer later opnieuw.' }, { status: 429 })
  }

  let body: RunBody
  try {
    body = (await req.json()) as RunBody
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 })
  }

  if (!body.raw_brief || body.raw_brief.trim().length < 30) {
    return NextResponse.json({ error: 'Brief is te kort (minimaal 30 tekens).' }, { status: 400 })
  }

  const language = body.language ?? 'nl'

  // 1. Create session row
  const { data: session, error: sessionErr } = await supabase
    .from('atelier_sessions')
    .insert({
      owner_name:  body.owner_name ?? null,
      owner_email: body.owner_email?.toLowerCase().trim() ?? null,
      brand_name:  body.brand_name ?? null,
      language,
      status:      'open',
    })
    .select('id')
    .single()

  if (sessionErr || !session) {
    console.error('[atelier/run] create session', sessionErr)
    return NextResponse.json({
      error: `Aanmaken sessie mislukt — ${sessionErr?.message ?? 'unknown'}. Migratie supabase/migration_atelier.sql moet draaien.`,
    }, { status: 500 })
  }

  const sessionId = (session as { id: string }).id

  // 2. Persist the brief
  await supabase.from('atelier_briefs').insert({
    session_id:    sessionId,
    raw_text:      body.raw_brief,
    brand_context: body.brand_context ?? null,
  })

  // 3. Run orchestrator
  try {
    const result = await orchestrateSession({
      sessionId,
      rawBrief:     body.raw_brief,
      brandContext: body.brand_context,
      language,
    })

    return NextResponse.json({
      sessionId: result.sessionId,
      onePager:  {
        body_md:        result.bundle.directions.length > 0 ? null : null,  // not echoed; client fetches
      },
    }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout.'
    console.error('[atelier/run] orchestrator', err)
    await supabase.from('atelier_sessions')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', sessionId)
    return NextResponse.json({ sessionId, error: message }, { status: 500 })
  }
}
