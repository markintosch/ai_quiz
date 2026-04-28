-- ============================================================
-- AI-benchmark — funnel event log.
-- One row per client-fired event. Used by the admin funnel view to
-- compute conversion rates from page-view → start → per-question →
-- submit → share.
--
-- RLS enabled, no policies — server inserts via service role,
-- admin reads via service role.
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_benchmark_events (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   TEXT         NOT NULL,
  event_type   TEXT         NOT NULL,
  question_id  TEXT,
  role         TEXT,
  meta         JSONB,
  ip           TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_benchmark_events_created_idx ON ai_benchmark_events (created_at DESC);
CREATE INDEX IF NOT EXISTS ai_benchmark_events_type_idx    ON ai_benchmark_events (event_type);
CREATE INDEX IF NOT EXISTS ai_benchmark_events_session_idx ON ai_benchmark_events (session_id);

ALTER TABLE ai_benchmark_events ENABLE ROW LEVEL SECURITY;
