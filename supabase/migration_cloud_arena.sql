-- ─── Cloud Arena — Phase 1 schema ────────────────────────────────────────────
-- Run this in Supabase SQL Editor after migration_whitelabel.sql

-- ── Register product ──────────────────────────────────────────────────────────
INSERT INTO quiz_products (key, name, subdomain, description)
VALUES (
  'cloud_arena',
  'Cloud Arena',
  'arena',
  'Live timed quiz game with leaderboard — cloud knowledge battles for teams'
)
ON CONFLICT (key) DO NOTHING;

-- ── Question bank ─────────────────────────────────────────────────────────────
-- Human-authored and AI-generated questions. Shared across all sessions.
CREATE TABLE IF NOT EXISTS arena_questions (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_key   text        NOT NULL DEFAULT 'cloud_arena',
  question_text text        NOT NULL,
  -- Array of {label: "A", text: "...", value: "a"}
  options       jsonb       NOT NULL,
  -- Must match one of options[].value
  correct_value text        NOT NULL,
  -- Shown to players after answering
  explanation   text,
  difficulty    text        NOT NULL DEFAULT 'medium'
                              CHECK (difficulty IN ('easy', 'medium', 'hard')),
  -- e.g. 'kubernetes', 'iam', 'cost_management', 'devops', 'security'
  topic         text,
  ai_generated  boolean     NOT NULL DEFAULT false,
  active        boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS arena_questions_product_key_idx ON arena_questions(product_key);
CREATE INDEX IF NOT EXISTS arena_questions_topic_idx       ON arena_questions(topic);
CREATE INDEX IF NOT EXISTS arena_questions_difficulty_idx  ON arena_questions(difficulty);
CREATE INDEX IF NOT EXISTS arena_questions_active_idx      ON arena_questions(active);

ALTER TABLE arena_questions ENABLE ROW LEVEL SECURITY;

-- ── Game sessions ─────────────────────────────────────────────────────────────
-- Host creates a session; players join with a short join_code.
CREATE TABLE IF NOT EXISTS arena_sessions (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     uuid        REFERENCES companies(id) ON DELETE SET NULL,
  -- Short human-readable code players type to join (e.g. "CLOUD42")
  join_code      text        NOT NULL UNIQUE,
  host_name      text        NOT NULL,
  status         text        NOT NULL DEFAULT 'lobby'
                               CHECK (status IN ('lobby', 'active', 'completed', 'cancelled')),
  -- Config set by host before starting
  question_count int         NOT NULL DEFAULT 10,
  time_per_q     int         NOT NULL DEFAULT 30,   -- seconds per question
  -- Snapshot of questions used (ids + full content), taken when session starts
  questions      jsonb       NOT NULL DEFAULT '[]',
  started_at     timestamptz,
  ended_at       timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS arena_sessions_join_code_idx  ON arena_sessions(join_code);
CREATE INDEX IF NOT EXISTS arena_sessions_company_id_idx ON arena_sessions(company_id);
CREATE INDEX IF NOT EXISTS arena_sessions_status_idx     ON arena_sessions(status);
CREATE INDEX IF NOT EXISTS arena_sessions_created_idx    ON arena_sessions(created_at DESC);

ALTER TABLE arena_sessions ENABLE ROW LEVEL SECURITY;

-- ── Participants ──────────────────────────────────────────────────────────────
-- One row per player per session. Email is optional (used for weekly review).
CREATE TABLE IF NOT EXISTS arena_participants (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   uuid        NOT NULL REFERENCES arena_sessions(id) ON DELETE CASCADE,
  display_name text        NOT NULL,
  email        text,
  score        int         NOT NULL DEFAULT 0,
  -- Rank is set (or updated) when session ends
  rank         int,
  joined_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS arena_participants_session_id_idx ON arena_participants(session_id);

ALTER TABLE arena_participants ENABLE ROW LEVEL SECURITY;

-- ── Answers ───────────────────────────────────────────────────────────────────
-- One row per participant per question per session.
CREATE TABLE IF NOT EXISTS arena_answers (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id     uuid        NOT NULL REFERENCES arena_sessions(id) ON DELETE CASCADE,
  participant_id uuid        NOT NULL REFERENCES arena_participants(id) ON DELETE CASCADE,
  -- 0-based index into arena_sessions.questions
  question_index int         NOT NULL,
  answer_value   text        NOT NULL,
  is_correct     boolean     NOT NULL,
  -- Time from question reveal to answer submit — used for speed bonus
  time_taken_ms  int,
  points         int         NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS arena_answers_session_id_idx     ON arena_answers(session_id);
CREATE INDEX IF NOT EXISTS arena_answers_participant_id_idx ON arena_answers(participant_id);
-- Prevent duplicate answers for the same question
CREATE UNIQUE INDEX IF NOT EXISTS arena_answers_unique_idx
  ON arena_answers(participant_id, question_index);

ALTER TABLE arena_answers ENABLE ROW LEVEL SECURITY;

-- ── Weekly review sets (stub — Phase 2) ──────────────────────────────────────
-- Uncomment when weekly review workflow is built.
-- CREATE TABLE IF NOT EXISTS arena_weekly_sets (
--   id           uuid  PRIMARY KEY DEFAULT uuid_generate_v4(),
--   company_id   uuid  REFERENCES companies(id) ON DELETE CASCADE,
--   week_start   date  NOT NULL,
--   question_ids uuid[] NOT NULL,
--   sent_at      timestamptz,
--   created_at   timestamptz NOT NULL DEFAULT now()
-- );
