-- ─────────────────────────────────────────────────────────────────────────────
-- migration_cyber_compass.sql
-- HCSS Cyber Compass — instap-assessment voor MKB cyber-maturity.
--
-- Ontworpen 1-op-1 op het Peri-Compass patroon (zelfde stepper, scoring engine,
-- Claude-integratie, results page). Live op markdekock.com/HCSS, white-label
-- voor Hammer Cyber Security Services (Diederik Hammer).
--
-- Drie tabellen:
--   1. cyber_compass_assessments  — één rij per afname (kan herhalen)
--   2. cyber_compass_responses    — rauwe antwoorden per vraag (audit/her-scoring)
--   3. cyber_compass_profiles     — per-email profiel (recommended actions, baseline)
--
-- AVG: email optioneel (anoniem starten mag), pas bij submit-met-email gekoppeld.
-- Alle reads/writes via service-role; geen anon-policies.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Assessments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cyber_compass_assessments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identificatie
  email                 TEXT,
  display_name          TEXT,
  organisation_name     TEXT,
  organisation_size     TEXT CHECK (organisation_size IN (
    '1-10','11-50','51-250','251-1000','1000+'
  )),
  sector                TEXT,                          -- vrij veld vanuit single-select
  role                  TEXT,                          -- bv. 'owner','it_manager','manager','officer','other'
  language              TEXT NOT NULL DEFAULT 'nl' CHECK (language IN ('nl','en')),

  -- Dimensie-scores (0-100, hoger = beter / volwassener)
  score_overall         INTEGER NOT NULL DEFAULT 0,
  score_iam             INTEGER NOT NULL DEFAULT 0,    -- Identity & Access (Diederik specialty)
  score_awareness       INTEGER NOT NULL DEFAULT 0,
  score_data            INTEGER NOT NULL DEFAULT 0,
  score_endpoint        INTEGER NOT NULL DEFAULT 0,
  score_backup          INTEGER NOT NULL DEFAULT 0,
  score_compliance      INTEGER NOT NULL DEFAULT 0,
  score_supply_chain    INTEGER NOT NULL DEFAULT 0,
  band                  TEXT,                          -- 'exposed','aware','maturing','resilient'

  -- Compliance flags (afgeleid uit antwoorden — handig voor admin filtering)
  nis2_in_scope         BOOLEAN,
  iso27001_status       TEXT,                          -- 'none','planning','implementing','certified'

  -- Open vrije velden + Claude output
  top_concern           TEXT,
  ai_observation        TEXT,
  ai_risk_observations  JSONB NOT NULL DEFAULT '[]'::jsonb,    -- 3 risico-bullets
  ai_quick_wins         JSONB NOT NULL DEFAULT '[]'::jsonb,    -- 2 actiepunten met source
  ai_specialist_topic   TEXT,                                  -- 1 onderwerp voor Diederik
  ai_specialist_reason  TEXT,
  ai_recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,   -- alle aanbevelingen uit library

  -- Mail / consent / audit
  email_sent_at         TIMESTAMPTZ,
  consent_at            TIMESTAMPTZ,
  consent_text          TEXT,
  source_ip             TEXT,
  source_path           TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cybercompass_email_lower
  ON cyber_compass_assessments (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_cybercompass_created
  ON cyber_compass_assessments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cybercompass_band
  ON cyber_compass_assessments (band);
CREATE INDEX IF NOT EXISTS idx_cybercompass_org_size
  ON cyber_compass_assessments (organisation_size);
CREATE INDEX IF NOT EXISTS idx_cybercompass_nis2
  ON cyber_compass_assessments (nis2_in_scope) WHERE nis2_in_scope = true;
CREATE INDEX IF NOT EXISTS idx_cybercompass_language
  ON cyber_compass_assessments (language);

-- updated_at trigger
CREATE OR REPLACE FUNCTION cybercompass_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cybercompass_updated_at ON cyber_compass_assessments;
CREATE TRIGGER trg_cybercompass_updated_at
  BEFORE UPDATE ON cyber_compass_assessments
  FOR EACH ROW EXECUTE FUNCTION cybercompass_set_updated_at();

ALTER TABLE cyber_compass_assessments ENABLE ROW LEVEL SECURITY;
-- Geen anon-policies. Alle toegang via service-role in /api/cyber-compass/* routes.

-- ── Responses (rauwe antwoorden) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cyber_compass_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id   UUID NOT NULL REFERENCES cyber_compass_assessments(id) ON DELETE CASCADE,
  question_code   TEXT NOT NULL,
  value_number    NUMERIC,
  value_text      TEXT,
  value_array     TEXT[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cybercompass_resp_assessment
  ON cyber_compass_responses (assessment_id);
CREATE INDEX IF NOT EXISTS idx_cybercompass_resp_qcode
  ON cyber_compass_responses (question_code);

ALTER TABLE cyber_compass_responses ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cyber_compass_profiles (
  email                   TEXT PRIMARY KEY,
  latest_assessment_id    UUID REFERENCES cyber_compass_assessments(id) ON DELETE SET NULL,
  organisation_name       TEXT,
  organisation_size       TEXT,
  baseline_overall        INTEGER,
  baseline_taken_at       TIMESTAMPTZ,
  recommended_actions     TEXT[] NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cybercompass_profile_email_lower
  ON cyber_compass_profiles (LOWER(email));

DROP TRIGGER IF EXISTS trg_cybercompass_profile_updated_at ON cyber_compass_profiles;
CREATE TRIGGER trg_cybercompass_profile_updated_at
  BEFORE UPDATE ON cyber_compass_profiles
  FOR EACH ROW EXECUTE FUNCTION cybercompass_set_updated_at();

ALTER TABLE cyber_compass_profiles ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';

-- ── Verify ────────────────────────────────────────────────────────────────
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE tablename LIKE 'cyber_compass_%';
-- → drie rijen, allen rowsecurity = true.
