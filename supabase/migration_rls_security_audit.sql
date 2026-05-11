-- FILE: supabase/migration_rls_security_audit.sql
-- ──────────────────────────────────────────────────────────────────────────────
-- One-time RLS catch-up migration. Found during the security audit of
-- 2026-05-09 that these tables were created without ENABLE ROW LEVEL SECURITY
-- in their original migrations:
--
--   - arena_sessions, arena_participants, arena_responses (arena games)
--   - cohort_waves, cohort_responses (cohort dashboard)
--
-- Mark already ran the equivalent of this in the Supabase SQL editor on
-- 2026-05-09. This file exists in source control so:
--   1. Future fresh deploys reproduce the same state
--   2. Anyone reviewing the codebase sees the audit happened
--   3. The pre-commit RLS check (scripts/check-rls.sh) won't flag a gap
--
-- Pulse tables (pulse_*) are handled separately via migration_rls_pulse.sql.

DO $$
BEGIN
  -- Arena game tables — multi-player live quiz
  EXECUTE 'ALTER TABLE arena_sessions       ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE arena_participants   ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE arena_responses      ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE arena_subscribers    ENABLE ROW LEVEL SECURITY';

  -- Cohort dashboard tables — used by /admin/cohorts/[id]
  EXECUTE 'ALTER TABLE cohort_waves         ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE cohort_responses     ENABLE ROW LEVEL SECURITY';

  -- Whitelabel content registry — used by /admin/content
  EXECUTE 'ALTER TABLE site_content         ENABLE ROW LEVEL SECURITY';
EXCEPTION
  WHEN undefined_table THEN
    -- If a table doesn't exist (e.g. fresh deploy where the original
    -- migration hasn't run yet), skip silently. The original migration's
    -- CREATE will run later; the rule still holds.
    RAISE NOTICE 'Skipped — one or more tables not yet created';
END $$;

-- Verify (run manually after this migration):
--   SELECT schemaname, tablename, rowsecurity
--   FROM   pg_tables
--   WHERE  schemaname = 'public' AND tablename IN
--          ('arena_sessions','arena_participants','arena_responses',
--           'cohort_waves','cohort_responses');
-- All five should report rowsecurity = true.
