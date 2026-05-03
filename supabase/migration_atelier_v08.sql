-- ─────────────────────────────────────────────────────────────────────────────
-- migration_atelier_v08.sql
-- Atelier v0.8 — sources registry. Maakt zichtbaar waar Atelier zijn
-- inzichten uit haalt: archive corpus, web_search, inferred, en (later)
-- echte Street Signal feeds + Ground Truth research datasets.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS atelier_sources (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     TEXT NOT NULL CHECK (category IN (
    'reference',       -- archive of curated creative references (Tomas's archive)
    'street_signal',   -- live, observed feeds (social listening, brand-mention, etc)
    'ground_truth',    -- research datasets, segmentations, surveys
    'web',             -- web search providers (Anthropic web_search, eventual SerpAPI etc)
    'inferred'         -- model knowledge fallback — always present, never disabled
  )),
  name         TEXT NOT NULL,
  description  TEXT,
  url          TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  added_by     TEXT,                                 -- email or 'system'
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atelier_sources_category ON atelier_sources (category);
CREATE INDEX IF NOT EXISTS idx_atelier_sources_active ON atelier_sources (active);
ALTER TABLE atelier_sources ENABLE ROW LEVEL SECURITY;

-- Seed: register the sources Atelier already has (so the page shows iets vanaf
-- start). Idempotent via unique (category, name) combinatie.
CREATE UNIQUE INDEX IF NOT EXISTS uq_atelier_sources_cat_name
  ON atelier_sources (category, name);

INSERT INTO atelier_sources (category, name, description, url, metadata, active, added_by) VALUES
  ('reference',
   'Atelier seed corpus',
   'Curated set van 10 NL/EU creatieve landmark-referenties (Heineken, KPN, Jumbo, Rituals, Oxfam, Patagonia, AH, ING, Gucci, Oatly). In code: src/lib/atelier/seed-corpus.ts',
   NULL,
   '{"item_count": 10, "language": "nl", "code_path": "src/lib/atelier/seed-corpus.ts"}'::jsonb,
   TRUE,
   'system'),
  ('web',
   'Anthropic web_search',
   'Claude tools-API web search (web_search_20250305). Gebruikt in Module 5 (live signals). Falls back naar inferred als de tool niet beschikbaar is voor het account/model.',
   'https://docs.anthropic.com/en/docs/build-with-claude/tool-use',
   '{"tool_name": "web_search", "tool_version": "20250305", "max_uses_per_call": 5}'::jsonb,
   TRUE,
   'system'),
  ('inferred',
   'Claude knowledge (fallback)',
   'Sonnet/Haiku-modelkennis tot trainingscutoff. Gebruikt als geen externe bron beschikbaar is. Altijd gemarkeerd als provenance "inferred" in de UI.',
   NULL,
   '{"models": ["claude-sonnet-4-6", "claude-haiku-4-5"]}'::jsonb,
   TRUE,
   'system')
ON CONFLICT (category, name) DO NOTHING;
