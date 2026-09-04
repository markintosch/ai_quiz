// FILE: src/lib/signal/sitemap.ts
// ─── Moba Signal — sitemap scanning and new-URL detection ────────────────────
//
// The listing page and the feed show what a source WANTS to headline; the
// sitemap shows everything the site publishes. A URL newly appearing in a
// competitor's sitemap is often the earliest public trace of a launch page, a
// case story or a market page. Each run collects the sitemap, diffs it against
// the seen-URL memory (moba_signal_sitemap_urls), and hands the freshest
// article-like additions to the same extraction pipeline as every other page.
//
// Rules that keep it honest and cheap:
// - The first check per source is a BASELINE: recorded, never reported as new,
//   never crawled. Otherwise adding a source would flood the queue with its
//   whole archive as "new additions".
// - The check never fails a run: a missing or blocked sitemap records
//   found=false and the collection result stands on its own.
// - Public files only (robots.txt and the sitemaps it names), the same
//   bot-honest fetch as everything else. Capped fetches and URL counts.

import { XMLParser } from 'fast-xml-parser'
import { fetchPage } from './crawl'

const MAX_SITEMAP_FETCHES = 8      // index + child sitemaps per check
const MAX_URLS = 2000              // per check; enough for these sites
const KNOWN_URL_FETCH_LIMIT = 5000 // seen-memory read cap, above MAX_URLS

export interface SitemapEntry {
  url: string
  /** As published in <lastmod>, kept verbatim. */
  lastmod?: string
}

// ── Discovery ─────────────────────────────────────────────────────────────────

/** Sitemap URLs named in robots.txt ("Sitemap: <url>" lines, case-insensitive). */
export function parseRobotsSitemaps(robotsTxt: string, baseUrl: string): string[] {
  const out: string[] = []
  for (const line of robotsTxt.split(/\r?\n/)) {
    const m = /^\s*sitemap:\s*(\S+)/i.exec(line)
    if (!m) continue
    try { out.push(new URL(m[1], baseUrl).toString()) } catch { /* malformed line */ }
  }
  return out
}

/** Candidate sitemap URLs for a source, best first. */
export async function discoverSitemaps(sourceUrl: string): Promise<string[]> {
  const origin = new URL(sourceUrl).origin
  const candidates: string[] = []
  try {
    const robots = await fetchPage(`${origin}/robots.txt`)
    candidates.push(...parseRobotsSitemaps(robots, origin))
  } catch { /* no robots.txt is normal */ }
  if (candidates.length === 0) {
    candidates.push(`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`)
  }
  return [...new Set(candidates)]
}

// ── Parsing ───────────────────────────────────────────────────────────────────

