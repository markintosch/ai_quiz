-- ============================================================
-- AI-benchmark — community tool votes.
-- One row per (tool_id, session_id). Direction is +1 (upvote) or -1
-- (downvote). To unvote, the row is deleted (server-side via API).
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_benchmark_tool_votes (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id     TEXT         NOT NULL,
  session_id  TEXT         NOT NULL,
  direction   SMALLINT     NOT NULL CHECK (direction IN (-1, 1)),
  ip          TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ai_benchmark_tool_votes_unique
  ON ai_benchmark_tool_votes (tool_id, session_id);
CREATE INDEX IF NOT EXISTS ai_benchmark_tool_votes_tool_idx
  ON ai_benchmark_tool_votes (tool_id);

ALTER TABLE ai_benchmark_tool_votes ENABLE ROW LEVEL SECURITY;
