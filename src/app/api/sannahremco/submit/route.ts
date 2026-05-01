export const dynamic = 'force-dynamic'

// FILE: src/app/api/sannahremco/submit/route.ts
// POST — receives a briefing submission (Sannah portfolio or Remco presence)
// and writes it to the `briefings` Supabase table. No auth (public form).

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const VALID_TYPES = ['sannah_portfolio', 'remco_presence'] as const
type BriefingType = typeof VALID_TYPES[number]

interface SubmitBody {
  briefing_type: BriefingType
  name?: string
  email?: string
  payload: Record<string, unknown>
  uploads?: Array<{ url: string; filename: string; size: number; mime: string; path: string }>
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`sannahremco:${ip}`, 5, 10 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Te veel pogingen. Probeer het over een paar minuten opnieuw.' },
      { status: 429 }
    )
  }

  let body: SubmitBody
  try {
    body = (await req.json()) as SubmitBody
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 })
  }

  if (!body || !VALID_TYPES.includes(body.briefing_type)) {
    return NextResponse.json({ error: 'briefing_type ontbreekt of is ongeldig.' }, { status: 400 })
  }
  if (typeof body.payload !== 'object' || body.payload === null) {
    return NextResponse.json({ error: 'payload ontbreekt.' }, { status: 400 })
  }

  const { error } = await supabase.from('briefings').insert({
    briefing_type: body.briefing_type,
    name:          body.name?.trim() || null,
    email:         body.email?.trim().toLowerCase() || null,
    payload:       body.payload,
    uploads:       Array.isArray(body.uploads) ? body.uploads : [],
    ip_address:    ip,
    user_agent:    req.headers.get('user-agent') ?? null,
  })

  if (error) {
    console.error('[sannahremco/submit] insert', error)
    return NextResponse.json(
      { error: 'Opslaan is mislukt. Mark heeft hier een melding van gekregen.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
