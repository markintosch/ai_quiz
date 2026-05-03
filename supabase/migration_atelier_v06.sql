-- ─────────────────────────────────────────────────────────────────────────────
-- migration_atelier_v06.sql
-- Atelier v0.6 — ICP tracking. Adds validation state + supersede chain
-- to atelier_icp_profiles so the ICP library becomes a real knowledge base.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE atelier_icp_profiles
  ADD COLUMN IF NOT EXISTS validation_status TEXT
    NOT NULL DEFAULT 'pending'
    CHECK (validation_status IN ('pending','validated','dismissed','superseded')),
  ADD COLUMN IF NOT EXISTS validation_note TEXT,
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS superseded_by_id UUID REFERENCES atelier_icp_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_atelier_icp_status ON atelier_icp_profiles (validation_status);
CREATE INDEX IF NOT EXISTS idx_atelier_icp_superseded ON atelier_icp_profiles (superseded_by_id);
