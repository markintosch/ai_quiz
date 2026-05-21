-- ── AI Governance introductiemiddag — voorinschrijvingen ────────────────────
-- Stores pre-registrations submitted via /ai-governance (POST /api/ai-governance
-- /signup). Read in admin at /admin/ai-governance/signups. Writes/reads happen
-- with the service-role key, so RLS is enabled with no public policies (locked
-- down to server-side service access only).

CREATE TABLE IF NOT EXISTS ai_governance_signups (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  email         text NOT NULL,
  organisation  text,
  role          text,
  company_size  text,
  question      text,
  consent       boolean DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_governance_signups_created_idx
  ON ai_governance_signups (created_at DESC);

ALTER TABLE ai_governance_signups ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (server) may read/write.
