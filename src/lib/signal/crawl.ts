// FILE: src/lib/signal/crawl.ts
// ─── Moba Signal — page fetching ──────────────────────────────────────────────
//
// Copied and refined from the Atelier generic adapter. Public pages only, a
// bot-honest user agent, capped concurrency upstream, graceful failure: a
// blocked or JS-only page yields no text and the run records that, rather
// than fighting bot detection (PRD §8.6).

const FETCH_TIMEOUT_MS = 25_000

export async function fetchPage(url: string): Promise<string> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: {
        'User-Agent':      'Mozilla/5.0 (compatible; MobaSignalCollector/0.1; +https://markdekock.com)',
        'Accept':          'text/html, */*;q=0.5',
        'Accept-Language': 'en,nl;q=0.8',
      },
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(t)
  }
}

/** Strip HTML to readable text. Crude on purpose — the extractor is tolerant. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<br\s*\/?>(?=\S)/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|article|section)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim()
}

export interface ArticleLink { url: string; title?: string }

/** Find article-like links on a listing page, same host only. */
export function discoverArticleLinks(html: string, pageUrl: string, max = 6): ArticleLink[] {
  const root = new URL(pageUrl)
  const out = new Map<string, ArticleLink>()
  const anchorRe = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = anchorRe.exec(html)) !== null && out.size < max) {
    const href = m[1]
    const text = m[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().slice(0, 200)
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) continue
    let abs: URL
    try { abs = new URL(href, pageUrl) } catch { continue }
    if (abs.hostname !== root.hostname) continue
    if (abs.pathname === '/' || abs.pathname === root.pathname) continue
    if (/\/(tag|category|author|page|search|subscribe|login|account|privacy|terms|contact|cart)\//.test(abs.pathname)) continue
    const looksLikeArticle = abs.pathname.split('/').filter(Boolean).length >= 2 || /-/.test(abs.pathname)
    if (!looksLikeArticle || text.length < 8) continue
    const key = abs.toString().split('#')[0]
    if (!out.has(key)) out.set(key, { url: key, title: text || undefined })
  }
  return [...out.values()]
}

// ── RSS ingestion ─────────────────────────────────────────────────────────────
// Verified feeds are the preferred path: they carry publication dates and
// canonical article URLs, which the extractor otherwise has to infer. Source
// list and endpoint status come from the "Moba Signal Sources" briefing
// (probed 19 Aug 2026); sources without a working feed fall back to the HTML
// listing scrape above.

import { XMLParser } from 'fast-xml-parser'

export interface FeedEntry {
  url: string
  title: string
  publishedAt?: string   // ISO date when the feed carries one
  description?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asArray<T = any>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return []
  return Array.isArray(v) ? v : [v]
}

function toIsoDate(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = Date.parse(v)
  return Number.isNaN(t) ? undefined : new Date(t).toISOString().slice(0, 10)
}

/** Parse RSS 2.0 or Atom into entries. Returns [] for non-feed responses. */
export function parseFeed(xml: string, max = 8): FeedEntry[] {
  if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(xml.slice(0, 2000))) return []
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let doc: any
  try { doc = parser.parse(xml) } catch { return [] }

  const out: FeedEntry[] = []
  // RSS 2.0: rss.channel.item[]
  for (const item of asArray(doc?.rss?.channel?.item)) {
    const url = typeof item.link === 'string' ? item.link : item.link?.['#text']
    const title = typeof item.title === 'string' ? item.title : item.title?.['#text']
    if (!url || !title) continue
    const desc = typeof item.description === 'string' ? item.description : undefined
    out.push({
      url, title: String(title).trim(),
      publishedAt: toIsoDate(item.pubDate ?? item['dc:date']),
      description: desc ? htmlToText(desc).slice(0, 2000) : undefined,
    })
    if (out.length >= max) return out
  }
  if (out.length > 0) return out
  // Atom: feed.entry[] with link[@href]
  for (const entry of asArray(doc?.feed?.entry)) {
    const links = asArray(entry.link)
    const alt = links.find(l => l?.['@_rel'] === 'alternate') ?? links[0]
    const url = alt?.['@_href']
    const title = typeof entry.title === 'string' ? entry.title : entry.title?.['#text']
    if (!url || !title) continue
    out.push({
      url, title: String(title).trim(),
      publishedAt: toIsoDate(entry.published ?? entry.updated),
      description: typeof entry.summary === 'string' ? htmlToText(entry.summary).slice(0, 2000) : undefined,
    })
    if (out.length >= max) break
  }
  return out
}
