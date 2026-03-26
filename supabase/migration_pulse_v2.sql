-- De Machine Pulse v2 — database-driven editorial assessment platform
-- Run AFTER migration_pulse.sql

CREATE TABLE IF NOT EXISTS pulse_themes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  editorial_intro TEXT,
  linked_episode_url TEXT,
  presub_open_at  TIMESTAMPTZ,
  presub_close_at TIMESTAMPTZ,
  opens_at        TIMESTAMPTZ,
  closes_at       TIMESTAMPTZ,
  published       BOOLEAN DEFAULT false,
  disclaimer_text TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_entities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id        UUID REFERENCES pulse_themes(id) ON DELETE CASCADE,
  entity_type     TEXT NOT NULL DEFAULT 'event',
  slug            TEXT NOT NULL,
  label           TEXT NOT NULL,
  subtitle        TEXT,
  description_short TEXT,
  source_url      TEXT,
  source_domain   TEXT,
  canonical_url   TEXT,
  hero_image_url  TEXT,
  og_image_url    TEXT,
  logo_url        TEXT,
  location_text   TEXT,
  organizer_name  TEXT,
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  edition_label   TEXT,
  ingest_status   TEXT DEFAULT 'draft',
  metadata_reviewed_by TEXT,
  last_fetched_at TIMESTAMPTZ,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_dimensions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id      UUID REFERENCES pulse_themes(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  label         TEXT NOT NULL,
  anchor_low    TEXT NOT NULL,
  anchor_high   TEXT NOT NULL,
  weight        DECIMAL DEFAULT 1.0,
  editorial_note TEXT,
  sort_order    INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pulse_responses_v2 (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id      UUID REFERENCES pulse_themes(id),
  entity_id     UUID REFERENCES pulse_entities(id),
  respondent_id UUID NULL,
  scores        JSONB NOT NULL,
  respondent_num INTEGER,
  submitted_at  TIMESTAMPTZ DEFAULT now(),
  ip_hash       TEXT,
  session_hash  TEXT,
  revision_of   UUID NULL
);

CREATE TABLE IF NOT EXISTS pulse_leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL,
  theme_id          UUID REFERENCES pulse_themes(id),
  consent_marketing BOOLEAN DEFAULT false,
  consent_results   BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_suggestions_v2 (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id            UUID REFERENCES pulse_themes(id),
  suggested_label     TEXT NOT NULL,
  suggested_url       TEXT,
  suggested_by_email  TEXT,
  vote_count          INT DEFAULT 0,
  status              TEXT DEFAULT 'open',
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_agent_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id         UUID REFERENCES pulse_entities(id) ON DELETE CASCADE,
  generated_title   TEXT,
  generated_summary TEXT,
  generated_tags    JSONB,
  generated_fields  JSONB,
  confidence_flags  JSONB,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_anomaly_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id    UUID REFERENCES pulse_themes(id),
  entity_id   UUID REFERENCES pulse_entities(id),
  flag_type   TEXT,
  severity    TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Sequential respondent numbers for v2 responses
CREATE SEQUENCE IF NOT EXISTS pulse_response_v2_seq;
CREATE OR REPLACE FUNCTION assign_pulse_response_v2_num()
RETURNS TRIGGER AS $$
BEGIN
  NEW.respondent_num := nextval('pulse_response_v2_seq');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_pulse_response_v2_num ON pulse_responses_v2;
CREATE TRIGGER trg_pulse_response_v2_num
  BEFORE INSERT ON pulse_responses_v2
  FOR EACH ROW EXECUTE FUNCTION assign_pulse_response_v2_num();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pulse_responses_v2_theme_entity ON pulse_responses_v2(theme_id, entity_id);
CREATE INDEX IF NOT EXISTS idx_pulse_entities_theme ON pulse_entities(theme_id, ingest_status);
CREATE INDEX IF NOT EXISTS idx_pulse_suggestions_v2_theme ON pulse_suggestions_v2(theme_id, status);
