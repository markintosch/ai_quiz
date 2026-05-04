-- FILE: supabase/migration_maritime_scan.sql
-- ──────────────────────────────────────────────────────────────────────────────
-- Maritime Compliance Readiness Scan — single response table.
-- Mirrors ai_benchmark_responses pattern. RLS enabled (service-role only).
-- Run in Supabase SQL editor before deploying.

CREATE TABLE IF NOT EXISTS maritime_scan_responses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ      DEFAULT now(),

  -- Lead
  name              TEXT,
  email             TEXT NOT NULL,
  lang              TEXT DEFAULT 'nl',
  marketing_consent BOOLEAN DEFAULT false,

  -- Cohort segmentation
  role              TEXT NOT NULL,    -- 'crew_manning' | 'compliance_dpa' | 'fleet_ops' | 'leadership'
  vessel_type       TEXT,             -- 'tanker' | 'container' | 'offshore' | 'ferry_cruise' | 'bulk' | 'mixed'
  fleet_size        TEXT,             -- '1_4' | '5_20' | '21_50' | '51_150' | '150_plus'
  region            TEXT,             -- 'nw_europe' | 'greek_cypriot' | 'singapore_uae' | 'americas' | 'asia_other' | 'global'
  flag_count        TEXT,             -- '1' | '2_3' | '4_7' | '8_plus' | 'flag_state'

  -- Scoring outputs (computed at submit time)
  answers           JSONB NOT NULL,
  dimension_scores  JSONB NOT NULL,
  total_score       INT  NOT NULL,
  posture           TEXT NOT NULL,    -- 'at_risk' | 'patchwork' | 'managed' | 'connected' | 'hardened'

  -- Diagnostics
  ip                TEXT,
  user_agent        TEXT
);

-- Indexes for the few queries we actually run
CREATE INDEX IF NOT EXISTS maritime_scan_responses_created_at_idx ON maritime_scan_responses (created_at DESC);
CREATE INDEX IF NOT EXISTS maritime_scan_responses_role_idx       ON maritime_scan_responses (role);
CREATE INDEX IF NOT EXISTS maritime_scan_responses_email_idx      ON maritime_scan_responses (email);

-- RLS — service role only (no public read or write)
ALTER TABLE maritime_scan_responses ENABLE ROW LEVEL SECURITY;

-- No CREATE POLICY needed: with RLS on and no policies, only service_role bypasses.
-- The submit route uses SUPABASE_SERVICE_ROLE_KEY; the public anon key cannot read or write.

-- Sanity: anyone with service_role can confirm by:
--   SELECT count(*) FROM maritime_scan_responses;  -- works
--   With anon key from browser console: 401 / empty.
