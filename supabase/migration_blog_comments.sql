-- ─────────────────────────────────────────────────────────────────────────────
-- migration_blog_comments.sql
-- Reacties op blog posts. Moderation-by-default: alle nieuwe reacties komen
-- binnen als status='pending', Mark keurt ze goed in /admin/blog/comments.
--
-- AVG:
--   - Email wordt opgeslagen voor moderatie-doeleinden (spam-check, reply
--     mogelijk maken). Email is NOOIT publiek zichtbaar — alleen naam.
--   - Consent-vinkje verplicht in API. consent_text wordt mee opgeslagen
--     zodat we kunnen reproduceren waarmee iemand akkoord ging.
--   - Recht op verwijdering: admin DELETE-route + cascade van auteur-data.
--
-- Anti-spam:
--   - status='pending' default → niets is publiek zonder admin-actie
--   - source_ip + user_agent opgeslagen voor patroon-detectie
--   - Rate-limit op POST in API (5 reacties per IP per uur)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  -- Auteur (publiek: alleen author_name; email is intern)
  author_name     TEXT NOT NULL,
  author_email    TEXT NOT NULL,
  body            TEXT NOT NULL,
  -- Moderation
  status          TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'spam', 'rejected')),
  approved_at     TIMESTAMPTZ,
  rejected_reason TEXT,
  -- Consent + audit
  consent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_text    TEXT,
  source_ip       TEXT,
  user_agent      TEXT,
  -- Optionele parent voor threading (toekomst — niet meteen UI gebruiken)
  parent_id       UUID REFERENCES blog_comments(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (length(author_name) > 0 AND length(author_name) <= 80),
  CHECK (length(body) > 0 AND length(body) <= 4000),
  CHECK (position('@' in author_email) > 1)
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_status
  ON blog_comments (post_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status_created
  ON blog_comments (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_email_lower
  ON blog_comments (LOWER(author_email));

-- updated_at trigger
CREATE OR REPLACE FUNCTION blog_comments_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_comments_updated_at ON blog_comments;
CREATE TRIGGER trg_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW EXECUTE FUNCTION blog_comments_set_updated_at();

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- ── RLS: alleen approved reacties zijn publiek leesbaar ──────────────────
DROP POLICY IF EXISTS blog_comments_public_read ON blog_comments;
CREATE POLICY blog_comments_public_read ON blog_comments
  FOR SELECT
  USING (status = 'approved');

-- INSERT/UPDATE/DELETE alleen via service-role (POST API + admin moderation).
-- Geen anon-policies → kan niet via anon-key spammen of dumpen.

NOTIFY pgrst, 'reload schema';

-- ── Verify ────────────────────────────────────────────────────────────────
-- SELECT rowsecurity FROM pg_tables WHERE tablename = 'blog_comments';
-- Expect: true
