-- ─────────────────────────────────────────────────────────────────────────────
-- migration_atelier.sql
-- Atelier — Dutch-native brief-to-direction working assistant.
-- Implements the v0.4 PRD framework: 5 modules, two-track signal model,
-- provenance-as-structure, Dutch-default.
--
-- Tables (all prefixed atelier_ to avoid collisions in shared Supabase project):
--   atelier_sessions        — one working session = one brief
--   atelier_briefs          — raw input + brand context for a session
--   atelier_module_runs     — every module invocation (timing, cost, IO)
--   atelier_references      — references attached to a session (M2)
--   atelier_audience_signals— two-track signals attached to a session (M3)
--   atelier_directions      — 2–3 directional routes (M4)
--   atelier_outputs         — final one-pager / outline (M5)
--   atelier_contributors    — Phase 1.5 contributor seed schema (no UI yet)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Sessions ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS atelier_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Lightweight session metadata. No auth yet so we just track who started it
  -- via name/email, mirroring the SannahRemco pattern.
  owner_name      TEXT,
  owner_email     TEXT,
  brand_name      TEXT,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','running','completed','failed','archived')),
  language        TEXT NOT NULL DEFAULT 'nl' CHECK (language IN ('nl','en','fr')),
  -- Aggregate fields filled when modules complete (denormalised for fast reads)
  jtbd_summary    TEXT,
  has_one_pager   BOOLEAN NOT NULL DEFAULT FALSE,
  total_cost_cents NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atelier_sessions_email ON atelier_sessions (owner_email);
CREATE INDEX IF NOT EXISTS idx_atelier_sessions_created ON atelier_sessions (created_at DESC);
ALTER TABLE atelier_sessions ENABLE ROW LEVEL SECURITY;

-- ── Briefs ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS atelier_briefs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES atelier_sessions(id) ON DELETE CASCADE,
  raw_text        TEXT NOT NULL,
  brand_context   TEXT,                     -- optional supporting brand info
  attachments     JSONB NOT NULL DEFAULT '[]'::jsonb,  -- future: storage paths
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atelier_briefs_session ON atelier_briefs (session_id);
ALTER TABLE atelier_briefs ENABLE ROW LEVEL SECURITY;

-- ── Module runs (universal log) ─────────────────────────────────────────────
-- Every Claude / LLM call writes one row here. Phase 1 quantitative gates
-- aggregate over this table.
CREATE TABLE IF NOT EXISTS atelier_module_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES atelier_sessions(id) ON DELETE CASCADE,
  module          TEXT NOT NULL CHECK (module IN ('brief_jtbd','reference','audience','tension','output')),
  status          TEXT NOT NULL CHECK (status IN ('ok','partial','failed')),
  model           TEXT,                     -- e.g. 'claude-sonnet-4-6'
  provider        TEXT,                     -- 'anthropic' (today)
  input_hash      TEXT,                     -- sha256 of input — dedupe + cache key
  input_payload   JSONB,                    -- full input (truncated if huge)
  output_payload  JSONB,                    -- module output (typed via Zod at app layer)
  prompt_tokens   INTEGER,
  output_tokens   INTEGER,
  latency_ms      INTEGER,
  cost_cents      NUMERIC(10,4),
  error_message   TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at     TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_atelier_runs_session ON atelier_module_runs (session_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_atelier_runs_module ON atelier_module_runs (module, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_atelier_runs_input_hash ON atelier_module_runs (input_hash);
ALTER TABLE atelier_module_runs ENABLE ROW LEVEL SECURITY;

-- ── References (Module 2 output) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS atelier_references (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES atelier_sessions(id) ON DELETE CASCADE,
  -- source_kind tracks provenance category: archive | live_source | inferred
  -- inferred = model knowledge only (no external lookup) — flagged in UI.
  source_kind     TEXT NOT NULL CHECK (source_kind IN ('archive','live_source','inferred')),
  source_url      TEXT,
  source_label    TEXT,                     -- e.g. 'Tomas archive · 2024 · Heineken-case'
  title           TEXT NOT NULL,
  description     TEXT,
  relevance_score NUMERIC(3,2),             -- 0.00 – 1.00
  taste_note      TEXT,                     -- why this reference is worth attention
  position        INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atelier_refs_session ON atelier_references (session_id, position);
ALTER TABLE atelier_references ENABLE ROW LEVEL SECURITY;

-- ── Audience signals (Module 3 output) — two-track ──────────────────────────
-- Discriminator at the row level: track = 'street' | 'ground'. Cannot be
-- silently blended because UI + queries always group by track.
CREATE TABLE IF NOT EXISTS atelier_audience_signals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES atelier_sessions(id) ON DELETE CASCADE,
  track           TEXT NOT NULL CHECK (track IN ('street','ground')),
  -- claim is the audience statement; provenance is whether it's evidenced
  claim           TEXT NOT NULL,
  evidence        TEXT,                     -- supporting note / quote
  source_label    TEXT,                     -- where this claim came from
  source_url      TEXT,
  confidence      TEXT NOT NULL CHECK (confidence IN ('strong','medium','weak','inferred')),
  contradicts     TEXT[],                   -- claim ids this one contradicts
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atelier_signals_session ON atelier_audience_signals (session_id, track);
ALTER TABLE atelier_audience_signals ENABLE ROW LEVEL SECURITY;

-- ── Directions (Module 4 output) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS atelier_directions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES atelier_sessions(id) ON DELETE CASCADE,
  position        INTEGER NOT NULL DEFAULT 0,  -- 1, 2, 3
  tension         TEXT NOT NULL,               -- the friction this direction names
  route           TEXT NOT NULL,               -- the direction itself
  rationale       TEXT,                        -- why this route follows from the tension
  evidence_refs   UUID[] NOT NULL DEFAULT '{}', -- atelier_references.id[] backing this route
  audience_refs   UUID[] NOT NULL DEFAULT '{}', -- atelier_audience_signals.id[]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atelier_directions_session ON atelier_directions (session_id, position);
ALTER TABLE atelier_directions ENABLE ROW LEVEL SECURITY;

-- ── Outputs (Module 5: one-pagers / outlines) ───────────────────────────────
CREATE TABLE IF NOT EXISTS atelier_outputs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES atelier_sessions(id) ON DELETE CASCADE,
  format          TEXT NOT NULL CHECK (format IN ('one_pager','session_outline','direction_snapshot')),
  language        TEXT NOT NULL DEFAULT 'nl',
  body_md         TEXT NOT NULL,            -- markdown body of the output
  provenance_map  JSONB NOT NULL DEFAULT '{}'::jsonb,  -- {claim_text -> source_label}
  exported_at     TIMESTAMPTZ,              -- set when user copies/downloads/shares (engagement proxy)
  shared_count    INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atelier_outputs_session ON atelier_outputs (session_id, created_at DESC);
ALTER TABLE atelier_outputs ENABLE ROW LEVEL SECURITY;

-- ── Contributors (Phase 1.5 seed schema — no UI yet) ────────────────────────
CREATE TABLE IF NOT EXISTS atelier_contributors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  name            TEXT,
  status          TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','paused','removed')),
  -- Quality signals — populated as validation tasks are completed
  validation_count INTEGER NOT NULL DEFAULT 0,
  quality_score   NUMERIC(3,2),             -- 0.00 – 1.00, recomputed periodically
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atelier_contributors_status ON atelier_contributors (status);
ALTER TABLE atelier_contributors ENABLE ROW LEVEL SECURITY;
