-- FILE: supabase/migration_moba_signal_paper.sql
-- ─── Moba Signal — brand & positioning paper ─────────────────────────────────
-- One edition per quarter. The Positioning agent drafts; the analyst approves
-- in the console; the dashboard renders approved editions only. Positioning
-- pages are the per-company public pages the agent reads at draft time.

create table if not exists moba_signal_papers (
  edition      text primary key,                -- '2026-Q3'
  status       text not null default 'draft' check (status in ('draft','approved')),
  subjects     text[] not null,
  content      jsonb not null,                  -- PositioningPaper, camelCase
  generated_at timestamptz not null default now(),
  approved_by  text,
  approved_at  timestamptz
);

create table if not exists moba_signal_paper_pages (
  id        uuid primary key default gen_random_uuid(),
  entity_id text not null references moba_signal_entities(id),
  url       text not null,
  label     text,
  active    boolean not null default true,
  unique (entity_id, url)
);

-- RLS: deny-all. Service-role access only, like every moba_signal table.
alter table moba_signal_papers enable row level security;
alter table moba_signal_paper_pages enable row level security;

-- Seed: the positioning pages per subject. Public pages only; blocked sites
-- fall back to Internet Archive snapshots at draft time.
insert into moba_signal_paper_pages (entity_id, url, label) values
  ('moba',   'https://www.moba.net/page/en/company/about-moba',            'About Moba'),
  ('moba',   'https://www.moba.net/page/en/products',                      'Product overview'),
  ('moba',   'https://www.moba.net/page/en/imoba',                         'iMoba digital platform'),
  ('sanovo', 'https://www.sanovogroup.com/en/about-us/',                   'About Sanovo'),
  ('sanovo', 'https://www.sanovogroup.com/en/egg-handling/',               'Egg handling portfolio'),
  ('sanovo', 'https://www.sanovogroup.com/en/egg-processing/',             'Egg processing portfolio'),
  ('nabel',  'https://www.nabel.co.jp/en/',                                'NABEL English home'),
  ('nabel',  'https://www.nabel.co.jp/en/company/',                        'Company profile'),
  ('nabel',  'https://www.nabel.co.jp/en/products/',                       'Product lineup')
on conflict (entity_id, url) do nothing;
