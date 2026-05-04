-- FILE: supabase/migration_atelier_source_extracts.sql
-- ──────────────────────────────────────────────────────────────────────────────
-- Per crawled URL: the extracted signals + minimal metadata.
-- Raw HTML is NOT stored — we only keep what the extractor distilled.
--
-- Storage budget: ~1KB per row × ~30 pages × 14 sources = ~400KB per crawl.
-- Even 100 crawl rounds is ~40MB. Trivial.
--
-- Also adds a `last_crawled_at` column to atelier_sources so the admin UI
-- can show freshness per source.

CREATE TABLE IF NOT EXISTS atelier_source_extracts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     UUID NOT NULL REFERENCES atelier_sources(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,                                -- canonical URL of the extracted page
  title         TEXT,                                         -- best-effort page title
  signals       JSONB NOT NULL DEFAULT '[]'::jsonb,           -- array of { claim, evidence?, tag? }
  trend_claim   TEXT,                                         -- one-sentence "what this page is signalling"
  excerpt       TEXT,                                         -- ~300-char snippet so the admin can sanity-check
  extracted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extractor     TEXT,                                         -- 'substack' | 'beehiiv' | 'generic_webfetch' | 'failed'
  error_message TEXT                                          -- non-null when extractor failed for this URL
);

-- Idempotent: re-crawling the same URL inside the same source updates the row,
-- doesn't duplicate. (We use ON CONFLICT in the runner.)
CREATE UNIQUE INDEX IF NOT EXISTS uq_atelier_source_extracts_source_url
  ON atelier_source_extracts (source_id, url);

CREATE INDEX IF NOT EXISTS idx_atelier_source_extracts_source_id
  ON atelier_source_extracts (source_id);

CREATE INDEX IF NOT EXISTS idx_atelier_source_extracts_extracted_at
  ON atelier_source_extracts (extracted_at DESC);

-- Enable signal text search via OR-ilike from the Inzichten endpoint
CREATE INDEX IF NOT EXISTS idx_atelier_source_extracts_trend_gin
  ON atelier_source_extracts USING GIN (to_tsvector('simple', COALESCE(trend_claim, '') || ' ' || COALESCE(title, '')));

ALTER TABLE atelier_source_extracts ENABLE ROW LEVEL SECURITY;

-- Add freshness column to atelier_sources (idempotent — only added if missing)
ALTER TABLE atelier_sources
  ADD COLUMN IF NOT EXISTS last_crawled_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_crawl_status TEXT,            -- 'ok' | 'partial' | 'failed' | 'paywalled'
  ADD COLUMN IF NOT EXISTS last_crawl_pages INT,              -- pages successfully extracted in last run
  ADD COLUMN IF NOT EXISTS last_crawl_errors INT;             -- pages that errored
