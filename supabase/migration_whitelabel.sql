-- ─── migration_whitelabel.sql ────────────────────────────────────────────────
-- White-label multi-product platform foundation
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Run AFTER schema.sql, migration_phase2.sql, migration_cms.sql.
--
-- What this migration does:
--   1. Creates quiz_products table (one row per product type)
--   2. Seeds the AI Maturity product
--   3. Adds product_id FK to companies (backfills all existing rows)
--   4. Adds product_key to responses (denormalised for fast lookup)
--   5. Extends site_content PK to (locale, product_key)
--
-- ─── 1. quiz_products table ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quiz_products (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key              text NOT NULL UNIQUE,        -- 'ai_maturity'
  name             text NOT NULL,               -- 'AI Maturity Assessment'
  subdomain        text UNIQUE,                 -- 'ai-maturity' (for subdomain routing)
  description      text,
  active           boolean NOT NULL DEFAULT true,
  -- Reserved for future no-code product builder (nullable until implemented):
  questions_config jsonb,
  scoring_config   jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- RLS: allow public read of active products
ALTER TABLE quiz_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active quiz products" ON quiz_products;
CREATE POLICY "Public can read active quiz products"
  ON quiz_products FOR SELECT
  USING (active = true);

-- ─── 2. Seed AI Maturity product ──────────────────────────────────────────────

INSERT INTO quiz_products (key, name, subdomain, description)
VALUES (
  'ai_maturity',
  'AI Maturity Assessment',
  'ai-maturity',
  'Diagnostic measuring AI adoption across 6 dimensions: Strategy, Governance, Usage, Data, Talent, and Opportunity.'
)
ON CONFLICT (key) DO NOTHING;

-- ─── 3. companies: add product_id FK ─────────────────────────────────────────

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES quiz_products(id) ON DELETE RESTRICT;

-- Backfill all existing companies to AI Maturity
UPDATE companies
SET product_id = (SELECT id FROM quiz_products WHERE key = 'ai_maturity')
WHERE product_id IS NULL;

-- Now make it required
-- (comment this out if you hit issues and re-run after confirming the UPDATE above worked)
ALTER TABLE companies
  ALTER COLUMN product_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS companies_product_id_idx ON companies(product_id);

-- ─── 4. responses: add product_key column (denormalised) ─────────────────────

ALTER TABLE responses
  ADD COLUMN IF NOT EXISTS product_key text DEFAULT 'ai_maturity';

-- Backfill
UPDATE responses SET product_key = 'ai_maturity' WHERE product_key IS NULL;

CREATE INDEX IF NOT EXISTS responses_product_key_idx ON responses(product_key);

-- ─── 5. site_content: extend PK to include product_key ───────────────────────
-- NOTE: Run this block carefully — it renames the existing table and creates a new one.
-- If site_content_legacy already exists from a previous attempt, drop it first.

DO $$
BEGIN
  -- Only run if site_content exists and site_content_legacy does NOT
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'site_content'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'site_content_legacy'
  ) THEN
    -- Rename existing table
    ALTER TABLE site_content RENAME TO site_content_legacy;

    -- Create new table with (locale, product_key) composite PK
    CREATE TABLE site_content (
      locale       text NOT NULL,
      product_key  text NOT NULL DEFAULT 'ai_maturity',
      content      jsonb NOT NULL DEFAULT '{}',
      updated_at   timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (locale, product_key)
    );

    -- Migrate all existing content to ai_maturity product
    INSERT INTO site_content (locale, product_key, content, updated_at)
    SELECT locale, 'ai_maturity', content, updated_at
    FROM site_content_legacy;

    RAISE NOTICE 'site_content migrated: % rows moved to (locale, product_key) PK.',
      (SELECT count(*) FROM site_content_legacy);
  ELSE
    RAISE NOTICE 'site_content migration skipped (already migrated or table missing).';
  END IF;
END $$;

-- ─── Summary ──────────────────────────────────────────────────────────────────
-- After running this migration:
--   - quiz_products has 1 row: ai_maturity
--   - All companies have product_id pointing to ai_maturity
--   - All responses have product_key = 'ai_maturity'
--   - site_content now has (locale, product_key) composite PK
--
-- Future products: INSERT INTO quiz_products (...) then create company in admin.
-- ─────────────────────────────────────────────────────────────────────────────
