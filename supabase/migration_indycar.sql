-- ─────────────────────────────────────────────────────────────────────────────
-- IndyCar — Indy 500 trivia time-trial game
-- ─────────────────────────────────────────────────────────────────────────────
-- Mirrors the nordschleife migration. Each lap = 30 questions from a
-- 100-question pool. First 3 attempts free per device (localStorage). Then
-- €2 via Mollie = +5 attempts issued as a signed cookie on the success page.
--
-- Idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- Lap times leaderboard
CREATE TABLE IF NOT EXISTS public.indycar_times (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  total_ms      INTEGER NOT NULL,
  lap_time      TEXT NOT NULL,
  sectors       JSONB NOT NULL,
  correct_count INTEGER,
  paid_attempt  BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS indycar_times_total_ms_idx
  ON public.indycar_times (total_ms ASC);

CREATE INDEX IF NOT EXISTS indycar_times_email_idx
  ON public.indycar_times (email);

CREATE INDEX IF NOT EXISTS indycar_times_created_at_idx
  ON public.indycar_times (created_at DESC);

ALTER TABLE public.indycar_times ENABLE ROW LEVEL SECURITY;

-- ── Presence tracking (live participants on the landing page) ───────────────
CREATE TABLE IF NOT EXISTS public.indycar_presence (
  id         UUID PRIMARY KEY,
  last_seen  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS indycar_presence_last_seen_idx
  ON public.indycar_presence (last_seen DESC);

ALTER TABLE public.indycar_presence ENABLE ROW LEVEL SECURITY;

-- ── Shop product: 5-attempt pack at €2 ───────────────────────────────────────
-- Uses the same `claimed_at` single-use mechanism as Nordschleife. The legacy
-- shop_products type CHECK was already dropped by the nordschleife migration,
-- so 'game' type works without further DDL.
INSERT INTO public.shop_products (
  slug, brand, title, tagline, description,
  title_en, tagline_en, description_en,
  price_cents, vat_rate, type, delivery_type, delivery_notes, delivery_notes_en,
  active, sort_order
)
VALUES (
  'indycar-5-laps',
  'markdekock',
  'IndyCar — 5 Extra Laps',
  '5 nieuwe pogingen op de Indy 500 trivia',
  'Je gratis 3 pogingen op de IndyCar trivia time-trial zitten erop. Met dit pakket krijg je er 5 extra. De credits worden direct na betaling toegekend aan dit apparaat (cookie, 30 dagen geldig).',
  'IndyCar — 5 Extra Laps',
  '5 more shots at the Indy 500 trivia',
  'Your 3 free laps on the IndyCar trivia time-trial are gone. This pack adds 5 more. Credits are issued to this device immediately after payment (cookie, valid for 30 days).',
  200, 0.21, 'game', 'instant',
  'Klik direct na betaling op "5 nieuwe pogingen claimen" om je credits te activeren op dit apparaat.',
  'Click "Claim 5 laps" right after payment to activate your credits on this device.',
  true, 20
)
ON CONFLICT (slug) DO UPDATE SET
  price_cents    = EXCLUDED.price_cents,
  active         = true,
  description    = EXCLUDED.description,
  description_en = EXCLUDED.description_en;
