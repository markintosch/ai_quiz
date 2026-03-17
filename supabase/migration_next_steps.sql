-- migration_next_steps.sql
-- Run AFTER migration_whitelabel.sql
-- Creates the interest_registrations table for post-assessment conversion tracking.

CREATE TABLE IF NOT EXISTS interest_registrations (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_key   text NOT NULL
                  CHECK (service_key IN (
                    'intro_session',
                    'intro_training',
                    'ai_coding',
                    'clevel_training',
                    'custom_project'
                  )),
  respondent_id uuid REFERENCES respondents(id) ON DELETE SET NULL,
  name          text NOT NULL,
  email         text NOT NULL,
  options       jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE interest_registrations ENABLE ROW LEVEL SECURITY;
-- No public SELECT policy — admin access via service role only

CREATE INDEX IF NOT EXISTS interest_registrations_respondent_idx
  ON interest_registrations(respondent_id);

CREATE INDEX IF NOT EXISTS interest_registrations_service_idx
  ON interest_registrations(service_key);

CREATE INDEX IF NOT EXISTS interest_registrations_created_idx
  ON interest_registrations(created_at DESC);
