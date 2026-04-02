-- Sysdig 555 Benchmark Self-Assessment — lead capture table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS sysdig_scan_leads (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  overall_score    INTEGER,
  tier             TEXT,
  dimension_scores JSONB,              -- { detection: 72, alertquality: 45, ... }
  answers          JSONB,              -- raw answer map { "det-1": 3, ... }
  opt_newsletter   BOOLEAN DEFAULT FALSE,
  opt_expert       BOOLEAN DEFAULT FALSE,
  opt_download     BOOLEAN DEFAULT FALSE,
  followed_up      BOOLEAN DEFAULT FALSE,  -- manual CRM checkbox for sales
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookup by email
CREATE INDEX IF NOT EXISTS idx_sysdig_scan_leads_email ON sysdig_scan_leads (email);

-- RLS: service role only (no public access)
ALTER TABLE sysdig_scan_leads ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by API route)
CREATE POLICY "service role full access" ON sysdig_scan_leads
  FOR ALL USING (auth.role() = 'service_role');
