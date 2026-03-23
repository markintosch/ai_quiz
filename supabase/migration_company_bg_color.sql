-- Add background colour field to companies
-- Default: #354E5E (existing brand dark teal, backwards compatible)
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT '#354E5E';
