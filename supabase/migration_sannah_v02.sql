-- ─────────────────────────────────────────────────────────────────────────────
-- migration_sannah_v02.sql
-- Sannah portfolio — voeg optionele foto's toe per pagina (Over / CV / Contact).
-- Foto's zijn taal-onafhankelijk: één lijst geldt voor NL én EN versie.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE sannah_pages
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Voorbeeld-shape per item: { "path": "pages/over/abc.jpg", "alt": "..." }
