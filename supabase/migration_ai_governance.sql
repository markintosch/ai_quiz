-- ── AI Governance introductiemiddag — CMS content row ───────────────────────
-- The /ai-governance page reads its copy from site_content (locale 'nl',
-- product_key 'ai_governance') and deep-merges over the built-in defaults in
-- src/app/ai-governance/content.ts. The page renders fine WITHOUT this row;
-- the admin editor at /admin/ai-governance upserts the full blob on first save.
-- This migration just seeds an empty row so the product is queryable.
--
-- Run AFTER migration_whitelabel.sql (which adds the (locale, product_key) PK).

INSERT INTO site_content (locale, product_key, content)
VALUES ('nl', 'ai_governance', '{}')
ON CONFLICT (locale, product_key) DO NOTHING;
