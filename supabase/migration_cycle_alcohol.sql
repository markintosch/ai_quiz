-- ─────────────────────────────────────────────────────────────────────────────
-- migration_cycle_alcohol.sql
-- Add alcohol tracking to Cycle Companion. One column, one tap input,
-- one insight rule.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE cycle_daily_entries
  ADD COLUMN IF NOT EXISTS alcohol_glasses SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE cycle_daily_entries
  DROP CONSTRAINT IF EXISTS cycle_daily_entries_alcohol_glasses_check;

ALTER TABLE cycle_daily_entries
  ADD CONSTRAINT cycle_daily_entries_alcohol_glasses_check
  CHECK (alcohol_glasses >= 0 AND alcohol_glasses <= 10);
