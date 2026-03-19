-- ─── Cloud Readiness Assessment — product registration ────────────────────────
-- Run after migration_whitelabel.sql

INSERT INTO quiz_products (key, name, subdomain, description)
VALUES (
  'cloud_readiness',
  'Cloud Readiness Assessment',
  'check',
  '30-question diagnostic measuring cloud maturity across 6 dimensions: strategy, adoption, infrastructure, DevOps, security, and FinOps.'
)
ON CONFLICT (key) DO NOTHING;