type ParsedSitemap =
  | { kind: 'index'; sitemaps: SitemapEntry[] }
  | { kind: 'urlset'; urls: SitemapEntry[] }
  | { kind: 'none' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asArray<T = any>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return []
  return Array.isArray(v) ? v : [v]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function entryOf(node: any): SitemapEntry | null {
  const loc = typeof node?.loc === 'string' ? node.loc : node?.loc?.['#text']
  if (!loc || typeof loc !== 'string') return null
  const lastmod = typeof node?.lastmod === 'string' ? node.lastmod : undefined
  return { url: loc.trim(), lastmod }
}

/** Parse one sitemap document: an index of sitemaps, a urlset, or neither. */
export function parseSitemap(xml: string): ParsedSitemap {
  if (!/<(sitemapindex|urlset)[\s>]/i.test(xml.slice(0, 4000))) {
    // Plain-text sitemaps (one URL per line) are valid per the protocol.
    const lines = xml.split(/\r?\n/).map(l => l.trim()).filter(l => /^https?:\/\//.test(l))
    if (lines.length > 0 && lines.length >= xml.split(/\r?\n/).filter(Boolean).length / 2) {
      return { kind: 'urlset', urls: lines.map(url => ({ url })) }
    }
    return { kind: 'none' }
  }
  const parser = new XMLParser({ ignoreAttributes: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let doc: any
  try { doc = parser.parse(xml) } catch { return { kind: 'none' } }

  const index = asArray(doc?.sitemapindex?.sitemap).map(entryOf).filter(Boolean) as SitemapEntry[]
  if (index.length > 0) return { kind: 'index', sitemaps: index }
  const urls = asArray(doc?.urlset?.url).map(entryOf).filter(Boolean) as SitemapEntry[]
  if (urls.length > 0) return { kind: 'urlset', urls }
  return { kind: 'none' }
}

/**
 * Collect URL entries from the candidate sitemaps, following one level of
 * sitemap indexes, freshest child sitemaps first, within the fetch and URL
 * caps. Compressed (.gz) sitemaps are skipped: not worth a decompression
 * dependency for these sites.
 */
export async function collectSitemapUrls(candidates: string[]): Promise<{ entries: SitemapEntry[]; fetches: number; found: boolean }> {
  const entries = new Map<string, SitemapEntry>()
  let fetches = 0
  let found = false
  const queue = candidates.filter(u => !u.endsWith('.gz')).slice(0, MAX_SITEMAP_FETCHES)

  while (queue.length > 0 && fetches < MAX_SITEMAP_FETCHES && entries.size < MAX_URLS) {
    const url = queue.shift()!
    let body: string
    try {
      body = await fetchPage(url)
      fetches++
    } catch {
      continue
    }
    const parsed = parseSitemap(body)
    if (parsed.kind === 'none') continue
    found = true
    if (parsed.kind === 'index') {
      const children = [...parsed.sitemaps]
        .filter(s => !s.url.endsWith('.gz'))
        .sort((a, b) => (b.lastmod ?? '').localeCompare(a.lastmod ?? ''))
      queue.push(...children.map(c => c.url))
    } else {
      for (const e of parsed.urls) {
        if (entries.size >= MAX_URLS) break
        const clean = e.url.split('#')[0]
        if (!entries.has(clean)) entries.set(clean, { url: clean, lastmod: e.lastmod })
      }
    }
  }
  return { entries: [...entries.values()], fetches, found }
}

// ── The per-run check: collect, diff, remember ────────────────────────────────

export interface SitemapCheck {
  /** False when the source opts out ('off') or no sitemap was found. */
  checked: boolean
  found: boolean
  /** True on the first successful check: everything recorded, nothing "new". */
  baseline: boolean
  totalUrls: number
  fetches: number
  /** Additions since the previous check (empty on the baseline). */
  newEntries: SitemapEntry[]
}

const NO_CHECK: SitemapCheck = { checked: false, found: false, baseline: false, totalUrls: 0, fetches: 0, newEntries: [] }

/**
 * Run the sitemap check for one source: discover, collect, diff against the
 * seen-URL memory, store the additions, stamp the source. Throws only on
 * database errors; fetch and parse problems degrade to found=false.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkSitemap(db: any, source: { id: string; url: string; sitemap_url?: string | null }): Promise<SitemapCheck> {
  if (source.sitemap_url === 'off') return NO_CHECK

  const candidates = source.sitemap_url
    ? [source.sitemap_url]
    : await discoverSitemaps(source.url)
  const { entries, fetches, found } = await collectSitemapUrls(candidates)
  if (!found || entries.length === 0) {
    return { ...NO_CHECK, checked: true, fetches }
  }

  const { data: knownRows, error: knownErr } = await db
    .from('moba_signal_sitemap_urls')
    .select('url')
    .eq('source_id', source.id)
    .limit(KNOWN_URL_FETCH_LIMIT)
  if (knownErr) throw new Error(`sitemap memory read failed: ${knownErr.message}`)
  const known = new Set<string>((knownRows ?? []).map((r: { url: string }) => r.url))

  const baseline = known.size === 0
  const newEntries = entries.filter(e => !known.has(e.url))

  if (newEntries.length > 0) {
    const rows = newEntries.map(e => ({ source_id: source.id, url: e.url, lastmod: e.lastmod ?? null }))
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await db.from('moba_signal_sitemap_urls')
        .upsert(rows.slice(i, i + 500), { onConflict: 'source_id,url', ignoreDuplicates: true })
      if (error) throw new Error(`sitemap memory write failed: ${error.message}`)
    }
  }

  await db.from('moba_signal_sources').update({
    sitemap_checked_at: new Date().toISOString(),
    sitemap_page_count: entries.length,
  }).eq('id', source.id)

  return {
    checked: true, found: true, baseline,
    totalUrls: entries.length, fetches,
    newEntries: baseline ? [] : newEntries,
  }
}

// ── Picking which additions are worth crawling ────────────────────────────────

const SKIP_PATH = /\/(tag|tags|category|categories|author|page|search|subscribe|login|account|privacy|terms|contact|cart|wp-content|wp-json)\//i
const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|mp4|zip|gz|xml|css|js|ico|woff2?)$/i

/**
 * Filter new sitemap entries down to article-like pages worth extracting:
 * same host as the source, content-shaped path, no binary files, freshest
 * lastmod first. Same shape heuristic as the listing-page link discovery.
 */
export function pickCrawlableAdditions(entries: SitemapEntry[], sourceUrl: string, exclude: Set<string>, max: number): SitemapEntry[] {
  let host: string
  try { host = new URL(sourceUrl).hostname } catch { return [] }
  return entries
    .filter(e => {
      let u: URL
      try { u = new URL(e.url) } catch { return false }
      if (u.hostname !== host && !u.hostname.endsWith(`.${host.replace(/^www\./, '')}`)) return false
      if (exclude.has(e.url)) return false
      if (u.pathname === '/' || SKIP_PATH.test(u.pathname) || SKIP_EXT.test(u.pathname)) return false
      return u.pathname.split('/').filter(Boolean).length >= 2 || /-/.test(u.pathname)
    })
    .sort((a, b) => (b.lastmod ?? '').localeCompare(a.lastmod ?? ''))
    .slice(0, max)
}
