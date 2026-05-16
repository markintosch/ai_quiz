-- ─────────────────────────────────────────────────────────────────────────────
-- Nordschleife — time-trial trivia game (Green Hell theme)
-- ─────────────────────────────────────────────────────────────────────────────
-- Mirrors the hot_lap pattern: each lap = 30 questions from a 100-question pool.
-- First 5 attempts free per device (localStorage). Then €2 via Mollie = +5
-- attempts issued as a signed cookie on the success page. No credits table
-- needed in v1 — the cookie carries the credit.
-- ─────────────────────────────────────────────────────────────────────────────

-- Lap times leaderboard
CREATE TABLE IF NOT EXISTS public.nordschleife_times (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  total_ms    INTEGER NOT NULL,
  lap_time    TEXT NOT NULL,
  sectors     JSONB NOT NULL,
  correct_count INTEGER,
  paid_attempt BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nordschleife_times_total_ms_idx
  ON public.nordschleife_times (total_ms ASC);

CREATE INDEX IF NOT EXISTS nordschleife_times_email_idx
  ON public.nordschleife_times (email);

ALTER TABLE public.nordschleife_times ENABLE ROW LEVEL SECURITY;

-- ── shop_orders: track whether a digital "credits" delivery was already claimed.
-- Used so a Nordschleife purchase order can only be claimed once (single-use cookie issue).
ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- ── Shop product: 5-attempt pack at €2 ──
-- Drop the legacy type CHECK entirely. It only listed 4 hard-coded types
-- ('webinar','pdf','course','bundle') and rejects any newer product types
-- you've added since. The application layer already validates `type`, so the
-- DB-level allowlist adds no safety — just blockers when adding new kinds.
ALTER TABLE public.shop_products DROP CONSTRAINT IF EXISTS shop_products_type_check;

INSERT INTO public.shop_products (
  slug, brand, title, tagline, description,
  title_en, tagline_en, description_en,
  price_cents, vat_rate, type, delivery_type, delivery_notes, delivery_notes_en,
  active, sort_order
)
VALUES (
  'nordschleife-5-laps',
  'markdekock',
  'Nordschleife — 5 Extra Laps',
  '5 nieuwe pogingen op de Groene Hel',
  'Je gratis 3 pogingen op de Nordschleife trivia time-trial zitten erop. Met dit pakket krijg je er 5 extra. De credits worden direct na betaling toegekend aan dit apparaat (cookie, 30 dagen geldig).',
  'Nordschleife — 5 Extra Laps',
  '5 more shots at the Green Hell',
  'Your 3 free laps on the Nordschleife trivia time-trial are gone. This pack adds 5 more. Credits are issued to this device immediately after payment (cookie, valid for 30 days).',
  200, 0.21, 'game', 'instant',
  'Klik direct na betaling op "5 nieuwe pogingen claimen" om je credits te activeren op dit apparaat.',
  'Click "Claim 5 laps" right after payment to activate your credits on this device.',
  true, 10
)
ON CONFLICT (slug) DO UPDATE SET
  price_cents = EXCLUDED.price_cents,
  active = true,
  description = EXCLUDED.description,
  description_en = EXCLUDED.description_en;

-- ── Presence tracking (live participants on the landing page) ───────────────
-- Each browser tab generates a UUID, pings every 30 seconds, server upserts.
-- Active = last_seen > NOW() - 90 seconds.
CREATE TABLE IF NOT EXISTS public.nordschleife_presence (
  id         UUID PRIMARY KEY,
  last_seen  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nordschleife_presence_last_seen_idx
  ON public.nordschleife_presence (last_seen DESC);

ALTER TABLE public.nordschleife_presence ENABLE ROW LEVEL SECURITY;
