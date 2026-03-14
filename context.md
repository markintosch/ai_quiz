# KB Quiz — Project Context

## What this is
An AI maturity diagnostic quiz platform for Kirk & Blackbeard.
Two purposes: (1) onboarding diagnostic for companies entering K&B training programmes, (2) public-facing lead generation engine.

## Tech stack
- Next.js 14 (App Router, TypeScript)
- Supabase (Postgres + Auth + Storage)
- Resend (transactional email)
- Vercel (hosting)
- Calendly (embedded scheduling)
- Tailwind CSS

## Project name
kb-quiz

## Two quiz versions
- LITE: 8–10 questions, public URL, lead capture POST-quiz before score reveal, directional score only
- FULL: 25–30 questions, company URL with branding, lead capture PRE-quiz, canonical score with full dashboard

## Scores are NOT directly comparable between Lite and Full

## Build phases
- Phase 1: Quiz engine, scoring, lead capture, results page, Calendly embed, email trigger, admin notification
- Phase 2: Admin dashboard, company/cohort management, branding, custom questions, heatmap
- Phase 3: Retake logic, exports, benchmarking, privacy hardening

## Current phase: 1

---

## Dimension weights
| Dimension              | Weight |
|------------------------|--------|
| Strategy & Vision      | 22%    |
| Governance & Risk      | 22%    |
| Current Usage          | 16%    |
| Data Readiness         | 15%    |
| Talent & Culture       | 15%    |
| Opportunity Awareness  | 10%    |

## Maturity levels
| Score  | Level         |
|--------|---------------|
| 0–20   | Unaware       |
| 21–40  | Exploring     |
| 41–60  | Experimenting |
| 61–80  | Scaling       |
| 81–100 | Leading       |

## Shadow AI flag
Triggered when: Current Usage score > ((Strategy score + Governance score) / 2) + threshold
Severity: Low = gap 10–20pts, Medium = 20–35pts, High = 35+pts
At High severity: promote to primary recommendation regardless of dimension scores

## Calendly routing
Score < 50 → 15-min Discovery Call
Score ≥ 50 → 30-min Strategy Session
Auto-fill name + email via URL params

---

## Supabase tables (core data model)

### companies
id uuid PK
name text
slug text UNIQUE (used in URL: /quiz/[slug])
logo_url text nullable
custom_questions jsonb nullable
active boolean default true
created_at timestamptz

### cohorts
id uuid PK
company_id uuid FK → companies.id
name text
date date
created_at timestamptz

### respondents
id uuid PK
cohort_id uuid nullable FK → cohorts.id
company_id uuid nullable FK → companies.id
name text
email text
job_title text
company_name text
industry text nullable
company_size text nullable
source text (public | company_slug)
gdpr_consent boolean
calendly_status text nullable
created_at timestamptz

### responses
id uuid PK
respondent_id uuid FK → respondents.id
quiz_version text (lite | full)
attempt_number integer default 1
answers jsonb
scores jsonb
maturity_level text
shadow_ai_flag boolean default false
shadow_ai_severity text nullable (low | medium | high)
recommendation_payload jsonb
created_at timestamptz

### questions
id uuid PK
dimension text
code text UNIQUE (e.g. SV1, UA2)
text text
type text (likert | frequency | weighted_mc | multiselect)
options jsonb
weight integer default 1
is_custom boolean default false
company_id uuid nullable FK → companies.id
lite boolean default false
active boolean default true

### sessions
id uuid PK
respondent_id uuid nullable FK → respondents.id
quiz_version text
session_status text (started | partial | completed | abandoned)
quiz_model_version text
results_access_mode text
benchmark_eligible boolean default false
consent_timestamp timestamptz
privacy_notice_version text
created_at timestamptz

### admin_users
id uuid PK
email text UNIQUE
role text default 'admin'
created_at timestamptz

---

## Environment variables needed
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=
NEXT_PUBLIC_CALENDLY_DISCOVERY_URL=
NEXT_PUBLIC_CALENDLY_STRATEGY_URL=
NEXT_PUBLIC_BASE_URL=

---

## Folder structure (target)
src/
  app/
    quiz/
      page.tsx              ← public Lite quiz
      [slug]/
        page.tsx            ← company Full quiz
    results/
      [id]/
        page.tsx            ← respondent results page
    admin/
      page.tsx              ← admin dashboard (Phase 2)
  components/
    quiz/
      QuizEngine.tsx
      QuestionCard.tsx
      ProgressBar.tsx
      LeadCaptureForm.tsx
    results/
      ScoreDashboard.tsx
      DimensionBreakdown.tsx
      ShadowAIFlag.tsx
      RecommendationCard.tsx
      CalendlyEmbed.tsx
  lib/
    supabase/
      client.ts
      server.ts
    scoring/
      engine.ts             ← core scoring logic
      shadowAI.ts           ← shadow AI flag logic
      recommendations.ts    ← rule-based recommendation engine
    email/
      templates/
        summary.tsx         ← respondent email template
        adminNotification.tsx
      sender.ts
  types/
    index.ts                ← all shared TypeScript types
  data/
    questions.ts            ← full question bank as typed constants