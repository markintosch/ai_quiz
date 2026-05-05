-- ─────────────────────────────────────────────────────────────────────────────
-- migration_cycle_companion.sql
-- Cycle Companion v1.0 — personal cycle / mood / lifestyle tracker.
-- See docs/PRD-cycle-companion.md for the full spec.
--
-- Tables (all prefixed cycle_ to keep this surface isolated from the rest
-- of the shared Supabase project):
--   cycle_profiles        — one row per user (cycle settings + reminder)
--   cycle_daily_entries   — daily check-in records, keyed (user_id, entry_date)
--   cycle_weather         — daily weather snapshot from Open-Meteo
--   cycle_insights_seen   — log of which insight rules have been surfaced
--
-- Auth: uses Supabase Auth (auth.users). Row-level security restricts every
-- row to the owning user via auth.uid(). The email allowlist is enforced
-- separately at the app layer in middleware before issuing magic links.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Profile ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cycle_profiles (
  user_id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_period_start  DATE,
  typical_length     INTEGER NOT NULL DEFAULT 28 CHECK (typical_length BETWEEN 14 AND 60),
  lat                NUMERIC(8, 5),
  lon                NUMERIC(8, 5),
  timezone           TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
  reminder_time      TIME NOT NULL DEFAULT '20:00',
  onboarded_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE cycle_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY cycle_profiles_owner_select ON cycle_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cycle_profiles_owner_insert ON cycle_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cycle_profiles_owner_update ON cycle_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY cycle_profiles_owner_delete ON cycle_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ── Daily entries ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cycle_daily_entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date          DATE NOT NULL,
  mood_score          SMALLINT NOT NULL CHECK (mood_score BETWEEN 0 AND 10),
  mood_variable       BOOLEAN NOT NULL DEFAULT FALSE,
  sleep               SMALLINT NOT NULL CHECK (sleep BETWEEN 1 AND 10),
  stress              SMALLINT NOT NULL CHECK (stress BETWEEN 1 AND 10),
  activity_types      TEXT[] NOT NULL DEFAULT '{}',
  activity_intensity  TEXT CHECK (activity_intensity IN ('Low', 'Medium', 'High')),
  menstruation_flag   BOOLEAN NOT NULL DEFAULT FALSE,
  readiness_score     SMALLINT CHECK (readiness_score BETWEEN 0 AND 100),
  cycle_phase         TEXT NOT NULL CHECK (cycle_phase IN ('menstrual','follicular','ovulation','luteal-early','luteal-late','unknown')),
  score_feedback      SMALLINT CHECK (score_feedback IN (-1, 0, 1)),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, entry_date)
);
CREATE INDEX IF NOT EXISTS idx_cycle_daily_user_date ON cycle_daily_entries (user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_daily_menstruation ON cycle_daily_entries (user_id, entry_date) WHERE menstruation_flag = TRUE;
ALTER TABLE cycle_daily_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY cycle_daily_entries_owner_select ON cycle_daily_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cycle_daily_entries_owner_insert ON cycle_daily_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cycle_daily_entries_owner_update ON cycle_daily_entries
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY cycle_daily_entries_owner_delete ON cycle_daily_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ── Weather snapshot ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cycle_weather (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date   DATE NOT NULL,
  temp_c       NUMERIC(4, 1),
  precip_mm    NUMERIC(5, 1),
  cloud_pct    SMALLINT,
  wind_kmh     NUMERIC(4, 1),
  condition    TEXT CHECK (condition IN ('sunny','cloudy','rainy','snow','clear-night')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, entry_date)
);
CREATE INDEX IF NOT EXISTS idx_cycle_weather_user_date ON cycle_weather (user_id, entry_date DESC);
ALTER TABLE cycle_weather ENABLE ROW LEVEL SECURITY;

CREATE POLICY cycle_weather_owner_select ON cycle_weather
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cycle_weather_owner_insert ON cycle_weather
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cycle_weather_owner_delete ON cycle_weather
  FOR DELETE USING (auth.uid() = user_id);

-- ── Insights surfaced (history) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cycle_insights_seen (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_key      TEXT NOT NULL,
  surfaced_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_cycle_insights_user ON cycle_insights_seen (user_id, surfaced_at DESC);
ALTER TABLE cycle_insights_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY cycle_insights_seen_owner_select ON cycle_insights_seen
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cycle_insights_seen_owner_insert ON cycle_insights_seen
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cycle_insights_seen_owner_update ON cycle_insights_seen
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY cycle_insights_seen_owner_delete ON cycle_insights_seen
  FOR DELETE USING (auth.uid() = user_id);

-- ── updated_at triggers ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cycle_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cycle_profiles_updated_at ON cycle_profiles;
CREATE TRIGGER cycle_profiles_updated_at BEFORE UPDATE ON cycle_profiles
  FOR EACH ROW EXECUTE FUNCTION cycle_set_updated_at();

DROP TRIGGER IF EXISTS cycle_daily_entries_updated_at ON cycle_daily_entries;
CREATE TRIGGER cycle_daily_entries_updated_at BEFORE UPDATE ON cycle_daily_entries
  FOR EACH ROW EXECUTE FUNCTION cycle_set_updated_at();
