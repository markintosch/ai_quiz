-- ─────────────────────────────────────────────────────────────────────────────
-- migration_pmpcompass_source.sql
-- Voegt source-tracking toe aan perimenopause_compass_assessments.
-- Claude kiest een experiment uit de curated library (src/lib/peri-compass/
-- experiments.ts). We slaan de code, source-label en source-URL apart op zodat
-- ze gerenderd kunnen worden onder het experiment in de UI + email.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE perimenopause_compass_assessments
  ADD COLUMN IF NOT EXISTS ai_micro_experiment_code        TEXT,
  ADD COLUMN IF NOT EXISTS ai_micro_experiment_source      TEXT,
  ADD COLUMN IF NOT EXISTS ai_micro_experiment_source_url  TEXT;

NOTIFY pgrst, 'reload schema';

-- Verify:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'perimenopause_compass_assessments'
--     AND column_name LIKE 'ai_micro_experiment%';
