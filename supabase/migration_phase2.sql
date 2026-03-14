-- Phase 2 migration: add branding + custom question fields to companies table
-- Run this in the Supabase SQL Editor

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS brand_color             TEXT DEFAULT '#E8611A',
  ADD COLUMN IF NOT EXISTS welcome_message         TEXT,
  ADD COLUMN IF NOT EXISTS excluded_question_codes TEXT[] DEFAULT '{}';

-- Phase 2 GDPR: split consent + unsubscribe tracking on respondents
ALTER TABLE respondents
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unsubscribed      BOOLEAN NOT NULL DEFAULT false;

-- Index for fast unsubscribe lookup
CREATE INDEX IF NOT EXISTS respondents_unsubscribed_idx ON respondents(unsubscribed)
  WHERE unsubscribed = true;
