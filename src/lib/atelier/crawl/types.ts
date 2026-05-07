// FILE: src/lib/atelier/crawl/types.ts
// ──────────────────────────────────────────────────────────────────────────────
// Shared types for the source-crawl pipeline. Keeps adapter signatures
// uniform so the runner can swap them based on URL pattern.

export interface CrawlTarget {
  url:   string
  title?: string  // optional pre-known title (some adapters get this from index)
}

export interface ExtractedSignal {
  claim:    string                // 1-sentence factual / observed claim
  evidence?: string                // optional short quote or context
  tag?:     string                 // optional category — "trend" | "behaviour" | "stat" | "quote"
}

export interface ExtractResult {
  url:           string
  title:         string | null
  trend_claim:   string | null    // 1-line "what does this page signal"
  signals:       ExtractedSignal[]
  excerpt:       string | null    // first 300 chars of source text for sanity-check
  extractor:     string           // 'substack' | 'beehiiv' | 'generic_webfetch'
  error_message: string | null    // populated when extraction failed
}

export interface CrawlResult {
  source_id:      string
  pages_attempted: number
  pages_extracted: number
  pages_errored:   number
  status:        'ok' | 'partial' | 'failed' | 'paywalled'
  results:       ExtractResult[]
}

// Adapter contract — given a source URL + max_pages, return targets to extract.
export type DiscoverFn = (rootUrl: string, maxPages: number) => Promise<CrawlTarget[]>
// Adapter contract — given one target, extract signals.
export type ExtractFn  = (target: CrawlTarget) => Promise<ExtractResult>
