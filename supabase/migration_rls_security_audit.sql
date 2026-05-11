-- FILE: supabase/migration_rls_security_audit.sql
-- ──────────────────────────────────────────────────────────────────────────────
-- One-time RLS catch-up migration. Found during the security audit of
-- 2026-05-09 that these tables were created without ENABLE ROW LEVEL SECURITY
-- in their original migrations:
--
--   - arena_questions, arena_sessions, arena_participants, arena_answers
--     (cloud arena games)
--   - arena_subscribers (arena scheduled notifications)
--   - cohort_waves, cohort_responses (cohort dashboard)
--   - site_content (whitelabel CMS)
--
-- Each ALTER TABLE is wrapped in its own DO block with EXCEPTION handler so
-- ONE missing table doesn't abort the others. Re-runnable / idempotent.

DO $$ BEGIN
  EXECUTE 'ALTER TABLE arena_questions     ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'arena_questions does not exist — skipped';
END $$;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE arena_sessions      ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'arena_sessions does not exist — skipped';
END $$;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE arena_participants  ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'arena_participants does not exist — skipped';
END $$;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE arena_answers       ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'arena_answers does not exist — skipped';
END $$;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE arena_subscribers   ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'arena_subscribers does not exist — skipped';
END $$;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE cohort_waves        ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'cohort_waves does not exist — skipped';
END $$;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE cohort_responses    ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'cohort_responses does not exist — skipped';
END $$;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE site_content        ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'site_content does not exist — skipped';
END $$;

-- Verify after running:
--   SELECT schemaname, tablename, rowsecurity
--   FROM   pg_tables
--   WHERE  schemaname = 'public'
--     AND  tablename IN (
--       'arena_questions','arena_sessions','arena_participants','arena_answers',
--       'arena_subscribers','cohort_waves','cohort_responses','site_content'
--     );
-- Each should report rowsecurity = true.
