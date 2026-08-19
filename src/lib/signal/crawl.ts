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
