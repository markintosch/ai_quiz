// FILE: src/lib/atelier/crawl/substack.ts
// ──────────────────────────────────────────────────────────────────────────────
// Substack adapter. Substack publications expose:
//   - https://<sub>.substack.com/archive — paginated list of posts
//   - https://<sub>.substack.com/p/<slug> — individual posts (full HTML)
// Plus a sitemap and an RSS feed at /feed. We use RSS because it's stable,
// machine-readable, returns the full body of recent posts, and avoids HTML
// scraping fragility.

import { extractSignalsFromText } from './extractor'
import type { CrawlTarget, ExtractResult } from './types'

const FETCH_TIMEOUT_MS = 30_000  // per RSS / page fetch

// ── URL helpers ──────────────────────────────────────────────────────────────

export function isSubstackUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.hostname.endsWith('.substack.com') || u.hostname === 'substack.com'
  } catch { return false }
}

function rssUrlFor(rootUrl: string): string {
  const u = new URL(rootUrl)
  // Strip path/search; we want <sub>.substack.com/feed
  u.pathname = '/feed'
  u.search   = ''
  u.hash     = ''
  return u.toString()
}

// ── Fetch with timeout ───────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, ms: number = FETCH_TIMEOUT_MS): Promise<string> {
  const ac = new AbortController()
  const t  = setTimeout(() => ac.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: {
        // Pretend to be a normal browser — substack/beehiiv are friendly
        // but some hosts block obvious bot UAs.
        'User-Agent':      'Mozilla/5.0 (compatible; AtelierCrawler/1.0; +https://markdekock.com/atelier)',
        'Accept':          'text/html, application/rss+xml, application/xml;q=0.9, */*;q=0.5',
        'Accept-Language': 'nl,en;q=0.8',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(t)
  }
}

// ── Discover: parse RSS, return latest N posts ──────────────────────────────

export async function discoverSubstackTargets(rootUrl: string, maxPages: number): Promise<CrawlTarget[]> {
  const rssUrl = rssUrlFor(rootUrl)
  const xml = await fetchWithTimeout(rssUrl)

  // Parse minimally with regex — RSS schema is stable, no need for a full
  // XML parser here. <item><title>X</title><link>Y</link>...</item>
  const items: CrawlTarget[] = []
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi
  let m: RegExpExecArray | null
  while ((m = itemRe.exec(xml)) !== null && items.length < maxPages) {
    const block = m[1]
    const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(block)
    const linkMatch  = /<link>([\s\S]*?)<\/link>/i.exec(block)
    if (linkMatch?.[1]) {
      items.push({
        url:   linkMatch[1].trim(),
        title: titleMatch?.[1]?.trim() ?? undefined,
      })
    }
  }
  return items
}

// ── Extract: fetch one post HTML, strip to body text, hand to LLM ───────────

function htmlToText(html: string): string {
  // Substack posts: the body lives inside <div class="post-content"> or similar.
  // We try to scope to the article first, then strip tags.
  let body = html

  // Try to scope to <article>...</article> if present
  const articleMatch = /<article[\s\S]*?>([\s\S]*?)<\/article>/i.exec(body)
  if (articleMatch) body = articleMatch[1]
  // Or to <div class="post-content">
  const postMatch = /<div[^>]+class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/?div|<footer)/i.exec(body)
  if (!articleMatch && postMatch) body = postMatch[1]

  // Strip script/style/svg blocks entirely
  body = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    // Replace block tags with newlines for readability
    .replace(/<\/(p|h[1-6]|li|div|br)>/gi, '\n')
    .replace(/<[^>]+>/g, '')           // strip remaining tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return body
}

export async function extractSubstackPost(target: CrawlTarget): Promise<ExtractResult> {
  let html: string
  try {
    html = await fetchWithTimeout(target.url)
  } catch (err) {
    return {
      url: target.url, title: target.title ?? null,
      trend_claim: null, signals: [],
      excerpt: null, extractor: 'substack',
      error_message: `Fetch faalde: ${err instanceof Error ? err.message.slice(0, 200) : 'unknown'}`,
    }
  }

  const text = htmlToText(html)
  return extractSignalsFromText({
    url:       target.url,
    title:     target.title,
    rawText:   text,
    extractor: 'substack',
  })
}
