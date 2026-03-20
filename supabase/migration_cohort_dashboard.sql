-- ============================================================
-- Cohort Dashboard Migration
-- Adds: cohort_waves, cohort_responses
-- Extends: cohorts (organisation, access_code, client_token)
-- ============================================================

-- ─── Extend cohorts ──────────────────────────────────────────
ALTER TABLE cohorts
  ADD COLUMN IF NOT EXISTS organisation            text,
  ADD COLUMN IF NOT EXISTS access_code             text UNIQUE,
  ADD COLUMN IF NOT EXISTS client_token            uuid DEFAULT uuid_generate_v4() UNIQUE,
  ADD COLUMN IF NOT EXISTS client_link_expires_at  timestamptz;

-- Backfill client_token for existing cohorts that got NULL
UPDATE cohorts SET client_token = uuid_generate_v4() WHERE client_token IS NULL;

-- ─── cohort_waves ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cohort_waves (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id    uuid NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  wave_number  integer NOT NULL,
  label        text NOT NULL DEFAULT 'Baseline',
  wave_date    date,
  is_open      boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cohort_id, wave_number)
);

CREATE INDEX IF NOT EXISTS cohort_waves_cohort_id_idx ON cohort_waves(cohort_id);

-- Auto-create wave 0 for every existing cohort (skip if already exists)
INSERT INTO cohort_waves (cohort_id, wave_number, label, is_open, wave_date)
SELECT id, 0, 'Baseline', true, date
FROM cohorts
ON CONFLICT (cohort_id, wave_number) DO NOTHING;

-- ─── cohort_responses ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cohort_responses (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id    uuid NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  wave_id      uuid NOT NULL REFERENCES cohort_waves(id) ON DELETE CASCADE,
  response_id  uuid NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wave_id, response_id)
);

CREATE INDEX IF NOT EXISTS cohort_responses_cohort_id_idx  ON cohort_responses(cohort_id);
CREATE INDEX IF NOT EXISTS cohort_responses_wave_id_idx    ON cohort_responses(wave_id);
CREATE INDEX IF NOT EXISTS cohort_responses_response_id_idx ON cohort_responses(response_id);

-- ─── Migrate existing respondent→cohort links ─────────────────
-- Link existing responses to the baseline wave of their cohort
INSERT INTO cohort_responses (cohort_id, wave_id, response_id)
SELECT
  r.cohort_id,
  w.id AS wave_id,
  res.id AS response_id
FROM respondents r
JOIN responses res ON res.respondent_id = r.id
JOIN cohort_waves w ON w.cohort_id = r.cohort_id AND w.wave_number = 0
WHERE r.cohort_id IS NOT NULL
ON CONFLICT (wave_id, response_id) DO NOTHING;
