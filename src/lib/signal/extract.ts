// FILE: src/lib/signal/extract.ts
// ─── Moba Signal — the Collector's extraction step ────────────────────────────
//
// One Haiku call per page: raw text in, dated competitive facts out. The
// schema is the gate: an item without a resolvable date is dropped here, never
// stored. Classification happens in this call; scoring stays deterministic in
// score.ts so the impact model is explainable to the analyst.

import { z } from 'zod'
import { parseJson, signalLlmCall } from './llm'

export const ExtractedItemSchema = z.object({
  title:    z.string().min(8).max(200),
  summary:  z.string().min(10).max(500),
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entities: z.array(z.string().min(2).max(80)).min(1).max(6),
  type:     z.enum(['launch', 'win', 'partnership', 'personnel', 'facility', 'funding', 'certification']),
  region:   z.enum(['europe', 'americas', 'asia', 'mea', 'global']),
  category: z.enum(['grading', 'processing', 'detection', 'digital', 'service', 'sustainability', 'corporate']),
  quotes:   z.array(z.string().max(300)).max(4).default([]),
  url:      z.string().url().nullable().default(null),
  inference: z.boolean().default(false),
})
export type ExtractedItem = z.infer<typeof ExtractedItemSchema>

const ResponseSchema = z.object({
  items: z.array(ExtractedItemSchema).max(10),
})

const SYSTEM_PROMPT = `You extract competitive-intelligence facts about the egg grading, packing and processing industry from a web page.

An item is one dated, concrete company event: a product launch, an announced customer win or installation, a partnership, a senior hire, a new facility, funding or acquisition activity, or a certification. Companies of interest include egg equipment makers (Moba, Diamond, Sanovo, Staalkat, Prinzen, Vencomatic, NABEL, Kyowa, Zenyer, Riva Selegg) and any other machinery supplier in this sector, plus their customers.

Rules:
- Only items with a determinable date. Use the article's own date for "announced today" phrasing. If you truly cannot date an item, omit it. Never invent dates: an item dated in the future relative to the page is almost always a stale-page error — omit it.
- 'entities': company names exactly as written on the page, most central first.
- 'quotes': verbatim marketing or capability claims by the company, in the source language, only when present.
- 'url': the absolute link to the specific article when the text shows one, else null.
- 'inference': true when you are concluding something the page does not state outright.
- Skip: generic industry news with no company, opinion pieces, recipe/consumer content, anything about the page's own cookie banners or navigation.
- Empty pages, menus, 404s, paywalled teasers: return {"items":[]}.

Answer with valid JSON only:
{"items":[{"title":"...","summary":"...","date":"YYYY-MM-DD","entities":["..."],"type":"launch|win|partnership|personnel|facility|funding|certification","region":"europe|americas|asia|mea|global","category":"grading|processing|detection|digital|service|sustainability|corporate","quotes":[],"url":null,"inference":false}]}`

export async function extractItems(pageUrl: string, pageText: string, pageDateHint?: string): Promise<ExtractedItem[]> {
  const text = pageText.slice(0, 14_000)
  if (text.length < 80) return []
  const user = `Page URL: ${pageUrl}\nFetched: ${pageDateHint ?? new Date().toISOString().slice(0, 10)}\n\nPage text:\n${text}`
  const raw = await signalLlmCall({ tier: 'haiku', system: SYSTEM_PROMPT, user, maxTokens: 3000 })
  const parsed = ResponseSchema.safeParse(parseJson(raw))
  if (!parsed.success) return []
  // Date sanity: reject future-dated items (the stale-events-page trap)
  const today = new Date().toISOString().slice(0, 10)
  return parsed.data.items.filter(i => i.date <= today)
}
