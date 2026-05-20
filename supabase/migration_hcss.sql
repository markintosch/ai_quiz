-- ── HCSS (Hammer Cyber Security Services) — CMS content row ──────────────────
-- The /HCSS page reads its copy from site_content (locale 'nl', product_key
-- 'hcss') and deep-merges it over the built-in defaults in
-- src/app/HCSS/content.ts. The page renders fine WITHOUT this row (defaults
-- apply), and the admin editor at /admin/hcss upserts the full blob on first
-- save. This migration just seeds an empty row so the product is queryable.
--
-- Run AFTER migration_whitelabel.sql (which adds the (locale, product_key) PK).

INSERT INTO site_content (locale, product_key, content)
VALUES ('nl', 'hcss', '{}')
ON CONFLICT (locale, product_key) DO NOTHING;
