-- Add notify_email to companies: when set, every lead submission CC's this address
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notify_email text;
