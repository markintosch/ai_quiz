-- ─────────────────────────────────────────────────────────────────────────────
-- migration_sannahremco.sql
-- Briefings collected at /SannahRemco (one landing, two forms):
--   - sannah_portfolio  (Template 1 — Online Portfolio voor Sannah)
--   - remco_presence    (Template 2 — Online Presence voor Remco)
--
-- + private storage bucket for any screenshots / files they upload.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS briefings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_type   TEXT NOT NULL CHECK (briefing_type IN ('sannah_portfolio', 'remco_presence')),
  name            TEXT,
  email           TEXT,
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  uploads         JSONB NOT NULL DEFAULT '[]'::jsonb,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_briefings_type_created
  ON briefings (briefing_type, created_at DESC);

-- RLS: enabled, no policies. Service-role key bypasses RLS for admin reads.
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

-- ── Storage bucket (private; admin uses signed URLs) ─────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('sannahremco-uploads', 'sannahremco-uploads', false)
ON CONFLICT (id) DO NOTHING;
