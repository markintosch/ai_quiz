import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

function extractMeta(html: string, url: string) {
  const getMeta = (name: string): string => {
    const m = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'))
    return m?.[1] ?? ''
  }

  const title = getMeta('og:title') || (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? '')
  const description = getMeta('og:description') || getMeta('description')
  const image = getMeta('og:image')
  const ogUrl = getMeta('og:url')
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? ''
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1] ?? ''

  // First meaningful paragraph (non-empty, > 50 chars)
  const paras = Array.from(html.matchAll(/<p[^>]*>([^<]{50,})<\/p>/gi)).map((m) => m[1])
  const firstPara = paras[0] ?? ''

  const domain = (() => {
    try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' }
  })()

  return { title, description, image, ogUrl, canonical, h1, firstPara, domain }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek.' }, { status: 400 })
  }

  const { url, themeId } = body as Record<string, unknown>

  if (typeof url !== 'string' || !url.startsWith('http')) {
    return NextResponse.json({ error: 'Geldige URL is verplicht.' }, { status: 400 })
  }
  if (typeof themeId !== 'string' || !themeId.trim()) {
    return NextResponse.json({ error: 'themeId is verplicht.' }, { status: 400 })
  }

  // Fetch the page
  let html = ''
  let pageText = ''
  try {
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DeMachinePulseBot/1.0; +https://demachine.nl)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10_000),
    })
    html = await pageRes.text()
    // Strip tags for text content
    pageText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  } catch (e) {
    console.error('[pulse/ingest] fetch error:', e)
    return NextResponse.json({ error: 'Kon de URL niet ophalen. Controleer of de URL bereikbaar is.' }, { status: 422 })
  }

  const meta = extractMeta(html, url)

  // Build draft entity from extracted metadata
  const slug = (meta.title || url)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

  const draftEntity = {
    theme_id: themeId.trim(),
    slug,
    label: meta.h1 || meta.title,
    entity_type: 'festival',
    subtitle: null as string | null,
    description_short: meta.description.slice(0, 200) || null,
    source_url: url,
    source_domain: meta.domain,
    canonical_url: meta.canonical || meta.ogUrl || url,
    hero_image_url: meta.image || null,
    og_image_url: meta.image || null,
    ingest_status: 'draft' as const,
  }

  let agentProfile: Record<string, unknown> | null = null

  // AI enhancement if key is set (requires @anthropic-ai/sdk to be installed)
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Anthropic = require('@anthropic-ai/sdk') as { default: { new(opts: { apiKey: string }): { messages: { create(opts: unknown): Promise<{ content: Array<{ type: string; text?: string }> }> } } } }
      const client = new Anthropic.default({ apiKey: anthropicKey })
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Je bent een redactionele assistent voor het muziekcultuurmedium De Machine (VPRO).

Analyseer de volgende webpagina-inhoud en maak een compact redactioneel profiel.

URL: ${url}
Ruwe inhoud:
${pageText.slice(0, 3000)}

Geef als JSON terug:
{
  "entity_type": "festival" | "event" | "artist" | "label" | "platform" | "venue" | "org",
  "label": "Officiële naam",
  "subtitle": "Korte subtitel of tagline (max 80 tekens)",
  "description_short": "Twee tot drie zinnen redactionele intro (max 200 tekens). Feitelijk, niet promotioneel.",
  "location_text": "Stad of locatie indien aanwezig",
  "organizer_name": "Organisator of venue indien aanwezig",
  "edition_label": "Editie of jaar indien aanwezig",
  "tags": ["tag1", "tag2"],
  "confidence_flags": { "image_missing": false, "description_weak": false, "date_missing": false }
}`,
        }],
      })

      const textContent = msg.content.find((c) => c.type === 'text')
      if (textContent?.text) {
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
          agentProfile = {
            generated_title: parsed.label ?? null,
            generated_summary: parsed.description_short ?? null,
            generated_tags: Array.isArray(parsed.tags) ? parsed.tags : null,
            generated_fields: {
              entity_type: parsed.entity_type,
              subtitle: parsed.subtitle,
              location_text: parsed.location_text,
              organizer_name: parsed.organizer_name,
              edition_label: parsed.edition_label,
            },
            confidence_flags: parsed.confidence_flags ?? null,
          }
          // Merge AI enhancements into draft
          if (typeof parsed.label === 'string') draftEntity.label = parsed.label
          if (typeof parsed.entity_type === 'string') draftEntity.entity_type = parsed.entity_type
          if (typeof parsed.subtitle === 'string') draftEntity.subtitle = parsed.subtitle
          if (typeof parsed.description_short === 'string') draftEntity.description_short = parsed.description_short
        }
      }
    } catch (e) {
      console.error('[pulse/ingest] AI error (non-fatal):', e)
    }
  }

  // Store entity as draft
  const supabase = createServiceClient()
  const { data: entity, error: entityError } = await supabase
    .from('pulse_entities')
    .insert(draftEntity)
    .select()
    .single()

  if (entityError || !entity) {
    return NextResponse.json({ error: entityError?.message ?? 'DB fout.' }, { status: 500 })
  }

  // Store agent profile
  const entityRow = entity as { id: string } & Record<string, unknown>
  if (agentProfile) {
    await supabase.from('pulse_agent_profiles').insert({
      entity_id: entityRow.id,
      generated_title: agentProfile.generated_title as string | null ?? null,
      generated_summary: agentProfile.generated_summary as string | null ?? null,
      generated_tags: agentProfile.generated_tags as import('@/types/supabase').Json | null ?? null,
      generated_fields: agentProfile.generated_fields as import('@/types/supabase').Json | null ?? null,
      confidence_flags: agentProfile.confidence_flags as import('@/types/supabase').Json | null ?? null,
    })
  }

  return NextResponse.json({ entity, agentProfile })
}
