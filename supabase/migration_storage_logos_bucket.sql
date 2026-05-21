-- ── Storage bucket: 'logos' (public read) ───────────────────────────────────
-- Used by /api/admin/upload for all admin image uploads (company logos, the
-- HCSS "Herkenbaar?" photo, etc.). Uploads run with the service-role key and
-- bypass RLS; a public bucket makes getPublicUrl() links readable.
--
-- Run once in the Supabase SQL Editor (or create the bucket via the dashboard:
-- Storage → New bucket → name 'logos' → Public).

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do update set public = true;
