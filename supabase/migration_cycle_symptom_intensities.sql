-- ─────────────────────────────────────────────────────────────────────────────
-- migration_cycle_symptom_intensities.sql
-- Adds per-symptom intensity (1-5) layered on top of the existing
-- symptoms TEXT[] presence column. Stored as JSONB { key: intensity }.
-- Empty object {} means no intensities recorded (presence-only).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE cycle_daily_entries
  ADD COLUMN IF NOT EXISTS symptom_intensities JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Sanity check constraint: values must be integers 1-5. Enforced at insert
-- time, but the app should also validate to give friendly errors.
ALTER TABLE cycle_daily_entries
  DROP CONSTRAINT IF EXISTS cycle_symptom_intensities_valid;

ALTER TABLE cycle_daily_entries
  ADD CONSTRAINT cycle_symptom_intensities_valid CHECK (
    jsonb_typeof(symptom_intensities) = 'object'
  );
