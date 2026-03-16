# KB Quiz — Project Context

## What this is
An AI maturity diagnostic quiz platform for Kirk & Blackbeard / Brand PWRD Media.
Two purposes: (1) onboarding diagnostic for companies entering K&B training programmes, (2) public-facing lead generation engine.

## Tech stack
- Next.js 14.2.5 (App Router, TypeScript)
- Supabase (Postgres + RLS)
- Resend (transactional email)
- Vercel (hosting, deployment)
- Calendly (embedded scheduling)
- Tailwind CSS + Framer Motion
- next-intl v4 (EN / NL / FR)
- recharts (admin statistics charts)

## Project name
kb-quiz / AI Quiz

---

## Two quiz versions
- **LITE**: 7 questions, public URL (`/[locale]/quiz`), lead capture POST-quiz before score reveal, directional score only
- **FULL**: 26 questions, company URL (`/[locale]/quiz/[slug]`), lead capture PRE-quiz, canonical score with full dashboard

## Scores are NOT directly comparable between Lite and Full

---

## Build phases — status

### Phase 1 ✅ COMPLETE
- Quiz engine (QuizEngine, QuestionCard, ProgressBar, LeadCaptureForm)
- Scoring engine with dimension weights, maturity levels, Shadow AI flag
- Rule-based recommendation engine
- Results page with radar chart, score dashboard, dimension breakdown
- Calendly embed (score-routed)
- Email: respondent summary + admin notification (Resend)
- Supabase data model: companies, cohorts, respondents, responses, questions, sessions

### Phase 2 ✅ COMPLETE
- Admin dashboard (cookie-auth, `/admin`)
  - Dashboard: KPIs, recent responses
  - Respondents list + detail view
  - Companies: create/edit (branding, colour picker, welcome message, excluded questions)
  - Cohorts management
  - Benchmark view
  - Statistics page (recharts: weekly trend, maturity distribution, dimensions heatmap, industry/size breakdown)
  - Homepage + company page CMS editor (stored in `site_content` table, live on next page load)
  - CSV export (`/api/admin/export`)
  - Company report email (`/api/admin/companies/[id]/report`)
- Company-branded landing page (`CompanyLandingPage`) with accentColor, logo, welcome message
- Benchmark comparison component (market / cohort / role)
- Referral section (GDPR-compliant one-time invite email)
- Public landing page (`/[locale]`) with Framer Motion scroll animations
- Multilingual support: EN / NL / FR via next-intl
- Locale-less URL redirects: `/quiz/[slug]` → `/en/quiz/[slug]`

### Phase 3 — PENDING
- Retake logic (detect returning respondent by email, increment attempt_number)
- Privacy hardening (auto-delete after retention period)
- Advanced cohort comparison view in admin

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

## Question bank
26 questions total: SV×4, UA×4, DR×4, TC×6, GR×5, OA×3
Lite quiz uses a subset of 7 questions (flagged `lite: true` in data)

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
At High severity: promoted to primary recommendation regardless of dimension scores

## Calendly routing
Score < 50 → 15-min Discovery Call
Score ≥ 50 → 30-min Strategy Session
Auto-fill name + email via URL params

---

## Supabase tables

### companies
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | Display name (underscores replaced with spaces in UI) |
| slug | text UNIQUE | Used in URL: `/quiz/[slug]` |
| logo_url | text nullable | |
| brand_color | text default '#E8611A' | Accent colour for branded page |
| welcome_message | text nullable | Override default welcome copy |
| excluded_question_codes | text[] default '{}' | Question codes to skip for this company |
| custom_questions | jsonb nullable | Reserved for future custom Qs |
| active | boolean default true | Controls whether /quiz/[slug] is accessible |
| created_at | timestamptz | |

### cohorts
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| company_id | uuid FK → companies.id | |
| name | text | |
| date | date nullable | |
| created_at | timestamptz | |

