-- ─────────────────────────────────────────────────────────────────────────────
-- migration_peri_compass_i18n.sql
-- Peri-Compass meertalig: language constraint uitgebreid van (nl,en,de) naar
-- (nl,en,fr,de). Index op language voor cohort-analyse later.
--
-- Idempotent: bestaande rijen blijven geldig, alleen de constraint vervangt
-- de oude variant.
-- ─────────────────────────────────────────────────────────────────────────────

-- Bestaande CHECK constraint heeft een door Postgres gegenereerde naam.
-- We zoeken hem op en droppen, dan de nieuwe toevoegen.
DO $$
DECLARE
  c_name text;
BEGIN
  SELECT con.conname INTO c_name
  FROM pg_constraint con
  JOIN pg_class       cls ON cls.oid = con.conrelid
  WHERE cls.relname = 'perimenopause_compass_assessments'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%language%';
  IF c_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE perimenopause_compass_assessments DROP CONSTRAINT %I', c_name);
  END IF;
END $$;

ALTER TABLE perimenopause_compass_assessments
  ADD CONSTRAINT perimenopause_compass_language_check
  CHECK (language IN ('nl','en','fr','de'));

-- Index voor snelle cohort-filtering per taal (admin + analytics later)
CREATE INDEX IF NOT EXISTS idx_pmpcompass_language
  ON perimenopause_compass_assessments (language);

-- Forceer PostgREST schema-cache reload (anders krijgt Supabase REST 'unknown column' meldingen)
NOTIFY pgrst, 'reload schema';

-- Verify:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
--   WHERE conrelid = 'perimenopause_compass_assessments'::regclass
--   AND contype = 'c';
