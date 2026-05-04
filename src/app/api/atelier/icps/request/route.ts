export const dynamic = 'force-dynamic'
export const maxDuration = 60

// FILE: src/app/api/atelier/icps/request/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Standalone ICP generator. Input: free-text keywords (e.g. "Gen Z fashion B2C
// Amsterdam"). Output: a fresh atelier_icp_profiles row with session_id=null
// and request_keywords=<input>. The /atelier/icps page then surfaces it
// alongside session-derived ICPs and lets the user open it for refinement.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { parseJsonOutput } from '@/lib/atelier/llm'
import { IcpProfileSchema } from '@/lib/atelier/schemas'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const SYSTEM_PROMPT = `Je bent Atelier — je genereert een Ideal Customer Profile (ICP) op basis van keywords.

De ICP wordt gebruikt door brand-/marketing-/sales-teams om hun denken te scherpen. Geen marketing-personas met namen en hobby's; wel een werkbare structuur die DMU-keuzes en messaging-keuzes ondersteunt.

Regels:
- Je krijgt alleen keywords. Vul de gaten op met de meest plausibele invulling — wees bereid een keuze te maken (NL B2B, NL B2C, MKB vs enterprise, etc.) en leg in 'rationale' uit waarom.
- Industry: kies één sector/branche. Niet "diverse" of "n.v.t.".
- Role: één primaire rol. Bijv. "Marketing Manager", niet "iedereen in het MT".
- Triggers: 3-5 — concrete aanleidingen die hen NU laten zoeken (geen abstracte trends).
- Jobs: 3-5 — wat ze gedaan willen krijgen, in hun eigen taal.
- Pains: 3-5 — pijn die zij benoemen, niet wat een verkoper denkt te zien.
- Buying committee: 3-5 leden naast de primaire rol.

Antwoord ALTIJD als geldige JSON volgens dit schema:
{
  "business_type": "b2b" | "b2c" | "b2b2c" | "b2g",
  "industry": "string",
  "role": "string",
  "company_size": "string",
  "triggers": ["string"],
  "jobs": ["string"],
  "pains": ["string"],
  "buying_committee": [{ "role": "string", "influence": "decision_maker"|"champion"|"evaluator"|"gatekeeper"|"end_user", "motivation": "string?" }],
  "rationale": "string"
}`

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`atelier-icp-request:${ip}`, 30, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel ICP-aanvragen deze uur.' }, { status: 429 })
  }

  let body: { keywords?: string }
  try { body = (await req.json()) as { keywords?: string } } catch { return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 }) }

  const keywords = (body.keywords || '').trim().slice(0, 200)
  if (keywords.length < 2) {
    return NextResponse.json({ error: 'Geef minstens één keyword.' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY niet ingesteld.' }, { status: 500 })

  const client = new Anthropic({ apiKey })

  let raw = ''
  try {
    const response = await client.messages.create({
      model:       'claude-sonnet-4-6',
      max_tokens:  3000,
      temperature: 0.3,
      system:      SYSTEM_PROMPT,
      messages:    [{ role: 'user', content: `Keywords: ${keywords}\n\nGeef de ICP als geldige JSON.` }],
    })
    raw = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('\n')
  } catch (err) {
    console.error('[atelier/icps/request] LLM call failed', err)
    return NextResponse.json({ error: 'LLM-call mislukt. Probeer opnieuw.' }, { status: 502 })
  }

  let icp
  try {
    icp = IcpProfileSchema.parse(parseJsonOutput(raw))
  } catch (err) {
    console.error('[atelier/icps/request] parse error', err)
    return NextResponse.json({ error: 'LLM-output kon niet geparsed worden. Probeer opnieuw.' }, { status: 502 })
  }

  // Persist as a standalone ICP (session_id null, request_keywords set).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('atelier_icp_profiles') as any)
    .insert({
      session_id:        null,
      request_keywords:  keywords,
      business_type:     icp.business_type,
      industry:          icp.industry,
      role:              icp.role,
      company_size:      icp.company_size,
      triggers:          icp.triggers,
      jobs:              icp.jobs,
      pains:             icp.pains,
      buying_committee:  icp.buying_committee,
      rationale:         icp.rationale,
      refinement_history: [],
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[atelier/icps/request] insert error', error)
    return NextResponse.json({ error: 'Opslaan mislukt.' }, { status: 500 })
  }

  return NextResponse.json({ id: (data as { id: string }).id, icp })
}
