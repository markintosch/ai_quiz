// FILE: src/lib/atelier/crawl/extractor.ts
// ──────────────────────────────────────────────────────────────────────────────
// Shared LLM-based signal extractor. Used by every adapter: pass in a URL +
// raw text (or let it fetch via web_fetch tool), get back ExtractedSignal[].
//
// Uses Claude Haiku for cost — extraction is mechanical, doesn't need Sonnet's
// reasoning. Same temp + JSON-mode pattern as the other Atelier modules.

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { parseJsonOutput } from '../llm'
import type { ExtractResult, ExtractedSignal } from './types'

const ExtractSchema = z.object({
  trend_claim: z.string().max(280).nullable().optional(),
  signals: z.array(z.object({
    claim:    z.string().min(8).max(280),
    evidence: z.string().max(400).optional(),
    tag:      z.enum(['trend', 'behaviour', 'stat', 'quote', 'shift']).optional(),
  })).min(1).max(8),
})

const SYSTEM_PROMPT = `Je extracteert culturele signalen uit een nieuwsbrief- of artikel-tekst.

Een signaal = één concrete claim die voor een creatief/strategie-team relevant kan zijn voor doelgroep-onderzoek of cultureel zicht. Zoek naar:
- Stats / cijfers ("62% van Gen Z gebruikt TikTok als zoekmachine")
- Gedrag-shifts ("merken stoppen met Pride-marketing in 2026")
- Nieuwe diensten/categorieën ("dating-apps voor 50+")
- Citaten van influencers/operators ("'Wij willen geen merk maar een cult zijn' — Liquid Death")
- Culturele momenten ("Coquette-esthetiek loopt op haar laatste benen")

Regels:
- 3-8 signalen per pagina. Geen vulling — alleen wat echt iets vertelt.
- Geen marketingproza ("dit innovatieve initiatief...") — wel concrete observaties.
- Schrijf signalen als losse zinnen, geen samenvatting van het hele artikel.
- 'trend_claim' = één zin die de hoofdboodschap van de pagina vat. Optional.
- 'tag' helpt clusteren — kies uit: trend, behaviour, stat, quote, shift.
- Geef GEEN signal als de pagina geen substantiële inhoud heeft (alleen menu, teaser, 404, paywall).

Antwoord ALTIJD als geldige JSON:
{
  "trend_claim": "string of null",
  "signals": [
    { "claim": "string", "evidence": "string?", "tag": "trend|behaviour|stat|quote|shift?" }
  ]
}

Als de pagina leeg/inhoudloos is: { "trend_claim": null, "signals": [] }.`

interface ExtractInput {
  url:        string
  title?:     string
  rawText:    string  // already-extracted page text (substack/beehiiv adapters do their own fetch)
  extractor:  string  // identifier for logging
}

export async function extractSignalsFromText(input: ExtractInput): Promise<ExtractResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      url: input.url, title: input.title ?? null,
      trend_claim: null, signals: [],
      excerpt: input.rawText.slice(0, 300),
      extractor: input.extractor,
      error_message: 'ANTHROPIC_API_KEY niet ingesteld',
    }
  }

  // Truncate raw text — Haiku has plenty of context but we don't want to
  // ship the entire archive into one call. 8K chars ≈ 2K tokens, plenty
  // for a single newsletter post.
  const text = input.rawText.slice(0, 8000)
  if (text.trim().length < 50) {
    return {
      url: input.url, title: input.title ?? null,
      trend_claim: null, signals: [],
      excerpt: text,
      extractor: input.extractor,
      error_message: 'Page text too short to extract',
    }
  }

  const client = new Anthropic({ apiKey })
  const userPrompt = `URL: ${input.url}
${input.title ? `TITEL: ${input.title}\n` : ''}
TEKST:
${text}

Extract de signalen. Antwoord als geldige JSON.`

  let raw = ''
  try {
    const response = await client.messages.create({
      model:       'claude-haiku-4-5-20251001',
      max_tokens:  2000,
      temperature: 0.2,
      system:      SYSTEM_PROMPT,
      messages:    [{ role: 'user', content: userPrompt }],
    })
    raw = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('\n')
  } catch (err) {
    return {
      url: input.url, title: input.title ?? null,
      trend_claim: null, signals: [],
      excerpt: text.slice(0, 300),
      extractor: input.extractor,
      error_message: `LLM-call faalde: ${err instanceof Error ? err.message.slice(0, 200) : 'unknown'}`,
    }
  }

  let parsed
  try {
    parsed = ExtractSchema.parse(parseJsonOutput(raw))
  } catch (err) {
    return {
      url: input.url, title: input.title ?? null,
      trend_claim: null, signals: [],
      excerpt: text.slice(0, 300),
      extractor: input.extractor,
      error_message: `Parse-fout: ${err instanceof Error ? err.message.slice(0, 200) : 'unknown'}`,
    }
  }

  const signals: ExtractedSignal[] = parsed.signals.map(s => ({
    claim:    s.claim,
    evidence: s.evidence,
    tag:      s.tag,
  }))

  return {
    url: input.url,
    title: input.title ?? null,
    trend_claim: parsed.trend_claim ?? null,
    signals,
    excerpt: text.slice(0, 300),
    extractor: input.extractor,
    error_message: null,
  }
}
