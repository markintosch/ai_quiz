-- ─────────────────────────────────────────────────────────────────────────────
-- migration_cycle_symptoms.sql
-- Adds binary symptom tracking + two context flags (nap_taken, busy_day) to
-- cycle_daily_entries. Symptoms stored as text array using stable keys
-- (brain_fog, dizzy, headache, etc.). Display labels live in the app.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE cycle_daily_entries
  ADD COLUMN IF NOT EXISTS symptoms  TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nap_taken BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS busy_day  BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for symptom-based insight queries
CREATE INDEX IF NOT EXISTS idx_cycle_daily_symptoms
  ON cycle_daily_entries USING GIN (symptoms);
