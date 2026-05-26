-- ── AI Leiderschap — voorinschrijvingen (waitlist) ──────────────────────────
-- Stores soft pre-registrations from the /ai-leiderschap page for people who
-- can't attend the locked-in event date. Read in admin at
-- /admin/ai-leiderschap/waitlist. Writes/reads use the service-role key, so
-- RLS is enabled with no public policies (server-side service access only).

CREATE TABLE IF NOT EXISTS leiderschap_waitlist (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL,
  organisation  text,
  role          text,
  preference    text,
  consent       boolean DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leiderschap_waitlist_created_idx
  ON leiderschap_waitlist (created_at DESC);

ALTER TABLE leiderschap_waitlist ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (server) may read/write.
