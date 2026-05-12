-- ─────────────────────────────────────────────────────────────────────────────
-- migration_blog.sql
-- Blog/CMS for markdekock.com — SEO/GEO findability + frequent updates.
--
-- Layout decisions:
-- 1. URLs:        /blog (NL default)  ?lang=en  ?lang=de   (matches /mentor + /oplossingen pattern)
-- 2. Content:     Tiptap JSON document stored in `content` JSONB column. Rich text with
--                 headings, bold, italic, lists, links, images, video embeds, code blocks.
-- 3. Images:      uploaded to public Supabase Storage bucket `blog-images`.
-- 4. Translations: every post has a `locale` + optional `parent_id` pointing to the source
--                  (NL) post. Claude API generates EN/DE drafts on demand.
-- 5. Two formats: 'article' (long-form SEO essay) or 'update' (short news/case post).
--                 Lets us mix SEO authority pieces with fast-cadence news on one feed.
--
-- IMPORTANT: every new table here ends with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
-- (enforced by the pre-commit hook scripts/check-rls.sh).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Posts ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Translation graph: NL source has parent_id = NULL.
  -- EN/DE translations have parent_id pointing to the NL row.
  -- ON DELETE CASCADE so deleting source removes its translations.
  parent_id         UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  locale            TEXT NOT NULL DEFAULT 'nl' CHECK (locale IN ('nl', 'en', 'de')),
  slug              TEXT NOT NULL,
  title             TEXT NOT NULL,
  excerpt           TEXT,
  -- Tiptap ProseMirror JSON document. Empty doc = { type: 'doc', content: [] }.
  content           JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}'::jsonb,
  cover_image       TEXT,                                -- URL (Supabase Storage public URL)
  cover_alt         TEXT,
  format            TEXT NOT NULL DEFAULT 'article'
                     CHECK (format IN ('article', 'update')),
  status            TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'published')),
  published_at      TIMESTAMPTZ,
  author_name       TEXT NOT NULL DEFAULT 'Mark de Kock',
  tags              TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  reading_minutes   INTEGER,                             -- calculated + stored on save
  -- SEO overrides (fall back to title/excerpt if NULL)
  meta_title        TEXT,
  meta_description  TEXT,
  noindex           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Slug must be unique within a locale (so NL "foo" + EN "foo" can coexist).
  UNIQUE (locale, slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON blog_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_parent          ON blog_posts (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale_status   ON blog_posts (locale, status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags            ON blog_posts USING GIN (tags);

-- updated_at trigger (re-uses pattern from other migrations)
CREATE OR REPLACE FUNCTION blog_posts_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION blog_posts_set_updated_at();

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- ── RLS: public can read published posts only ──────────────────────────────
DROP POLICY IF EXISTS blog_posts_public_read ON blog_posts;
CREATE POLICY blog_posts_public_read ON blog_posts
  FOR SELECT
  USING (status = 'published');

-- Admin operations (insert/update/delete) all go through the service-role
-- client in /api/admin/blog/* routes, which bypasses RLS automatically.
-- No INSERT/UPDATE/DELETE policy needed for the anon role.

-- ── Storage bucket for cover images + inline images ───────────────────────
-- Public bucket so URLs are directly accessible without signed-URL roundtrips.
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Public read on objects in the blog-images bucket.
DROP POLICY IF EXISTS blog_images_public_read ON storage.objects;
CREATE POLICY blog_images_public_read ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Note: uploads use the service-role client server-side (no anon INSERT policy).

-- ── Verify ────────────────────────────────────────────────────────────────
-- After running:
--   SELECT schemaname, tablename, rowsecurity
--   FROM   pg_tables
--   WHERE  schemaname = 'public' AND tablename = 'blog_posts';
-- Expect: rowsecurity = true.
--
--   SELECT id, name, public FROM storage.buckets WHERE id = 'blog-images';
-- Expect: one row, public = true.
