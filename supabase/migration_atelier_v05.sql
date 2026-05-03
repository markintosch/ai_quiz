-- ─────────────────────────────────────────────────────────────────────────────
-- migration_atelier_v05.sql
-- Atelier v0.5 — extra invalshoeken: ICP, multi-angle synthesis (3 lenses),
-- live signals (web search), session Q&A.
--
-- Builds on migration_atelier.sql. Run AFTER that one.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Expand atelier_module_runs.module enum
ALTER TABLE atelier_module_runs
  DROP CONSTRAINT IF EXISTS atelier_module_runs_module_check;

ALTER TABLE atelier_module_runs
  ADD CONSTRAINT atelier_module_runs_module_check
  CHECK (module IN (
    'brief_jtbd','reference','audience','tension','output',
    'icp','brand_archetype','competitor','cultural_moment','live_signal','qa'
  ));

-- 2. ICP profile (one per session)
CREATE TABLE IF NOT EXISTS atelier_icp_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES atelier_sessions(id) ON DELETE CASCADE,
  industry        TEXT,
  role            TEXT,
  company_size    TEXT,
  triggers        JSONB NOT NULL DEFAULT '[]'::jsonb,  -- list of strings
  jobs            JSONB NOT NULL DEFAULT '[]'::jsonb,
  pains           JSONB NOT NULL DEFAULT '[]'::jsonb,
  buying_committee JSONB NOT NULL DEFAULT '[]'::jsonb, -- list of {role, influence}
  rationale       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atelier_icp_session ON atelier_icp_profiles (session_id);
ALTER TABLE atelier_icp_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Angles (3 lenses per session: brand_archetype, competitor, cultural_moment)
CREATE TABLE IF NOT EXISTS atelier_angles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES atelier_sessions(id) ON DELETE CASCADE,
  lens            TEXT NOT NULL CHECK (lens IN ('brand_archetype','competitor','cultural_moment')),
  headline        TEXT NOT NULL,
  body_md         TEXT NOT NULL,
  evidence        JSONB NOT NULL DEFAULT '[]'::jsonb,  -- list of {claim, source_label}
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, lens)
);
CREATE INDEX IF NOT EXISTS idx_atelier_angles_session ON atelier_angles (session_id);
ALTER TABLE atelier_angles ENABLE ROW LEVEL SECURITY;

-- 4. Live signals (from web search) — separate from inferred audience signals
CREATE TABLE IF NOT EXISTS atelier_live_signals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES atelier_sessions(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  snippet         TEXT,
  source_url      TEXT,
  source_label    TEXT,
  relevance_score NUMERIC(3,2),
  retrieved_via   TEXT NOT NULL DEFAULT 'web_search' CHECK (retrieved_via IN ('web_search','manual','inferred_fallback')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atelier_live_signals_session ON atelier_live_signals (session_id);
ALTER TABLE atelier_live_signals ENABLE ROW LEVEL SECURITY;

-- 5. Q&A turns (session-level chat)
CREATE TABLE IF NOT EXISTS atelier_qa_turns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES atelier_sessions(id) ON DELETE CASCADE,
  question        TEXT NOT NULL,
  answer          TEXT NOT NULL,
  model           TEXT,
  prompt_tokens   INTEGER,
  output_tokens   INTEGER,
  cost_cents      NUMERIC(10,4),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atelier_qa_session ON atelier_qa_turns (session_id, created_at);
ALTER TABLE atelier_qa_turns ENABLE ROW LEVEL SECURITY;
