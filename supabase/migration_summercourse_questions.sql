-- ── Summer Course — public question form submissions ────────────────────────
-- The /summercourse page has a "still have a question?" form. Each submission
-- lands here AND triggers an email to mark@brandpwrdmedia.com. Admin reads
-- via service role at /admin/summercourse/questions.
--
-- RLS enabled, no policies — server-only access (service role bypasses RLS).

CREATE TABLE IF NOT EXISTS summercourse_questions (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT         NOT NULL,
  message    TEXT         NOT NULL,
  status     TEXT         NOT NULL DEFAULT 'new',  -- new | answered | spam
  ip         TEXT,
  user_agent TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS summercourse_questions_created_idx ON summercourse_questions (created_at DESC);
CREATE INDEX IF NOT EXISTS summercourse_questions_status_idx  ON summercourse_questions (status);

ALTER TABLE summercourse_questions ENABLE ROW LEVEL SECURITY;
