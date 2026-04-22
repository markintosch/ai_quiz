-- ============================================================
-- RLS fix — lead-capture tables flagged CRITICAL by the
-- Supabase Security Advisor (April 2026).
--
-- All inserts happen server-side via SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS. Enabling RLS with no policies blocks
-- all anon/authenticated access — exactly what we want for
-- lead data (PII) that should never be readable from the client.
--
-- Non-breaking: existing API routes continue to work.
-- ============================================================

ALTER TABLE IF EXISTS cx_essense_leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS energy_profile_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS marketing_scan_leads ENABLE ROW LEVEL SECURITY;
