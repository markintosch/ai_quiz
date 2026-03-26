-- Add lead capture behaviour flags to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS form_position TEXT NOT NULL DEFAULT 'pre'
    CHECK (form_position IN ('pre', 'post')),
  ADD COLUMN IF NOT EXISTS lead_capture_mode TEXT NOT NULL DEFAULT 'full'
    CHECK (lead_capture_mode IN ('full', 'minimal'));

COMMENT ON COLUMN public.companies.form_position IS 'pre = form before questions (default), post = form after questions';
COMMENT ON COLUMN public.companies.lead_capture_mode IS 'full = all fields, minimal = name + email only';
