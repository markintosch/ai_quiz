-- ─── Moba Signal: competitive intelligence pipeline ──────────────────────────
-- Separate namespace from the MOBA survey (moba_*) and Atelier (atelier_*):
-- every table here is prefixed moba_signal_. Run in the Supabase SQL editor.
--
-- Design rules carried over from the PRD:
--   * Provenance is schema-enforced: an item cannot exist without a source and
--     a URL. Inference and human-review are explicit flags, never implied.
--   * Everything the agent writes lands as review_status='proposed'. The
--     dashboard renders only approved rows. One standard for agent and human.
--   * Rejections are kept, not deleted — the learning loop needs them.

-- ── Entities ──────────────────────────────────────────────────────────────────
create table if not exists moba_signal_entities (
  id             text primary key,                 -- slug, e.g. 'sanovo'
  name           text not null,
  type           text not null check (type in ('competitor','brand','product','technology','customer','facility','event','market')),
  ownership_kind text not null default 'independent' check (ownership_kind in ('independent','moba','group')),
  parent_id      text references moba_signal_entities(id),
  parent_name    text,
  priority       boolean not null default false,
  regions        text[] not null default '{}',
  aliases        text[] not null default '{}',     -- extra names the collector may see
  note           text,
  added_on       date not null default current_date,
  backfilled_to  date
);

-- ── Sources ───────────────────────────────────────────────────────────────────
create table if not exists moba_signal_sources (
  id             text primary key,                 -- slug, e.g. 'sanovo-news'
  name           text not null,
  url            text not null,
  source_class   text not null check (source_class in ('competitor-site','trade-press','patents','events','social','jobs','association','customer','human')),
  language       text,
  active         boolean not null default true,
  status         text not null default 'ok' check (status in ('ok','stale','failed','proposed')),
  last_run_at    timestamptz,
  last_item_at   timestamptz,
  failure_reason text,
  created_at     timestamptz not null default now()
);

-- ── Collected items (assertions) ──────────────────────────────────────────────
create table if not exists moba_signal_items (
  id             uuid primary key default gen_random_uuid(),
  event_date     date not null,                    -- date of the event, not of collection
  entity_id      text references moba_signal_entities(id),
  entity_guess   text,                             -- raw name when no entity matched yet
  linked_entity_ids text[] not null default '{}',
  title          text not null,
  summary        text not null,
  type           text not null check (type in ('launch','win','partnership','personnel','facility','funding','certification','moba')),
  region         text not null check (region in ('europe','americas','asia','mea','global')),
  category       text not null check (category in ('grading','processing','detection','digital','service','sustainability','corporate')),
  proximity      smallint not null check (proximity between 1 and 3),
  materiality    smallint not null check (materiality between 1 and 3),
  credibility    smallint not null check (credibility between 1 and 3),
  verification   text not null default 'unverified' check (verification in ('verified','unverified','disputed','superseded')),
  inference      boolean not null default false,
  quotes         text[] not null default '{}',     -- claim wording, source language preserved
  -- provenance: never optional
  source_id      text not null references moba_signal_sources(id),
  source_url     text not null,
  first_seen     timestamptz not null default now(),
  last_confirmed timestamptz not null default now(),
  asserted_by    text not null default 'collector',
  human_reviewed boolean not null default false,
  -- review flow: agents propose, humans publish
  review_status  text not null default 'proposed' check (review_status in ('proposed','approved','rejected')),
  reviewed_at    timestamptz,
  review_note    text,                             -- learning-loop record on downgrades/rejects
  dedupe_key     text not null,                    -- entity|type|date-bucket or url hash
  raw            jsonb,                            -- extractor output, for audit
  created_at     timestamptz not null default now()
);
create unique index if not exists moba_signal_items_dedupe on moba_signal_items(dedupe_key);
create index if not exists moba_signal_items_review on moba_signal_items(review_status, event_date desc);

