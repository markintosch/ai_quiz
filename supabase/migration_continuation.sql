-- migration_continuation.sql
-- Adds parent_response_id to `responses` so a Lite → Full continuation can be
-- linked back to its parent lite response. Required for the lite-to-extended
-- upgrade flow on the results page.
--
-- Optional / nullable. Existing rows stay NULL. Existing flows unchanged.

ALTER TABLE responses
  ADD COLUMN IF NOT EXISTS parent_response_id UUID
  REFERENCES responses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_responses_parent ON responses(parent_response_id);

-- RLS already enabled on responses; no new policies needed (service role
-- writes; anon reads the row by id which is unguessable).
