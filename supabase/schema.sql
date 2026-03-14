-- ============================================================
-- KB Quiz — Supabase Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── companies ───────────────────────────────────────────────
create table companies (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  logo_url      text,
  custom_questions jsonb,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

comment on table companies is 'Client companies that run a branded Full quiz';

-- ─── cohorts ─────────────────────────────────────────────────
create table cohorts (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null references companies(id) on delete cascade,
  name          text not null,
  date          date,
  created_at    timestamptz not null default now()
);

comment on table cohorts is 'A group of respondents from the same company at a point in time';

-- ─── respondents ─────────────────────────────────────────────
create table respondents (
  id              uuid primary key default uuid_generate_v4(),
  cohort_id       uuid references cohorts(id) on delete set null,
  company_id      uuid references companies(id) on delete set null,
  name            text not null,
  email           text not null,
  job_title       text not null,
  company_name    text not null,
  industry        text,
  company_size    text,
  source          text not null check (source in ('public', 'company_slug')),
  gdpr_consent    boolean not null default false,
  calendly_status text,
  created_at      timestamptz not null default now()
);

comment on table respondents is 'Every person who completes or starts a quiz';
create index respondents_email_idx on respondents(email);
create index respondents_company_id_idx on respondents(company_id);

-- ─── responses ───────────────────────────────────────────────
create table responses (
  id                      uuid primary key default uuid_generate_v4(),
  respondent_id           uuid not null references respondents(id) on delete cascade,
  quiz_version            text not null check (quiz_version in ('lite', 'full')),
  attempt_number          integer not null default 1,
  answers                 jsonb not null default '{}',
  scores                  jsonb not null default '{}',
  maturity_level          text not null,
  shadow_ai_flag          boolean not null default false,
  shadow_ai_severity      text check (shadow_ai_severity in ('low', 'medium', 'high')),
  recommendation_payload  jsonb not null default '[]',
  created_at              timestamptz not null default now()
);

comment on table responses is 'Scored quiz result for a respondent attempt';
create index responses_respondent_id_idx on responses(respondent_id);

-- ─── questions ───────────────────────────────────────────────
create table questions (
  id          uuid primary key default uuid_generate_v4(),
  dimension   text not null,
  code        text not null unique,
  text        text not null,
  type        text not null check (type in ('likert', 'frequency', 'weighted_mc', 'multiselect')),
  options     jsonb not null default '[]',
  weight      integer not null default 1,
  is_custom   boolean not null default false,
  company_id  uuid references companies(id) on delete cascade,
  lite        boolean not null default false,
  active      boolean not null default true
);

comment on table questions is 'Question bank — includes standard and company-custom questions';

-- ─── sessions ────────────────────────────────────────────────
create table sessions (
  id                    uuid primary key default uuid_generate_v4(),
  respondent_id         uuid references respondents(id) on delete set null,
  quiz_version          text not null check (quiz_version in ('lite', 'full')),
  session_status        text not null default 'started'
                          check (session_status in ('started', 'partial', 'completed', 'abandoned')),
  quiz_model_version    text not null default '1.0',
  results_access_mode   text not null default 'direct',
  benchmark_eligible    boolean not null default false,
  consent_timestamp     timestamptz,
  privacy_notice_version text,
  created_at            timestamptz not null default now()
);

comment on table sessions is 'Tracks quiz session lifecycle and consent metadata';

-- ─── admin_users ─────────────────────────────────────────────
create table admin_users (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null unique,
  role        text not null default 'admin',
  created_at  timestamptz not null default now()
);

comment on table admin_users is 'Kirk & Blackbeard admin users';

-- ─── Row Level Security ──────────────────────────────────────
alter table companies       enable row level security;
alter table cohorts         enable row level security;
alter table respondents     enable row level security;
alter table responses       enable row level security;
alter table questions       enable row level security;
alter table sessions        enable row level security;
alter table admin_users     enable row level security;

-- Public read for active companies (needed for slug lookup)
create policy "Public can read active companies"
  on companies for select
  using (active = true);

-- Public read for active questions
create policy "Public can read active questions"
  on questions for select
  using (active = true);

-- Service role has full access (used by API routes with service key)
-- No additional policies needed — service role bypasses RLS
