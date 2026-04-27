-- ============================================================
-- AI-benchmark — research instrument for marketing & sales.
-- Single table; one row per submitted assessment.
-- RLS enabled, no policies — all writes/reads happen server-side
-- via SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_benchmark_responses (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Respondent
  name              TEXT,
  email             TEXT         NOT NULL,
  lang              TEXT         DEFAULT 'nl',
  marketing_consent BOOLEAN      DEFAULT FALSE,

  -- Segmentation
  role              TEXT         NOT NULL, -- marketing | sales | hybrid
  seniority         TEXT,                  -- ic | manager | director | vp | founder
  industry          TEXT,
  company_size      TEXT,
  region            TEXT,

  -- Answers + scoring
  answers           JSONB        NOT NULL, -- { q1: [...], q2: '...', ... }
  dimension_scores  JSONB        NOT NULL, -- { adoption: 73, workflow: 65, ... }
  total_score       INT          NOT NULL, -- 0-100
  archetype         TEXT         NOT NULL, -- pragmatist | power_user | curious_skeptic | strategist | lagging_builder | shadow_operator

  -- Meta
  ip                TEXT,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_benchmark_email_idx     ON ai_benchmark_responses (email);
CREATE INDEX IF NOT EXISTS ai_benchmark_created_idx   ON ai_benchmark_responses (created_at DESC);
CREATE INDEX IF NOT EXISTS ai_benchmark_role_idx      ON ai_benchmark_responses (role);
CREATE INDEX IF NOT EXISTS ai_benchmark_archetype_idx ON ai_benchmark_responses (archetype);

ALTER TABLE ai_benchmark_responses ENABLE ROW LEVEL SECURITY;