-- ── Annotations (immutable to the agent) ──────────────────────────────────────
create table if not exists moba_signal_annotations (
  id             uuid primary key default gen_random_uuid(),
  item_id        uuid not null references moba_signal_items(id) on delete cascade,
  author         text not null,
  role           text not null default '',
  means          text not null,
  consider       text not null,
  who_needs_to_know text not null,
  promoted       boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ── Curator proposals and human contributions ─────────────────────────────────
create table if not exists moba_signal_proposals (
  id             uuid primary key default gen_random_uuid(),
  kind           text not null check (kind in ('source','entity','axis','contribution','claim-status')),
  title          text not null,
  rationale      text not null,
  proposed_by    text not null default 'curator',
  source_url     text,
  why            text,                             -- the required line on human contributions
  contributor    text,
  channel        text,
  confidential   boolean not null default false,
  state          text not null default 'pending' check (state in ('pending','accepted','rejected')),
  decided_at     timestamptz,
  created_at     timestamptz not null default now()
);
create unique index if not exists moba_signal_proposals_unique on moba_signal_proposals(kind, title);

-- ── Open question queue ───────────────────────────────────────────────────────
create table if not exists moba_signal_questions (
  id             uuid primary key default gen_random_uuid(),
  question       text not null,
  asked_by       text not null,
  asked_on       date not null default current_date,
  attempts       int not null default 0,
  last_attempt   date,
  state          text not null default 'open' check (state in ('open','resolved')),
  resolution     text
);

-- ── Context corpus (the lens, never scored, never in the feed) ────────────────
create table if not exists moba_signal_context (
  id             text primary key,
  name           text not null,
  owner          text not null,
  loaded_on      date not null default current_date,
  review_by      date not null,
  note           text,
  -- strategic accounts drive proximity scoring; stored here, analyst-only
  account_names  text[] not null default '{}'
);

-- ── Run log (source health panel reads this) ──────────────────────────────────
create table if not exists moba_signal_runs (
  id             uuid primary key default gen_random_uuid(),
  source_id      text not null references moba_signal_sources(id),
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  ok             boolean,
  pages_fetched  int not null default 0,
  items_found    int not null default 0,
  items_new      int not null default 0,
  error          text
);
create index if not exists moba_signal_runs_source on moba_signal_runs(source_id, started_at desc);

-- ── Seed: entities (ownership labels are data, not copy) ──────────────────────
insert into moba_signal_entities (id, name, type, ownership_kind, parent_id, parent_name, priority, regions, aliases, note) values
  ('moba',      'Moba',             'brand',      'moba',        null,     null,        false, '{global}',       '{"Moba Group","Moba B.V."}', null),
  ('diamond',   'Diamond',          'brand',      'moba',        null,     null,        false, '{americas}',     '{"Diamond Automations","Diamond Moba Americas","Moba USA"}', 'Tracked so Americas mentions classify correctly, never as competitor presence.'),
  ('sanovo',    'Sanovo',           'competitor', 'independent', null,     null,        true,  '{global}',       '{"Sanovo Technology Group","SANOVO"}', null),
  ('staalkat',  'Staalkat',         'brand',      'group',       'sanovo', 'Sanovo',    false, '{europe}',       '{}', null),
  ('vencomatic','Vencomatic Group', 'competitor', 'independent', null,     null,        false, '{europe}',       '{"Vencomatic"}', null),
  ('prinzen',   'Prinzen',          'competitor', 'group',       'vencomatic', 'Vencomatic', true, '{europe,asia}', '{}', null),
  ('nabel',     'NABEL',            'competitor', 'independent', null,     null,        true,  '{asia}',         '{"Nabel Co."}', null),
  ('kyowa',     'Kyowa',            'competitor', 'independent', null,     null,        false, '{asia}',         '{"Kyowa Machinery"}', null),
  ('zenyer',    'Zenyer',           'competitor', 'independent', null,     null,        true,  '{asia,mea}',     '{}', null),
  ('riva',      'Riva Selegg',      'competitor', 'independent', null,     null,        false, '{europe}',       '{"Riva"}', null)
on conflict (id) do nothing;

-- ── Seed: sources (public pages only, PRD §8.6) ───────────────────────────────
insert into moba_signal_sources (id, name, url, source_class, language) values
  ('sanovo-news',   'Sanovo newsroom',            'https://www.sanovogroup.com/news/',       'competitor-site', null),
  ('prinzen-news',  'Prinzen news',               'https://www.prinzen.com/news/',           'competitor-site', null),
  ('vencomatic-news','Vencomatic news',           'https://www.vencomaticgroup.com/news/',   'competitor-site', null),
  ('nabel-news',    'NABEL news (JP)',            'https://www.nabel.co.jp/news/',           'competitor-site', 'Japanese'),
  ('zenyer-news',   'Zenyer news',                'https://www.zenyer.com/news/',            'competitor-site', 'Chinese'),
  ('kyowa-news',    'Kyowa news (JP)',            'https://www.kyowa-jpn.co.jp/',            'competitor-site', 'Japanese'),
  ('riva-news',     'Riva Selegg news (IT)',      'https://www.rivaselegg.com/',             'competitor-site', 'Italian'),
  ('watt-poultry',  'WATT Poultry',               'https://www.wattagnet.com/',              'trade-press',     null),
  ('poultry-world', 'Poultry World',              'https://www.poultryworld.net/',           'trade-press',     null),
  ('moba-events',   'Moba events page (context)', 'https://www.moba.net/events/',            'events',          null)
on conflict (id) do nothing;

-- ── Seed: context corpus (owners and review dates required) ───────────────────
insert into moba_signal_context (id, name, owner, review_by, note, account_names) values
  ('ctx-messaging-house', 'Messaging house and claim set',      'Product marketing',  current_date + 30, 'Load the final house before the claims tracker goes live.', '{}'),
  ('ctx-accounts',        'Strategic account list',             'Sales operations',   current_date + 60, 'Drives proximity scoring. Analyst-only.', '{}'),
  ('ctx-events',          'Moba event calendar',                'Events team',        current_date + 30, null, '{}'),
  ('ctx-asia-research',   'Asia landscape research (baseline)', 'Chief Analyst',      current_date + 180, 'Timeline baseline for Asia; load as one-off extraction job.', '{}')
on conflict (id) do nothing;
