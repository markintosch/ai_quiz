-- Arena: attempt tracking per participant
-- Run in Supabase SQL Editor (production)

ALTER TABLE arena_participants
  ADD COLUMN IF NOT EXISTS attempt_number integer NOT NULL DEFAULT 1;

-- Index for fast attempt-count lookups by session + email
CREATE INDEX IF NOT EXISTS arena_participants_session_email_idx
  ON arena_participants (session_id, email);
