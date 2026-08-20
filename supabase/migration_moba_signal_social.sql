-- ─── Moba Signal: LinkedIn share-of-voice store ───────────────────────────────
-- Series data from the LinkedIn competitor analytics export. Numeric, not
-- event-shaped: it gets its own store and dashboard module instead of rows in
-- the signal feed. Run in the Supabase SQL editor. Idempotent.

-- Page -> entity mapping, reused across uploads. Namesakes are excluded here
-- once, permanently: names are not identities.
create table if not exists moba_signal_social_pages (
  page_name  text primary key,           -- exactly as LinkedIn exports it
  entity_id  text references moba_signal_entities(id),
  include    boolean not null default true,
  note       text
);

create table if not exists moba_signal_social_stats (
  id            uuid primary key default gen_random_uuid(),
  page_name     text not null references moba_signal_social_pages(page_name),
  period_start  date not null,
  period_end    date not null,
  followers     int,
  new_followers int,
  engagements   int,
  posts         int,
  filename      text,
  uploaded_at   timestamptz not null default now(),
  unique (page_name, period_start, period_end)
);

alter table moba_signal_social_pages enable row level security;
alter table moba_signal_social_stats enable row level security;

-- Seed the known pages from the first export, traps included
insert into moba_signal_social_pages (page_name, entity_id, include, note) values
  ('Moba Group',                    'moba',   true,  null),
  ('MOBA Brasil',                   'moba',   true,  'Regional page, rolls up under Moba'),
  ('Moba Italia',                   'moba',   true,  'Regional page, rolls up under Moba'),
  ('MOBA France',                   'moba',   true,  'Regional page, rolls up under Moba'),
  ('SANOVO TECHNOLOGY GROUP',       'sanovo', true,  null),
  ('SANOVO TECHNOLOGY ROBOTICS',    'sanovo', true,  'Rolls up under Sanovo'),
  ('MOBA Mobile Automation',        null,     false, 'NAMESAKE: German construction-machinery electronics company. Not Moba Group. Excluded so it never skews the rollup.'),
  ('Innovatec Hatchery Automation', null,     true,  'Hatchery side, adjacent. Map to an entity if tracking starts.'),
  ('Meggson',                       null,     true,  'Unmapped: map to an entity if tracking starts.'),
  ('Ovoconcept',                    null,     true,  'Unmapped: map to an entity if tracking starts.')
on conflict (page_name) do nothing;
