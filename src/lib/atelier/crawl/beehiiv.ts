// FILE: src/lib/atelier/crawl/beehiiv.ts
// ──────────────────────────────────────────────────────────────────────────────
// Beehiiv adapter. Beehiiv publications also expose RSS at /feed and have
// stable post URLs. The HTML structure differs slightly from Substack but
// the discovery + extract pattern is identical. We reuse the Substack
// helpers internally.

import { extractSignalsFromText } from './extractor'
import type { CrawlTarget, ExtractResult } from './types'

const FETCH_TIMEOUT_MS = 30_000

export function isBeehiivUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.hostname.endsWith('.beehiiv.com')
  } catch { return false }
}

function rssUrlFor(rootUrl: string): string {
  const u = new URL(rootUrl)
  u.pathname = '/feed'
  u.search = ''
  u.hash = ''
  return u.toString()
}

async function fetchWithTimeout(url: string, ms: number = FETCH_TIMEOUT_MS): Promise<string> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: {
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

export async function discoverBeehiivTargets(rootUrl: string, maxPages: number): Promise<CrawlTarget[]> {
  const xml = await fetchWithTimeout(rssUrlFor(rootUrl))
  const items: CrawlTarget[] = []
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi
  let m: RegExpExecArray | null
  while ((m = itemRe.exec(xml)) !== null && items.length < maxPages) {
    const block = m[1]
    const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(block)
    const linkMatch  = /<link>([\s\S]*?)<\/link>/i.exec(block)
    if (linkMatch?.[1]) {
      items.push({ url: linkMatch[1].trim(), title: titleMatch?.[1]?.trim() ?? undefined })
    }
  }
  return items
}

function htmlToText(html: string): string {
  let body = html
  // Beehiiv wraps post body in <article> with class on the inner content div.
  const articleMatch = /<article[\s\S]*?>([\s\S]*?)<\/article>/i.exec(body)
  if (articleMatch) body = articleMatch[1]

  body = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<\/(p|h[1-6]|li|div|br)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
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

export async function extractBeehiivPost(target: CrawlTarget): Promise<ExtractResult> {
  let html: string
  try {
    html = await fetchWithTimeout(target.url)
  } catch (err) {
    return {
      url: target.url, title: target.title ?? null,
      trend_claim: null, signals: [],
      excerpt: null, extractor: 'beehiiv',
      error_message: `Fetch faalde: ${err instanceof Error ? err.message.slice(0, 200) : 'unknown'}`,
    }
  }

  const text = htmlToText(html)
  return extractSignalsFromText({
    url:       target.url,
    title:     target.title,
    rawText:   text,
    extractor: 'beehiiv',
  })
}
