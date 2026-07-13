-- migration_response_attribution.sql
-- Documents the traffic-attribution columns on `responses`.
--
-- These columns are already written by the submit route
-- (src/app/api/submit/route.ts) and read by the stats dashboard
-- (src/app/api/admin/stats/route.ts), and they exist in the live database,
-- but they were never captured in a committed migration. This file closes
-- that gap so the schema is reproducible from source.
--
-- All columns are optional / nullable. Existing rows stay NULL. Existing
-- flows are unchanged. `ADD COLUMN IF NOT EXISTS` makes this a no-op if the
-- columns are already present (which they are in production).

ALTER TABLE responses
  ADD COLUMN IF NOT EXISTS ref_source   text,
  ADD COLUMN IF NOT EXISTS utm_source   text,
  ADD COLUMN IF NOT EXISTS utm_medium   text,
  ADD COLUMN IF NOT EXISTS utm_campaign text;

-- Filtered by the stats dashboard (e.g. .eq('ref_source', 'mentor')).
CREATE INDEX IF NOT EXISTS idx_responses_ref_source ON responses(ref_source);

-- RLS already enabled on responses; no new policies needed (service role
-- writes; anon reads the row by id which is unguessable).
