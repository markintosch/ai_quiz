export const dynamic = 'force-dynamic'
export const maxDuration = 60

// FILE: src/app/api/atelier/icps/[id]/refine/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Refine an existing ICP via chat. The user asks a question / requests a
// change ("voeg een trigger toe rond AI-skepsis", "maak hem meer Nederlands");
// Claude returns:
//   - answer: short narrative reply for the chat UI
//   - updated_icp: full IcpProfile JSON (Claude must return the WHOLE thing
//     even when only part changes — easier to validate + persist atomically)
// We then write the updated columns back AND append the q/a to
// refinement_history JSONB.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { parseJsonOutput } from '@/lib/atelier/llm'
import { IcpProfileSchema } from '@/lib/atelier/schemas'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const RefineResponseSchema = z.object({
  answer:      z.string().min(1).max(1500),
  updated_icp: IcpProfileSchema,
})

const SYSTEM_PROMPT = `Je verfijnt een bestaand Ideal Customer Profile (ICP) op basis van een vraag of opmerking van de gebruiker.

Regels:
- Pas alleen de delen aan die de vraag impliceert. Wat onaangetast blijft, kopieer je 1-op-1.
- 'answer' = kort, narratief antwoord aan de gebruiker. Wat heb je veranderd en waarom? 1-3 zinnen.
- 'updated_icp' = de VOLLEDIGE ICP, met de wijzigingen toegepast. Niet alleen de delta.
- Bij conflicten / onmogelijke verzoeken: leg dat in 'answer' uit en houd 'updated_icp' identiek aan input.

Antwoord ALTIJD als geldige JSON:
{
  "answer": "string",
  "updated_icp": { ... volledige ICP volgens schema ... }
}`

interface IcpRow {
  id:                 string
  business_type:      string | null
  industry:           string | null
  role:               string | null
  company_size:       string | null
  triggers:           string[] | null
  jobs:               string[] | null
  pains:              string[] | null
  buying_committee:   Array<{ role: string; influence: string; motivation?: string }> | null
  rationale:          string | null
  refinement_history: Array<{ question: string; answer: string; refined_at: string }> | null
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`atelier-icp-refine:${ip}`, 60, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel refinements deze uur.' }, { status: 429 })
  }

  const { id } = await params

  let body: { question?: string }
  try { body = (await req.json()) as { question?: string } } catch { return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 }) }

  const question = (body.question || '').trim().slice(0, 1000)
  if (question.length < 2) return NextResponse.json({ error: 'Geef een vraag of opmerking.' }, { status: 400 })

  // Load current ICP state
  const { data: icpRow } = await sb
    .from('atelier_icp_profiles')
    .select('id, business_type, industry, role, company_size, triggers, jobs, pains, buying_committee, rationale, refinement_history')
    .eq('id', id)
    .maybeSingle() as { data: IcpRow | null }

  if (!icpRow) return NextResponse.json({ error: 'ICP niet gevonden.' }, { status: 404 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY niet ingesteld.' }, { status: 500 })

  // Build the chat history so Claude has context of earlier refinements
  const history = icpRow.refinement_history ?? []
  const historyText = history.length > 0
    ? history.map((h, i) => `[Refinement ${i + 1}]\nVraag: ${h.question}\nAntwoord: ${h.answer}`).join('\n\n')
    : '(nog geen eerdere refinements)'

  const currentIcpJson = JSON.stringify({
    business_type:    icpRow.business_type,
    industry:         icpRow.industry,
    role:             icpRow.role,
    company_size:     icpRow.company_size,
    triggers:         icpRow.triggers ?? [],
    jobs:             icpRow.jobs ?? [],
    pains:            icpRow.pains ?? [],
    buying_committee: icpRow.buying_committee ?? [],
    rationale:        icpRow.rationale ?? '',
  }, null, 2)

  const userPrompt = `HUIDIGE ICP:
${currentIcpJson}

EERDERE REFINEMENTS (chronologisch):
${historyText}

NIEUWE VRAAG VAN GEBRUIKER:
${question}

Geef je antwoord als geldige JSON met 'answer' + 'updated_icp'.`

  const client = new Anthropic({ apiKey })

  let raw = ''
  try {
    const response = await client.messages.create({
      model:       'claude-sonnet-4-6',
      max_tokens:  3500,
      temperature: 0.4,
      system:      SYSTEM_PROMPT,
      messages:    [{ role: 'user', content: userPrompt }],
    })
    raw = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('\n')
  } catch (err) {
    console.error('[atelier/icps/refine] LLM call failed', err)
    return NextResponse.json({ error: 'LLM-call mislukt.' }, { status: 502 })
  }

  let parsed
  try {
    parsed = RefineResponseSchema.parse(parseJsonOutput(raw))
  } catch (err) {
    console.error('[atelier/icps/refine] parse error', err)
    return NextResponse.json({ error: 'LLM-output kon niet geparsed worden.' }, { status: 502 })
  }

  const refinedAt = new Date().toISOString()
  const newHistory = [...history, { question, answer: parsed.answer, refined_at: refinedAt }]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb.from('atelier_icp_profiles') as any)
    .update({
      business_type:      parsed.updated_icp.business_type,
      industry:           parsed.updated_icp.industry,
      role:               parsed.updated_icp.role,
      company_size:       parsed.updated_icp.company_size,
      triggers:           parsed.updated_icp.triggers,
      jobs:               parsed.updated_icp.jobs,
      pains:              parsed.updated_icp.pains,
      buying_committee:   parsed.updated_icp.buying_committee,
      rationale:          parsed.updated_icp.rationale,
      refinement_history: newHistory,
    })
    .eq('id', id)

  if (error) {
    console.error('[atelier/icps/refine] update error', error)
    return NextResponse.json({ error: 'Opslaan van update mislukt.' }, { status: 500 })
  }

  return NextResponse.json({
    answer:        parsed.answer,
    updated_icp:   parsed.updated_icp,
    refined_at:    refinedAt,
    history_length: newHistory.length,
  })
}
