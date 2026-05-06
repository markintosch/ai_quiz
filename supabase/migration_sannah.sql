-- ─────────────────────────────────────────────────────────────────────────────
-- migration_sannah.sql
-- Sannah De Zwart — portfolio site + CMS backend (Tarr-style verticale scroll).
-- Deadline 2026-05-13: aanmelding Breitner Academy.
--
-- Tabellen:
--   sannah_works  — individuele werken (image, title, year, medium, position)
--   sannah_pages  — over_mij / contact / cv content met draft+published kolommen
--
-- Storage bucket sannah-portfolio (public read) — beelden direct serveerbaar
-- via publieke URL zonder signing.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sannah_works (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Storage path in sannah-portfolio bucket (NIET de full URL — die we
  -- runtime construeren met getPublicUrl)
  image_path   TEXT NOT NULL,
  -- Optioneel: aparte thumb voor sneller laden in werk-overzicht
  thumb_path   TEXT,
  title        TEXT,
  year         TEXT,             -- text om "2023–2024" of "lopend" toe te staan
  medium       TEXT,
  description  TEXT,             -- korte caption per werk (optioneel)
  position     INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,  -- draft/preview vs live
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sannah_works_position ON sannah_works (position);
CREATE INDEX IF NOT EXISTS idx_sannah_works_published ON sannah_works (is_published);
ALTER TABLE sannah_works ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS sannah_pages (
  page_key       TEXT PRIMARY KEY CHECK (page_key IN ('over_mij','contact','cv','homepage')),
  -- Published versions (publieke site leest deze)
  body_nl        TEXT,
  body_en        TEXT,
  -- Draft versions (admin bewerkt deze; "publish" knop kopieert draft → body)
  draft_body_nl  TEXT,
  draft_body_en  TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE sannah_pages ENABLE ROW LEVEL SECURITY;

-- Seed de 4 paginas met lege drafts (Sannah vult ze via /admin/sannah/pages)
INSERT INTO sannah_pages (page_key, draft_body_nl) VALUES
  ('homepage',  'Sannah De Zwart — beeldend vormgever en docent.'),
  ('over_mij',  '...'),
  ('contact',   'info@sannahdezwart.nl'),
  ('cv',        '## Opleiding\n\n## Exposities\n\n## Publicaties')
ON CONFLICT (page_key) DO NOTHING;

-- ── Storage bucket (public read; admin uploadt via service role) ──────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('sannah-portfolio', 'sannah-portfolio', true)
ON CONFLICT (id) DO NOTHING;
