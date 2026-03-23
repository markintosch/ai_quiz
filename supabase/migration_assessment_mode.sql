-- Add assessment_mode to companies
-- 'internal' = assessing own employees (default, existing behaviour)
-- 'external' = assessing clients / prospects — copy shifts from company-as-subject to respondent-as-subject
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS assessment_mode TEXT DEFAULT 'internal'
    CHECK (assessment_mode IN ('internal', 'external'));
