// FILE: src/lib/atelier/crawl/generic.ts
// ──────────────────────────────────────────────────────────────────────────────
// Generic adapter for sites that don't expose RSS / aren't Substack/Beehiiv.
// Strategy:
//   1. Fetch the homepage HTML directly (with timeout + bot-friendly UA).
//   2. Find <article>/<a> links one level deep (max 15) — these are likely
//      headline articles.
//   3. For each, fetch + strip + extract via the shared LLM extractor.
//
// Limitations: Cloudflare bot-detection, JS-rendered SPAs, paywalls — these
// will all return short / zero text and the extractor will produce no signals.
// We don't fight Cloudflare; we let those pages fail gracefully and surface
// in the admin's last_crawl_status.

import { extractSignalsFromText } from './extractor'
import type { CrawlTarget, ExtractResult } from './types'

const FETCH_TIMEOUT_MS = 30_000

async function fetchWithTimeout(url: string, ms: number = FETCH_TIMEOUT_MS): Promise<string> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: {
        'User-Agent':      'Mozilla/5.0 (compatible; AtelierCrawler/1.0; +https://markdekock.com/atelier)',
        'Accept':          'text/html, */*;q=0.5',
        'Accept-Language': 'nl,en;q=0.8',
      },
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(t)
  }
}

// ── Discover: find article-like links one level deep ────────────────────────

export async function discoverGenericTargets(rootUrl: string, maxPages: number): Promise<CrawlTarget[]> {
  let html: string
  try {
    html = await fetchWithTimeout(rootUrl)
  } catch {
    return []
  }

  const root = new URL(rootUrl)
  const targets = new Map<string, CrawlTarget>()

  // Collect all anchor href + text. Then filter to article-like internal links.
  const anchorRe = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = anchorRe.exec(html)) !== null && targets.size < maxPages) {
    const href = m[1]
    const text = m[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().slice(0, 200)
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) continue

    // Resolve relative URLs against root
    let absolute: URL
    try {
      absolute = new URL(href, rootUrl)
    } catch { continue }

    // Same host only — we don't want to crawl links to twitter, instagram, etc
    if (absolute.hostname !== root.hostname) continue
    // Skip the root + obvious non-article paths
    if (absolute.pathname === '/' || absolute.pathname === root.pathname) continue
    if (/\/(tag|category|author|page|search|subscribe|login|signin|account|privacy|terms|about|contact|cart|checkout)\//.test(absolute.pathname)) continue
    // Article pages tend to have at least 3 path segments OR a slug with hyphens
    const looksLikeArticle = absolute.pathname.split('/').filter(Boolean).length >= 2 || /-/.test(absolute.pathname)
    if (!looksLikeArticle) continue
    // Skip if anchor text is too short (likely nav)
    if (text.length < 8) continue

    const key = absolute.toString().split('#')[0]
    if (!targets.has(key)) {
      targets.set(key, { url: key, title: text || undefined })
    }
  }

  return Array.from(targets.values()).slice(0, maxPages)
}

// ── Extract: fetch one page, strip, hand to LLM ──────────────────────────────

function htmlToText(html: string): string {
  let body = html
  // Try to scope to <article>...</article> first; fall back to <main>; then full doc
  const articleMatch = /<article[\s\S]*?>([\s\S]*?)<\/article>/i.exec(body)
  if (articleMatch) body = articleMatch[1]
  else {
    const mainMatch = /<main[\s\S]*?>([\s\S]*?)<\/main>/i.exec(body)
    if (mainMatch) body = mainMatch[1]
  }

  body = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<header\b[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, ' ')
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

export async function extractGenericPage(target: CrawlTarget): Promise<ExtractResult> {
  let html: string
  try {
    html = await fetchWithTimeout(target.url)
  } catch (err) {
    return {
      url: target.url, title: target.title ?? null,
      trend_claim: null, signals: [],
      excerpt: null, extractor: 'generic_webfetch',
      error_message: `Fetch faalde: ${err instanceof Error ? err.message.slice(0, 200) : 'unknown'}`,
    }
  }

  const text = htmlToText(html)
  return extractSignalsFromText({
    url:       target.url,
    title:     target.title,
    rawText:   text,
    extractor: 'generic_webfetch',
  })
}
