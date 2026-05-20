-- ── Summer Course Claude AI — CMS content row ───────────────────────────────
-- The /summercourse page reads its copy from site_content (locale 'nl',
-- product_key 'summer_course') and deep-merges it over the built-in defaults in
-- src/app/summercourse/content.ts. The page renders fine WITHOUT this row
-- (defaults kick in), and the admin editor at /admin/summercourse upserts the
-- full content blob on first save. This migration just seeds an empty row so
-- the product is visible/queryable from the start.
--
-- Run AFTER migration_whitelabel.sql (which adds the (locale, product_key) PK).

INSERT INTO site_content (locale, product_key, content)
VALUES ('nl', 'summer_course', '{}')
ON CONFLICT (locale, product_key) DO NOTHING;
