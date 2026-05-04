-- ─────────────────────────────────────────────────────────────────────────────
-- migration_atelier_v09.sql
-- Atelier v0.9 — track when external data was fetched (for transparency
-- in the UI: "Bron: CBS StatLine — laatst opgehaald: 2026-05-04 14:22").
--
-- Adds data_fetched_at to audience_signals / references / live_signals.
-- created_at = when row was written; data_fetched_at = when the underlying
-- external source was queried. Different for cached/refreshed data.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE atelier_audience_signals
  ADD COLUMN IF NOT EXISTS data_fetched_at TIMESTAMPTZ;

ALTER TABLE atelier_references
  ADD COLUMN IF NOT EXISTS data_fetched_at TIMESTAMPTZ;

ALTER TABLE atelier_live_signals
  ADD COLUMN IF NOT EXISTS data_fetched_at TIMESTAMPTZ;

-- Backfill: voor bestaande rijen is fetched_at gelijk aan created_at
UPDATE atelier_audience_signals SET data_fetched_at = created_at WHERE data_fetched_at IS NULL;
UPDATE atelier_references SET data_fetched_at = created_at WHERE data_fetched_at IS NULL;
UPDATE atelier_live_signals SET data_fetched_at = created_at WHERE data_fetched_at IS NULL;
