-- ─────────────────────────────────────────────────────────────────────────────
-- migration_perimenopause_compass.sql
-- Perimenopause Compass — instap-assessment voor Cycle Companion.
--
-- Gebruiker komt op /perimenopause-compass, beantwoordt ~30 vragen, krijgt
-- baseline-score (6 dimensies) + Claude-paragraaf + aanbevolen tracking-set.
-- Aan het eind: e-mail capture, summary mail via Resend, link naar Cycle login.
--
-- Drie tabellen:
--   1. perimenopause_compass_assessments  — één rij per afname (kan herhalen)
--   2. perimenopause_compass_responses    — rauwe antwoorden per vraag (audit/her-scoring)
--   3. perimenopause_compass_profiles     — per-email persoonlijk profiel
--                                            (recommended tracking + 90-d doel,
--                                             gebruikt later om Cycle daily te personaliseren)
--
-- AVG: e-mail mag NULL zijn (anoniem starten). Pas bij submit met e-mail
-- worden assessments aan een persoon gekoppeld. Bij verwijder-verzoek:
-- DELETE op email cascade'ed via FK indien gewenst (we doen dat niet automatisch
-- om audit-trail te bewaren — admin kiest manueel).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Assessments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perimenopause_compass_assessments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identificatie. Email is optioneel — anoniem invullen mag, e-mail geven
  -- pas bij submit/save voor de samenvatting.
  email                 TEXT,
  display_name          TEXT,
  -- Stage bepaalt welke vragen-flow ze kregen
  stage                 TEXT NOT NULL CHECK (stage IN (
    'regular_cycle','irregular_cycle','perimenopause_diagnosed',
    'postmenopause','unknown'
  )),
  -- Algemene metadata
  age_band              TEXT,                          -- '<35','35-39','40-44','45-49','50-54','55+'
  hrt_status            TEXT,                          -- 'none','considering','using','stopped','prefer_not_say'
  language              TEXT NOT NULL DEFAULT 'nl' CHECK (language IN ('nl','en','de')),

  -- Dimensie-scores (0-100, hoger = beter / minder belasting)
  score_overall         INTEGER NOT NULL DEFAULT 0,
  score_symptom_burden  INTEGER NOT NULL DEFAULT 0,   -- 100 = lage burden
  score_sleep_recovery  INTEGER NOT NULL DEFAULT 0,
  score_energy_capacity INTEGER NOT NULL DEFAULT 0,
  score_stress_context  INTEGER NOT NULL DEFAULT 0,
  score_lifestyle       INTEGER NOT NULL DEFAULT 0,
  score_self_awareness  INTEGER NOT NULL DEFAULT 0,
  -- Maturity-band label (e.g. 'thriving','navigating','struggling') — copy in code
  band                  TEXT,

  -- Topic-classificatie van de vrije velden + Claude output
  goal_90d              TEXT,                          -- vrije tekst: doel over 90 dagen
  ai_observation        TEXT,                          -- 1 paragraaf
  ai_hypotheses         JSONB NOT NULL DEFAULT '[]'::jsonb,  -- 3 hypothesen als string[]
  ai_micro_experiment   TEXT,                          -- 1 voorgesteld experiment
  ai_recommended_tracking JSONB NOT NULL DEFAULT '{}'::jsonb, -- { symptoms:[], fields:[] }

  -- Wat we gestuurd hebben + AVG
  email_sent_at         TIMESTAMPTZ,
  consent_at            TIMESTAMPTZ,
  consent_text          TEXT,
  source_ip             TEXT,
  source_path           TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmpcompass_email_lower
  ON perimenopause_compass_assessments (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_pmpcompass_created
  ON perimenopause_compass_assessments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pmpcompass_stage
  ON perimenopause_compass_assessments (stage);

-- updated_at trigger
CREATE OR REPLACE FUNCTION pmpcompass_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pmpcompass_updated_at ON perimenopause_compass_assessments;
CREATE TRIGGER trg_pmpcompass_updated_at
  BEFORE UPDATE ON perimenopause_compass_assessments
  FOR EACH ROW EXECUTE FUNCTION pmpcompass_set_updated_at();

ALTER TABLE perimenopause_compass_assessments ENABLE ROW LEVEL SECURITY;
-- Geen anon-policies → alle reads/writes via service-role in /api/perimenopause-compass/* routes.

-- ── Responses (rauwe antwoorden) ───────────────────────────────────────────
-- Voor her-scoring, audit, en eventueel mass-analysis later. Compactere
-- key-value vorm zodat een nieuwe vraag niets aan het schema hoeft te wijzigen.
CREATE TABLE IF NOT EXISTS perimenopause_compass_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id   UUID NOT NULL REFERENCES perimenopause_compass_assessments(id) ON DELETE CASCADE,
  question_code   TEXT NOT NULL,           -- bv 'sleep_quality', 'symptoms.hot_flashes'
  value_number    NUMERIC,                 -- voor likert / scores
  value_text      TEXT,                    -- voor open vragen
  value_array     TEXT[],                  -- voor multi-select symptomen
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pmpcompass_resp_assessment
  ON perimenopause_compass_responses (assessment_id);
CREATE INDEX IF NOT EXISTS idx_pmpcompass_resp_qcode
  ON perimenopause_compass_responses (question_code);

ALTER TABLE perimenopause_compass_responses ENABLE ROW LEVEL SECURITY;

-- ── Profiles (recommended tracking-set per email) ─────────────────────────
-- Eén rij per email. Wordt geüpdatet als gebruiker de Compass nogmaals doet.
-- Wordt later door /Cycle/today gelezen om het check-in scherm te personaliseren.
CREATE TABLE IF NOT EXISTS perimenopause_compass_profiles (
  email                   TEXT PRIMARY KEY,            -- case-insensitive uniek (LOWER index hieronder)
  latest_assessment_id    UUID REFERENCES perimenopause_compass_assessments(id) ON DELETE SET NULL,
  stage                   TEXT,
  recommended_symptoms    TEXT[] NOT NULL DEFAULT '{}',
  recommended_fields      TEXT[] NOT NULL DEFAULT '{}',
  goal_90d                TEXT,
  baseline_overall        INTEGER,                     -- nulmeting voor vergelijking later
  baseline_taken_at       TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pmpcompass_profile_email_lower
  ON perimenopause_compass_profiles (LOWER(email));

DROP TRIGGER IF EXISTS trg_pmpcompass_profile_updated_at ON perimenopause_compass_profiles;
CREATE TRIGGER trg_pmpcompass_profile_updated_at
  BEFORE UPDATE ON perimenopause_compass_profiles
  FOR EACH ROW EXECUTE FUNCTION pmpcompass_set_updated_at();

ALTER TABLE perimenopause_compass_profiles ENABLE ROW LEVEL SECURITY;

-- ── Verify ────────────────────────────────────────────────────────────────
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE tablename LIKE 'perimenopause_compass_%';
-- → drie rijen, allen rowsecurity = true.
