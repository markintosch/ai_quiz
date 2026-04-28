-- ============================================================
-- AI-benchmark — moderation queue for "Other, namelijk…" write-ins.
-- Each unique normalized text per question is a single row; subsequent
-- mentions increment count + update last_seen. Used by the admin
-- moderation page to surface tools/use-cases worth promoting to the
-- canonical option list.
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_benchmark_writeins (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   TEXT         NOT NULL,
  raw_text      TEXT         NOT NULL,
  normalized    TEXT         NOT NULL,
  status        TEXT         DEFAULT 'pending',  -- pending | reviewed | promoted | merged | rejected
  count         INT          DEFAULT 1,
  first_seen    TIMESTAMPTZ  DEFAULT NOW(),
  last_seen     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ai_benchmark_writeins_unique_idx
  ON ai_benchmark_writeins (question_id, normalized);
CREATE INDEX IF NOT EXISTS ai_benchmark_writeins_count_idx
  ON ai_benchmark_writeins (count DESC);
CREATE INDEX IF NOT EXISTS ai_benchmark_writeins_status_idx
  ON ai_benchmark_writeins (status);

ALTER TABLE ai_benchmark_writeins ENABLE ROW LEVEL SECURITY;
