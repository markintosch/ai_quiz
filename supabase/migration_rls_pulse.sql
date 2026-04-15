-- ============================================================
-- RLS fix — enable Row Level Security on all Pulse tables.
--
-- These tables were created in migration_pulse.sql and
-- migration_pulse_v2.sql without RLS, which triggers Supabase
-- security advisor warnings.
--
-- All reads/writes go through SUPABASE_SERVICE_ROLE_KEY
-- (server-side API routes only), so enabling RLS with no
-- permissive anon policies is the correct posture — it means
-- the anon/authenticated roles see nothing unless explicitly
-- granted, while the service role bypasses RLS as always.
--
-- Run once in Supabase SQL Editor.
-- Safe to re-run (IF EXISTS guards all statements).
-- ============================================================

-- Pulse v1 tables
ALTER TABLE IF EXISTS pulse_suggestions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pulse_responses          ENABLE ROW LEVEL SECURITY;

-- Pulse v2 tables
ALTER TABLE IF EXISTS pulse_themes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pulse_entities           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pulse_dimensions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pulse_responses_v2       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pulse_leads              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pulse_suggestions_v2     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pulse_agent_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pulse_anomaly_flags      ENABLE ROW LEVEL SECURITY;

-- Verify: run this SELECT after applying to confirm all tables
-- show rls_enabled = true:
--
-- SELECT tablename, rowsecurity
-- FROM   pg_tables
-- WHERE  schemaname = 'public'
--   AND  tablename  LIKE 'pulse%'
-- ORDER  BY tablename;