### respondents
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| cohort_id | uuid nullable FK → cohorts.id | |
| company_id | uuid nullable FK → companies.id | |
| name | text | |
| email | text | |
| job_title | text | |
| company_name | text | |
| industry | text nullable | |
| company_size | text nullable | |
| source | text | `public` or company slug |
| gdpr_consent | boolean | Required consent |
| marketing_consent | boolean default false | Optional marketing opt-in |
| unsubscribed | boolean default false | One-click unsubscribe |
| calendly_status | text nullable | |
| created_at | timestamptz | |

### responses
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| respondent_id | uuid FK → respondents.id | |
| quiz_version | text | `lite` or `full` |
| attempt_number | integer default 1 | |
| answers | jsonb | |
| scores | jsonb | |
| maturity_level | text | |
| shadow_ai_flag | boolean default false | |
| shadow_ai_severity | text nullable | `low`, `medium`, `high` |
| recommendation_payload | jsonb | |
| created_at | timestamptz | |

### questions
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| dimension | text | |
| code | text UNIQUE | e.g. SV1, UA2 |
| text | text | |
| type | text | `likert`, `frequency`, `weighted_mc`, `multiselect` |
| options | jsonb | |
| weight | integer default 1 | |
| is_custom | boolean default false | |
| company_id | uuid nullable FK | For custom questions |
| lite | boolean default false | Include in Lite quiz |
| active | boolean default true | |

### sessions
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| respondent_id | uuid nullable FK | |
| quiz_version | text | |
| session_status | text | `started`, `partial`, `completed`, `abandoned` |
| quiz_model_version | text | |
| results_access_mode | text | |
| benchmark_eligible | boolean default false | |
| consent_timestamp | timestamptz | |
| privacy_notice_version | text | |
| created_at | timestamptz | |

### site_content *(CMS)*
| Column | Type | Notes |
|---|---|---|
| locale | text PK | `en`, `nl`, `fr` |
| content | jsonb default '{}' | Nested: `{ landing: {...}, company: {...} }` |
| updated_at | timestamptz | |

---

## Migrations to run in Supabase SQL Editor
1. `supabase/schema.sql` — base schema (Phase 1)
2. `supabase/migration_phase2.sql` — adds brand_color, welcome_message, excluded_question_codes, marketing_consent, unsubscribed
3. `supabase/migration_cms.sql` — creates site_content table, seeds EN/NL/FR rows

---

## Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role key (server/API only)
RESEND_API_KEY=                   # re_XXXX from resend.com
ADMIN_EMAIL=                      # Admin notification recipient
ADMIN_SECRET=                     # or ADMIN_PASSWORD — admin dashboard cookie value
NEXT_PUBLIC_CALENDLY_DISCOVERY_URL=
NEXT_PUBLIC_CALENDLY_STRATEGY_URL=
NEXT_PUBLIC_BASE_URL=             # e.g. https://aiquiz.brandpwrdmedia.nl
```

---

## Routing structure
```
/[locale]                         ← Public landing page
/[locale]/quiz                    ← Lite quiz (7 questions, post-lead)
/[locale]/quiz/[slug]             ← Company full quiz (26 questions, pre-lead)
/[locale]/quiz/extended           ← Extended/full quiz public entry
/[locale]/results/[id]            ← Results dashboard
/privacy                          ← Privacy policy
/unsubscribe                      ← Email unsubscribe handler

/admin                            ← Dashboard (cookie-auth)
/admin/respondents                ← Respondents list
/admin/companies                  ← Companies list
/admin/companies/new              ← Create company
/admin/companies/[id]             ← Edit company (branding, excluded questions)
/admin/cohorts                    ← Cohorts management
/admin/benchmark                  ← Benchmark view
/admin/stats                      ← Visual statistics (recharts)
/admin/content                    ← CMS editor (landing + company page copy, EN/NL/FR)

