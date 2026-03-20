-- Add attempt_number to arena_participants
ALTER TABLE arena_participants
  ADD COLUMN IF NOT EXISTS attempt_number integer NOT NULL DEFAULT 1;
