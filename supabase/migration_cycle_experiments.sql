-- ─────────────────────────────────────────────────────────────────────────────
-- migration_cycle_experiments.sql
-- One 30-day experiment can be active per Cycle Companion user at a time.
-- Created from a Peri-Compass assessment (source_assessment_id) when the user
-- clicks through the bridge CTA.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cycle_experiments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_assessment_id  UUID,                              -- nullable: not all experiments come from compass
  code                  TEXT NOT NULL,                     -- experiment code from peri-compass library
  description           TEXT NOT NULL,                     -- the actual experiment text in NL
  rationale             TEXT,                              -- 'why this experiment' rationale
  source                TEXT,                              -- evidence source label
  source_url            TEXT,                              -- evidence URL
  metric_to_watch       TEXT NOT NULL DEFAULT 'sleep'      -- which Cycle metric we'll measure progress against
                        CHECK (metric_to_watch IN ('sleep','mood','readiness','stress')),
  started_at            DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_days         INT  NOT NULL DEFAULT 30 CHECK (duration_days BETWEEN 7 AND 90),
  ended_at              DATE,
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','completed','abandoned','replaced')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cycle_experiments_user_status
  ON cycle_experiments (user_id, status);

CREATE INDEX IF NOT EXISTS idx_cycle_experiments_user_started
  ON cycle_experiments (user_id, started_at DESC);

-- At most one active experiment per user — enforced as partial unique index.
CREATE UNIQUE INDEX IF NOT EXISTS idx_cycle_experiments_one_active_per_user
  ON cycle_experiments (user_id)
  WHERE status = 'active';

ALTER TABLE cycle_experiments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cycle_experiments_owner_select ON cycle_experiments;
CREATE POLICY cycle_experiments_owner_select ON cycle_experiments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS cycle_experiments_owner_insert ON cycle_experiments;
CREATE POLICY cycle_experiments_owner_insert ON cycle_experiments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS cycle_experiments_owner_update ON cycle_experiments;
CREATE POLICY cycle_experiments_owner_update ON cycle_experiments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS cycle_experiments_owner_delete ON cycle_experiments;
CREATE POLICY cycle_experiments_owner_delete ON cycle_experiments
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger using the existing helper
DROP TRIGGER IF EXISTS cycle_experiments_updated_at ON cycle_experiments;
CREATE TRIGGER cycle_experiments_updated_at BEFORE UPDATE ON cycle_experiments
  FOR EACH ROW EXECUTE FUNCTION cycle_set_updated_at();