/api/submit                       ← POST quiz submission → score → Supabase → emails
/api/referral                     ← POST one-time referral invite (Resend, email not stored)
/api/admin/content                ← GET/PUT CMS content blobs
/api/admin/export                 ← GET CSV export (?company_id= &version=)
/api/admin/companies/[id]/report  ← POST send company report email
/api/admin/stats                  ← GET statistics aggregates
```

---

## Folder structure (actual)
```
src/
  app/
    [locale]/
      layout.tsx               ← next-intl provider + Supabase CMS merge + SEO/OG
      page.tsx                 ← Public landing page
      opengraph-image.tsx      ← OG image generator
      quiz/
        page.tsx               ← Lite quiz
        extended/page.tsx      ← Full quiz public entry
        [slug]/page.tsx        ← Company branded quiz
      results/[id]/page.tsx    ← Results dashboard
    admin/
      layout.tsx               ← Admin nav + cookie auth
      page.tsx                 ← Dashboard
      respondents/...
      companies/...
      cohorts/...
      benchmark/...
      stats/page.tsx
      content/page.tsx         ← CMS editor
    api/
      submit/route.ts
      referral/route.ts
      admin/
        content/route.ts
        export/route.ts
        stats/route.ts
        companies/[id]/report/route.ts
    privacy/page.tsx
    unsubscribe/page.tsx
  components/
    quiz/
      QuizEngine.tsx
      QuestionCard.tsx
      ProgressBar.tsx
      LeadCaptureForm.tsx
      CompanyLandingPage.tsx   ← Company intro + language switcher
    results/
      ScoreDashboard.tsx
      DimensionBreakdown.tsx
      ShadowAIFlag.tsx
      RecommendationCard.tsx
      CalendlyEmbed.tsx
      BenchmarkComparison.tsx
      ReferralSection.tsx
    admin/
      SendReportButton.tsx
      CompanyEditForm.tsx
    LanguageSwitcher.tsx        ← EN/NL/FR, variant: dark/light
  lib/
    supabase/
      client.ts                ← Browser client (anon key)
      server.ts                ← Server client (anon) + createServiceClient (service role)
    scoring/
      engine.ts                ← Scoring + type definitions (DimensionScore, QuizScore etc.)
      recommendations.ts       ← Rule-based recommendation engine
    email/
      templates/
        summary.tsx
        adminNotification.tsx
        referralInvite.tsx
        companyReport.tsx
      sender.ts
  types/
    index.ts                   ← Re-exports from engine.ts; AnswerMap defined here
    supabase.ts                ← DB types (not auto-generated — manual)
  data/
    questions.ts               ← 26 questions as typed constants (uppercase Q filename)
  i18n/
    routing.ts                 ← locales: ['en','nl','fr'], defaultLocale: 'en'
    request.ts                 ← getRequestConfig, loads messages/[locale].json
messages/
  en.json                      ← English translations
  nl.json                      ← Dutch translations
  fr.json                      ← French translations
supabase/
  schema.sql
  migration_phase2.sql
  migration_cms.sql
```

---

## i18n / CMS architecture
- **next-intl v4** handles locale routing under `/[locale]/`
- JSON message files (`messages/[locale].json`) are the source of truth / fallback
- **Supabase `site_content` table** stores admin overrides as nested JSONB: `{ landing: {...}, company: {...} }`
- `[locale]/layout.tsx` deep-merges DB overrides on top of JSON messages at request time — changes go live without redeploy
- CMS editor at `/admin/content` covers both landing page and company quiz page copy for EN/NL/FR

## Type ownership (circular dep fix)
- `DimensionScore`, `ShadowAIResult`, `QuizScore`, `MaturityLevel` → owned by `src/lib/scoring/engine.ts`
- `src/types/index.ts` re-exports them from engine to avoid circular deps
- `AnswerMap` lives in `src/types/index.ts` and is imported (type-only) by engine.ts

## Brand colours (tailwind.config.ts)
| Token | Hex | Usage |
|---|---|---|
| `brand` | `#354E5E` | Dark teal — logo background, page backgrounds |
| `brand-dark` | `#1E3340` | Darker teal |
| `brand-light` | `#2A4050` | Mid teal |
| `brand-accent` | `#E8611A` | Orange-red — default company accent |
| `brand-gold` | `#F5A820` | Amber — left of PWRD gradient |
| `bg-brand-gradient` | 135deg #F5A820→#E8611A | PWRD logo gradient |
