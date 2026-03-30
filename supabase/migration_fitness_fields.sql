-- Add phone and call_me_back columns to respondents for fitness lead capture
ALTER TABLE respondents
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS call_me_back boolean NOT NULL DEFAULT false;
