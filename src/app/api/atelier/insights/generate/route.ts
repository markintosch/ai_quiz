export const dynamic = 'force-dynamic'
export const maxDuration = 120  // web_search + LLM synth — should fit easily

// FILE: src/app/api/atelier/insights/generate/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Inzichten generator. Input: keywords (e.g. "Gen Z duurzaamheid"). Output:
// 10-15 "wist je dat" cards.
//
// Context-grounding strategy:
//   1. Search the local Atelier corpus (audience_signals, directions, jtbd
//      summaries, brief context) via PostgreSQL ilike on the keyword tokens.
//      Top 50 hits become "observed" evidence — anchored in real sessions.
//   2. Anthropic web_search tool fires up to 3 queries to surface recent
//      claims. These become "web" evidence — actual URLs.
//   3. LLM (Sonnet 4.6) synthesises 10-15 cards. Each card MUST tag confidence:
//      observed | web | inferred — so the UI can show users where the claim
//      actually comes from.
//
// Not persisted to DB for v1 — generation is on-demand and cheap-ish. Add an
// atelier_insight_runs table later if Mark wants saved sessions / sharing.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { parseJsonOutput, modelForTier } from '@/lib/atelier/llm'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Card schema ──────────────────────────────────────────────────────────────
const InsightCardSchema = z.object({
  headline:   z.string().min(8).max(280),
  body:       z.string().min(20).max(900),
  confidence: z.enum(['observed', 'web', 'inferred']),
  evidence_label: z.string().nullish(),
  evidence_url:   z.string().nullish(),
})

const InsightSetSchema = z.object({
  cards: z.array(InsightCardSchema).min(8).max(20),
})

type InsightCard = z.infer<typeof InsightCardSchema>

// ── DB grounding ─────────────────────────────────────────────────────────────
interface AudienceHit {
  source: 'audience'
  claim:  string
  source_label: string
  source_url:   string | null
  session_id:   string
}
interface DirectionHit {
  source: 'direction'
  tension:   string
  route:     string
  session_id: string
}
interface JtbdHit {
  source:        'jtbd'
  brief_summary: string
  session_id:    string
}
interface ExtractHit {
  source:        'extract'
  claim:         string
  url:           string
  source_name:   string  // human label of the parent atelier_sources row
}
type Hit = AudienceHit | DirectionHit | JtbdHit | ExtractHit

async function searchCorpus(keywords: string): Promise<Hit[]> {
  const tokens = keywords.split(/[\s,]+/).map(t => t.trim()).filter(t => t.length >= 2).slice(0, 5)
  if (tokens.length === 0) return []

  // Build OR-clauses: claim.ilike.%token1%,claim.ilike.%token2%,...
  const buildOr = (col: string) => tokens.map(t => `${col}.ilike.%${t}%`).join(',')

  const [audienceRes, directionRes, sessionRes, extractsRes] = await Promise.all([
    sb.from('atelier_audience_signals').select('claim, source_label, source_url, session_id').or(buildOr('claim')).limit(30),
    sb.from('atelier_directions').select('tension, route, session_id').or(`${buildOr('tension')},${buildOr('route')}`).limit(20),
    sb.from('atelier_sessions').select('id, jtbd_summary').or(buildOr('jtbd_summary')).not('jtbd_summary', 'is', null).limit(15),
    // Source extracts: search title + trend_claim. The signals JSONB array is
    // also relevant but Postgres OR-ilike on JSON values is awkward; the
    // title/trend_claim usually hit on keywords good enough for ranking.
    sb.from('atelier_source_extracts')
      .select('url, title, trend_claim, signals, atelier_sources(name)')
      .or(`${buildOr('title')},${buildOr('trend_claim')}`)
      .limit(40),
  ])

  const hits: Hit[] = []
  for (const r of (audienceRes.data ?? []) as Array<{ claim: string; source_label: string; source_url: string | null; session_id: string }>) {
    hits.push({ source: 'audience', claim: r.claim, source_label: r.source_label, source_url: r.source_url, session_id: r.session_id })
  }
  for (const r of (directionRes.data ?? []) as Array<{ tension: string; route: string; session_id: string }>) {
    hits.push({ source: 'direction', tension: r.tension, route: r.route, session_id: r.session_id })
  }
  for (const r of (sessionRes.data ?? []) as Array<{ id: string; jtbd_summary: string }>) {
    hits.push({ source: 'jtbd', brief_summary: r.jtbd_summary, session_id: r.id })
  }
  // Each extract row carries N signals — emit one Hit per signal claim so
  // the LLM gets the granular evidence, not just the title. Supabase types
  // the foreign-table join as Array<>; cast via unknown to our expected shape.
  type ExtractRow = {
    url: string; title: string | null; trend_claim: string | null;
    signals: Array<{ claim: string }> | null;
    atelier_sources: { name: string } | { name: string }[] | null
  }
  const extractsRows = (extractsRes.data ?? []) as unknown as ExtractRow[]
  for (const r of extractsRows) {
    const sourceObj = Array.isArray(r.atelier_sources) ? r.atelier_sources[0] : r.atelier_sources
    const sourceName = sourceObj?.name ?? 'External source'
    if (r.trend_claim) {
      hits.push({ source: 'extract', claim: r.trend_claim, url: r.url, source_name: sourceName })
    }
    for (const s of (r.signals ?? []).slice(0, 3)) {
      hits.push({ source: 'extract', claim: s.claim, url: r.url, source_name: sourceName })
    }
  }
  return hits
}

