-- Products table
CREATE TABLE IF NOT EXISTS public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL DEFAULT 'markdekock',
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  price_cents INTEGER NOT NULL,
  vat_rate DECIMAL(4,2) NOT NULL DEFAULT 0.21,
  type TEXT NOT NULL CHECK (type IN ('webinar', 'pdf', 'course', 'bundle')),
  delivery_type TEXT NOT NULL DEFAULT 'email',
  delivery_url TEXT,
  delivery_notes TEXT,
  cover_image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.shop_products(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  vat_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'canceled')),
  mollie_payment_id TEXT,
  mollie_checkout_url TEXT,
  delivery_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active products" ON public.shop_products FOR SELECT USING (active = true);
-- Orders: service role only (no anon policy needed)

-- Seed first product
INSERT INTO public.shop_products (slug, brand, title, tagline, description, price_cents, vat_rate, type, delivery_type, delivery_notes, active, sort_order)
VALUES (
  'claude-code-webinar',
  'markdekock',
  'Introduction into building a website with Claude Code',
  'Van concept naar uitvoering — in 2 uur.',
  'Een live presentatie over hoe ik werk: van eerste idee tot werkende website, met Claude Pro of Max als centrale tool. Inclusief werkwijze, toolstack en Q&A.',
  19900,
  0.21,
  'webinar',
  'email',
  'Je ontvangt een uitnodiging voor Google Meet. De webinar duurt 2 uur: een live presentatie + Q&A sessie. De definitieve datum en meet-link sturen we zodra je aanmelding is bevestigd.',
  true,
  0
) ON CONFLICT (slug) DO NOTHING;
