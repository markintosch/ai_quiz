-- REEF HR Readiness product + company
-- Run in Supabase SQL Editor

-- 1. Add quiz product
INSERT INTO quiz_products (key, name, subdomain, active)
VALUES ('hr_readiness', 'HR Gereedheidscan', 'reef', true)
ON CONFLICT (key) DO NOTHING;

-- 2. Add REEF company
INSERT INTO companies (
  name,
  slug,
  product_id,
  brand_color,
  welcome_message,
  active
)
SELECT
  'REEF',
  'reef',
  qp.id,
  '#1B3A6B',
  'Welkom bij de REEF HR Gereedheidscan. Beantwoord de vragen eerlijk — er zijn geen goede of foute antwoorden. De scan geeft u een helder beeld van de HR-volwassenheid van uw organisatie.',
  true
FROM quiz_products qp
WHERE qp.key = 'hr_readiness'
ON CONFLICT (slug) DO NOTHING;
