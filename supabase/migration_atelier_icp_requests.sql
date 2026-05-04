-- FILE: supabase/migration_atelier_icp_requests.sql
-- ──────────────────────────────────────────────────────────────────────────────
-- Tag standalone ICP requests so the UI can distinguish them from
-- session-derived ICPs and starter ICPs.
--
-- - request_keywords: non-null when the ICP was generated on demand from
--   the /atelier/icps "Aanvraag ICP" button. Stores the original input.
-- - The session_id column is already nullable (since v07).
-- - Existing rows are unaffected.

ALTER TABLE atelier_icp_profiles
  ADD COLUMN IF NOT EXISTS request_keywords TEXT,
  -- Chat history for refinement: array of { question, answer, refined_at }.
  -- Each refinement also writes back into the typed columns above (industry,
  -- triggers, etc.) so the page renders the latest state without parsing JSON.
  ADD COLUMN IF NOT EXISTS refinement_history JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_atelier_icp_request
  ON atelier_icp_profiles (request_keywords)
  WHERE request_keywords IS NOT NULL;
