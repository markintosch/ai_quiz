-- Fix: remove overly-restrictive CHECK constraint on respondents.source
--
-- The original schema had: check (source in ('public', 'company_slug'))
-- The submit route was updated to store the actual company slug (e.g. 'new-tailor')
-- instead of the literal string 'company_slug', but the DB constraint was never updated.
-- This caused every company quiz submission to fail with "Failed to save respondent".
--
-- Run this in the Supabase SQL Editor.

ALTER TABLE respondents
  DROP CONSTRAINT IF EXISTS respondents_source_check;

-- Verify the constraint is gone (should return 0 rows):
-- SELECT conname FROM pg_constraint
-- WHERE conrelid = 'respondents'::regclass AND contype = 'c' AND conname LIKE '%source%';
