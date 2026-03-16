-- ── CMS: site_content table ─────────────────────────────────────────────────
-- Stores per-locale overrides for homepage (landing) copy.
-- The app deep-merges these on top of the JSON message files at runtime.
-- Only the landing section is managed here; other sections (quiz, results)
-- remain in the JSON files and are not overridden via the CMS.

CREATE TABLE IF NOT EXISTS site_content (
  locale      TEXT PRIMARY KEY,          -- 'en' | 'nl'
  content     JSONB NOT NULL DEFAULT '{}', -- partial landing section JSON
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed empty rows so the CMS page has something to read
INSERT INTO site_content (locale, content)
VALUES ('en', '{}'), ('nl', '{}')
ON CONFLICT (locale) DO NOTHING;

-- Service role can read/write (used by admin API)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on site_content"
  ON site_content FOR ALL
  USING (true)
  WITH CHECK (true);