function formatHits(hits: Hit[]): string {
  if (hits.length === 0) return '(geen lokale corpus-treffers — gebruik web-search en eigen kennis)'
  const lines: string[] = []
  for (const h of hits) {
    if (h.source === 'audience') {
      lines.push(`- [audience] "${h.claim}" — bron: ${h.source_label}${h.source_url ? ` (${h.source_url})` : ''} | sessie: ${h.session_id.slice(0, 8)}`)
    } else if (h.source === 'direction') {
      lines.push(`- [direction] tension: ${h.tension} → route: ${h.route} | sessie: ${h.session_id.slice(0, 8)}`)
    } else if (h.source === 'jtbd') {
      lines.push(`- [brief] ${h.brief_summary.slice(0, 200)} | sessie: ${h.session_id.slice(0, 8)}`)
    } else {
      // extract → cite the source name + url so observed cards point at the real publication
      lines.push(`- [extract] "${h.claim}" — bron: ${h.source_name} (${h.url})`)
    }
  }
  return lines.join('\n')
}

// ── System + user prompt ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Je bent Atelier Inzichten — een werkpartner die "wist je dat"-feiten genereert voor een creatief/strategie-team in Nederland.

Je krijgt:
- Een set keywords van de gebruiker
- 0-50 lokale corpus-treffers (uit eerdere Atelier-sessies — audience signals, directions, JTBD-samenvattingen)
- Web-search tool (max 3 queries — gebruik 'm voor recente data, NIET voor algemene kennis)

Genereer 10-15 cards. Elke card is één concrete claim met substantie. Geen vaagheid. Voorbeelden van goede cards:

GOED:
- "62% van Gen Z koopt liever een tweedehands sneaker dan een nieuwe — als de stoiry maar goed is" (web bron)
- "In 4 van de 5 Atelier-sessies over Gen Z benoemden we 'TikTok als zoekmachine' als signaal" (observed, lokaal)
- "Brand archetype 'rebel' werkt zelden voor B2B Gen Z — daar wint 'sage' of 'creator'" (inferred, model-knowledge)

SLECHT:
- "Gen Z is geboren tussen 1997 en 2012" (geen nieuws, geen inzicht)
- "Gen Z houdt van duurzaamheid" (vaag, geen claim)

Regels:
- Headline begint NIET met "Wist je dat" — de UI doet dat zelf eromheen.
- Headline = de KERN-CLAIM in één zin.
- Body = 2-3 zinnen die het uitwerken, eventueel met cijfer of citaat.
- ELKE card krijgt confidence:
  - "observed" = uit lokale corpus (gebruik dan evidence_label = source_label uit corpus)
  - "web" = uit web-search (gebruik dan evidence_url + evidence_label = bron-domein)
  - "inferred" = jouw eigen synthese / kennis (evidence_label = "Atelier-synthese", evidence_url = null)
- Mix de drie soorten — de gebruiker wil weten wat hard is en wat een educated guess is.
- Schrijf in het Nederlands.
- Nederlandstalige Markt-context primair. Cijfers liever Nederlandse bronnen, maar als wereldwijd het enige is, mag dat ook (markeer dan even).

Antwoord ALTIJD als geldige JSON volgens dit schema:
{
  "cards": [
    {
      "headline": "string",
      "body": "string",
      "confidence": "observed" | "web" | "inferred",
      "evidence_label": "string of null",
      "evidence_url": "string of null"
    },
    ...
  ]
}`

function buildUserPrompt(keywords: string, hits: Hit[], icpContext: { label: string; lines: string } | null): string {
  const icpBlock = icpContext
    ? `\nDOELGROEP-CONTEXT (ICP — gebruik dit om cards specifiek voor deze doelgroep te framen):\n${icpContext.lines}\n`
    : ''
  return `KEYWORDS:
${keywords}
${icpBlock}
LOKALE CORPUS-TREFFERS (eerdere Atelier-sessies):
${formatHits(hits)}

Genereer 10-15 "wist je dat"-cards. Mix observed (uit corpus), web (uit web-search) en inferred (eigen kennis) — de gebruiker wil weten wat hard is en wat een leap.${icpContext ? ' Frame elke card met de bovenstaande ICP in gedachten — niet abstract over "Gen Z" maar concreet relevant voor déze rol/industry/pijn.' : ''}`
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`atelier-insights:${ip}`, 20, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Te veel inzicht-runs deze uur.' }, { status: 429 })
  }

  let body: { keywords?: string; icpId?: string }
  try {
    body = (await req.json()) as { keywords?: string; icpId?: string }
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 })
  }

  const keywords = (body.keywords || '').trim().slice(0, 200)
  if (keywords.length < 2) {
    return NextResponse.json({ error: 'Geef minstens één keyword.' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY niet ingesteld op de server.' }, { status: 500 })
  }

  // 0. (Optional) load the picked ICP so we can ground cards in their
  //    triggers / pains / jobs — makes "voor Gen Z fashion" concrete.
  let icpContext: { label: string; lines: string } | null = null
  if (body.icpId) {
    const { data: icpRow } = await sb
      .from('atelier_icp_profiles')
      .select('industry, role, business_type, company_size, triggers, jobs, pains, request_keywords, archetype_label')
      .eq('id', body.icpId)
      .maybeSingle() as { data: { industry: string | null; role: string | null; business_type: string | null; company_size: string | null; triggers: string[] | null; jobs: string[] | null; pains: string[] | null; request_keywords: string | null; archetype_label: string | null } | null }
    if (icpRow) {
      const label = icpRow.archetype_label
        || (icpRow.request_keywords ? `Aanvraag: ${icpRow.request_keywords}` : `${icpRow.industry ?? '?'} · ${icpRow.role ?? '?'}`)
      const parts: string[] = []
      parts.push(`ICP: ${label}`)
      if (icpRow.business_type) parts.push(`Type: ${icpRow.business_type}`)
      if (icpRow.industry)      parts.push(`Industry: ${icpRow.industry}`)
      if (icpRow.role)          parts.push(`Rol: ${icpRow.role}`)
      if (icpRow.company_size)  parts.push(`Company size: ${icpRow.company_size}`)
      if ((icpRow.triggers ?? []).length > 0) parts.push(`Triggers: ${(icpRow.triggers ?? []).join(' · ')}`)
      if ((icpRow.jobs ?? []).length > 0)     parts.push(`Jobs: ${(icpRow.jobs ?? []).join(' · ')}`)
      if ((icpRow.pains ?? []).length > 0)    parts.push(`Pains: ${(icpRow.pains ?? []).join(' · ')}`)
      icpContext = { label, lines: parts.join('\n') }
    }
  }

  // 1. Local corpus search
  const hits = await searchCorpus(keywords)

  // 2. LLM call with web_search tool
  const client = new Anthropic({ apiKey })
  const userPrompt = buildUserPrompt(keywords, hits, icpContext)
  const start = Date.now()

  let raw = ''
  let usedWebSearch = false
  try {
    type WebSearchTool = { type: 'web_search_20250305'; name: 'web_search'; max_uses?: number }
    const response = await client.messages.create({
      model:       modelForTier('sonnet'),
      max_tokens:  6000,
      temperature: 0.4,
      system:      SYSTEM_PROMPT,
      messages:    [{ role: 'user', content: `${userPrompt}\n\nGeef je antwoord uitsluitend als geldige JSON.` }],
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 } as WebSearchTool] as unknown as Anthropic.MessageCreateParams['tools'],
    })
    raw = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('\n')
    usedWebSearch = true
  } catch (err) {
    console.warn('[atelier/insights] web_search unavailable, falling back:', err instanceof Error ? err.message : err)
    const response = await client.messages.create({
      model:       modelForTier('sonnet'),
      max_tokens:  6000,
      temperature: 0.4,
      system:      SYSTEM_PROMPT + '\n\nLET OP: web_search niet beschikbaar — geen "web"-cards. Gebruik observed (corpus) en inferred (eigen kennis).',
      messages:    [{ role: 'user', content: `${userPrompt}\n\nGeef je antwoord uitsluitend als geldige JSON.` }],
    })
    raw = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('\n')
  }

  const latencyMs = Date.now() - start

  // 3. Parse + validate
  let cards: InsightCard[]
  try {
    const parsed = InsightSetSchema.parse(parseJsonOutput(raw))
    cards = parsed.cards
  } catch (err) {
    console.error('[atelier/insights] parse error', err, '\nraw was:', raw.slice(0, 500))
    return NextResponse.json({ error: 'LLM-output kon niet geparsed worden. Probeer opnieuw of pas je keywords aan.' }, { status: 502 })
  }

  return NextResponse.json({
    keywords,
    cards,
    meta: {
      retrieved_count: hits.length,
      used_web_search: usedWebSearch,
      latency_ms:      latencyMs,
      icp_used:        icpContext?.label ?? null,
    },
  })
}
