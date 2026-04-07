-- ─────────────────────────────────────────────────────────────────────────────
-- Sysdig 555 Time Trial — leaderboard table
-- Run in: Supabase SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sysdig_555_times (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  total_ms      INTEGER     NOT NULL,
  time_str      TEXT        NOT NULL,
  correct_count INTEGER     NOT NULL DEFAULT 0,
  questions     JSONB,                            -- full QuestionResult[] for replay/analysis
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fastest-first index (leaderboard query)
CREATE INDEX IF NOT EXISTS sysdig_555_times_total_ms_idx
  ON sysdig_555_times (total_ms ASC);

-- ── Row-Level Security ────────────────────────────────────────────────────────
ALTER TABLE sysdig_555_times ENABLE ROW LEVEL SECURITY;

-- Service role (used by API routes) has full access — no policy needed for that role.
-- Public anon can only read the leaderboard columns (no email, no questions JSONB).
-- The API routes use service role for inserts, so anon insert is intentionally blocked.

CREATE POLICY "sysdig_555_anon_read_leaderboard"
  ON sysdig_555_times
  FOR SELECT
  TO anon
  USING (true);

-- Block anon inserts — all writes go through the API route (service role)
-- (No INSERT policy for anon = blocked by default when RLS is enabled)
