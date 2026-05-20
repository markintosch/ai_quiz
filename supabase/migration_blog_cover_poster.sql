-- ─────────────────────────────────────────────────────────────────────────────
-- migration_blog_cover_poster.sql
-- Voegt cover_poster kolom toe aan blog_posts.
--
-- Use case: cover_image kan nu een video zijn (.mp4/.webm/etc). Maar LinkedIn,
-- Twitter en Facebook social cards kunnen geen video als preview tonen — alleen
-- afbeeldingen. cover_poster is een aparte URL naar een afbeelding (jpg/png/webp)
-- die gebruikt wordt voor:
--   - og:image (social preview)
--   - <video poster=...> (eerste frame voordat de video laadt)
-- Als cover_image al een afbeelding is, mag cover_poster leeg blijven.
--
-- Tabel mag al bestaan vanuit migration_blog.sql — daarom IF NOT EXISTS.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS cover_poster TEXT;

-- Geen RLS-wijziging nodig: bestaande policies dekken alle kolommen.

-- Verify:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'blog_posts' AND column_name = 'cover_poster';
