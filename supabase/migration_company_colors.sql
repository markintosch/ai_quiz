-- Migration: per-company secondary brand colour
-- Run in Supabase SQL Editor (production + local)

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#F5A820';
