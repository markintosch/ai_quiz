-- ─── migration_manda_product.sql ─────────────────────────────────────────────
-- Adds the AI & M&A Readiness Assessment product (Hofstede & de Kock)
-- Run in Supabase SQL Editor after all previous migrations.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Register the product in quiz_products
INSERT INTO quiz_products (key, name, subdomain, description, active)
VALUES (
  'manda_readiness',
  'AI & M&A Readiness Assessment',
  'manda',
  'Measures organisational readiness across 7 dimensions for M&A, investment, and exit scenarios. Developed in partnership with Hofstede & de Kock.',
  true
)
ON CONFLICT (key) DO UPDATE
  SET name        = EXCLUDED.name,
      subdomain   = EXCLUDED.subdomain,
      description = EXCLUDED.description,
      active      = EXCLUDED.active;

-- 2. Seed site_content rows for all three locales (EN / NL / FR)
--    These are the default landing-page copy overrides for the manda product.
--    Admins can override further via /admin/content.

INSERT INTO site_content (locale, product_key, content)
VALUES
  ('en', 'manda_readiness', '{
    "landing": {
      "badge":         "AI & M&A Readiness Assessment",
      "heading1":      "Does your company",
      "heading2":      "survive a buyer''s lens?",
      "subheading":    "Ten minutes. Seven dimensions. One clear picture of your AI & M&A readiness — before the investor, acquirer, or board gets there first.",
      "meta":          "~10 minutes · Instant results",
      "fullNote":      "~10 minutes",
      "ctaFallback":   "Start your free readiness scan →",
      "defaultWelcome":"Welcome. This assessment will benchmark your organisation across seven dimensions that buyers, investors, and boards look for. It takes approximately 10 minutes."
    }
  }'),
  ('nl', 'manda_readiness', '{
    "landing": {
      "badge":         "AI & M&A Gereedheidsanalyse",
      "heading1":      "Overleeft uw bedrijf",
      "heading2":      "de blik van een koper?",
      "subheading":    "Tien minuten. Zeven dimensies. Één helder beeld van uw AI & M&A-gereedheid — voordat de investeerder, koper of raad van bestuur dat doet.",
      "meta":          "~10 minuten · Direct resultaat",
      "fullNote":      "~10 minuten",
      "ctaFallback":   "Start uw gratis gereedheidscan →",
      "defaultWelcome":"Welkom. Deze analyse benchmarkt uw organisatie op zeven dimensies die kopers, investeerders en raden van bestuur zoeken. Het duurt ongeveer 10 minuten."
    }
  }'),
  ('fr', 'manda_readiness', '{
    "landing": {
      "badge":         "Évaluation de Maturité IA & M&A",
      "heading1":      "Votre entreprise résiste-t-elle",
      "heading2":      "à l''œil d''un acheteur ?",
      "subheading":    "Dix minutes. Sept dimensions. Une image claire de votre maturité IA & M&A — avant que l''investisseur, l''acquéreur ou le conseil d''administration n''y arrive.",
      "meta":          "~10 minutes · Résultats immédiats",
      "fullNote":      "~10 minutes",
      "ctaFallback":   "Démarrer votre scan de maturité gratuit →",
      "defaultWelcome":"Bienvenue. Cette évaluation compare votre organisation sur sept dimensions que les acheteurs, investisseurs et conseils recherchent. Elle prend environ 10 minutes."
    }
  }')
ON CONFLICT (locale, product_key) DO UPDATE
  SET content = EXCLUDED.content;
