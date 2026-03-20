-- migration_arena_scheduled.sql
-- Adds scheduled start time + email subscribers to arena sessions.
-- Run in Supabase SQL Editor.

-- Add title + scheduled_at to arena_sessions
ALTER TABLE arena_sessions
  ADD COLUMN IF NOT EXISTS title       text,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- Subscribers who want email notification when a scheduled game starts
CREATE TABLE IF NOT EXISTS arena_subscribers (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES arena_sessions(id) ON DELETE CASCADE,
  email      text NOT NULL,
  notified   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, email)
);
CREATE INDEX IF NOT EXISTS arena_subscribers_session_idx ON arena_subscribers(session_id);
