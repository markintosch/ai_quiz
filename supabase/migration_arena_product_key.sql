-- Add product_key to arena_sessions so F1 and Cloud questions stay separate
-- Run in Supabase SQL Editor

ALTER TABLE arena_sessions
  ADD COLUMN IF NOT EXISTS product_key TEXT NOT NULL DEFAULT 'cloud_arena';

CREATE INDEX IF NOT EXISTS idx_arena_sessions_product_key ON arena_sessions (product_key);
