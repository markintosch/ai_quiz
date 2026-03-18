-- Migration: company page access code
-- Optional PIN/passphrase gate per company. NULL = no gate (open access).
ALTER TABLE companies ADD COLUMN IF NOT EXISTS access_code text;
