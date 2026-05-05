# Cycle Companion — PRD v1.0

**Cycle, mood & lifestyle tracking with daily readiness guidance.**
Personal app for one user (Mark's partner). Not a public service.

---

## 1. Scope & non-goals

**In scope (v1.0)**
- Single-user, EU-hosted, private
- Daily 30–60 sec check-in
- Readiness score + one-sentence guidance
- Cycle-aligned timeline
- Lightweight insights (after baseline learned)
- Daily email reminder

**Explicitly out of scope**
- Multi-tenancy, sign-ups, public access
- Monetization, marketing pages, SEO
- Web push notifications (v1.1+)
- Wearables / Apple Health (v1.2+)
- Symptom tracking beyond menstruation flag (revisit later)
- Nutrition logging
- "Medical advice" framing — this is a personal-pattern tool

---

## 2. Deployment

- **URL:** `markdekock.com/Cycle` (capital C)
- **Hosting model:** `markdekock.com` is served from this Ai_Quiz repo via host detection in `src/app/page.tsx`. The repo hosts ~12 standalone "product" subtrees (`/mentor`, `/atelier`, `/abbvie`, etc.) — each is self-contained, bypasses `next-intl` middleware, brings its own layout + language handling.
- **Integration pattern (mirrors `/mentor`):**
  1. New directory `src/app/Cycle/` with own `layout.tsx`, `page.tsx`, sub-routes (`login`, `onboarding`, `today`, `timeline`, `settings`)
  2. One-line middleware passthrough: `if (pathname.startsWith('/Cycle')) return NextResponse.next()` added to [middleware.ts](middleware.ts) alongside the existing standalone-page block
  3. API routes namespaced under `src/app/api/cycle/*`
  4. Supabase tables prefixed `cycle_*` (separate from existing `responses`, `companies`, etc.) to keep concerns isolated
- **Stack:** Next.js 14 App Router + Supabase + Resend + Tailwind (all already in repo)
- **Region:** Supabase — reuses the existing EU Frankfurt project. New tables under same project.
- **PWA:** installable to home screen (manifest + simple service worker for offline shell)
- **Locale:** Dutch only — no `[locale]` segment, just plain routes

---

## 3. Authentication

**Magic link, email allowlist.**

- Supabase Auth → email magic link
- Allowlist enforced in middleware: only her email + Mark's email can log in. Any other email gets a generic "no account" message (no enumeration).
- Session cookie: httpOnly, sameSite:strict, secure:true, 30-day TTL (longer than Ai_Quiz admin's 8h — this is daily-use)
- `/Cycle/*` routes guarded; `/Cycle/login` is the only public path
- Logout link in settings

**Why magic link over shared password:** no password to forget, no shared-secret to rotate, and it gives a real `auth.uid()` for RLS later if scope ever grows.

---

## 4. UX / UI direction

### 4.1 Principles

1. **One thing per screen.** No dashboards.
2. **Output is one number + one sentence.** Anything else is collapsed behind a tap.
3. **Soft, warm, personal.** Feminine without cliché — pastels and considered restraint, not corporate.
4. **Mobile-first, single-thumb.** Tap targets ≥56px. Bottom-anchored primary actions.

### 4.2 Visual system

**Palette (starting point — Mark to refine):**

Soft register throughout — blush, cream, dusty pastels. Low saturation, no harsh contrasts.

- Background light: `#FBF1ED` (blush-cream)
- Background dark: `#2A2422` (warm taupe — softer than true black, for evening use)
- Foreground: `#3D2F2A` (deep mocha) / `#FBF1ED`
- Muted: `#A89890` (warm grey)
- Subtle accent: `#D4847E` (dusty rose, for primary CTAs and the readiness number)

Phase accents (used in timeline + as soft tints behind cards):
- Menstrual: dusty rose `#D4847E`
- Follicular: pale sage `#A8BFA0`
- Ovulation: butter gold `#E8C896`
- Luteal: lavender mist `#B8A8C4`

**Typography:**
- Display / numerals: a soft serif (Cormorant Garamond, Tiempos Headline, or Source Serif Pro) — 64–96px for the readiness score. Adds warmth that Inter alone can't.
- Body: humanist sans (Inter or Söhne), 16–18px, 1.55 line-height
- No more than 2 weights per screen

**Motion:**
- 200–300ms fades and slides only, ease-out
- No bounces, no spring physics
- Score: animated count-up using existing `useCountUp` hook

**Restraint (still applies even in the soft palette):**
- No gradients on buttons or backgrounds
- No glassmorphism / blur effects
- Drop shadows max `0 2px 8px rgba(61, 47, 42, 0.06)` — soft and warm, not hard
- Iconography: thin-line, rounded ends. No emoji.

### 4.3 Screens

**a. Login** — email field, "send link" button, that's it.

**b. Daily check-in (5-step stepper)**
- Top: 5 progress dots
- Step 1 — Mood: 0–10 slider with current value as a large soft-serif number above. Below the slider, a small toggle: *"Was your mood variable today?"* (off by default). When on, the slider value is interpreted as her overall average for the day, and the entry is tagged `mood_variable=true` for insights to use.
- Step 2 — Sleep: large 1–10 slider, current value as big number above
- Step 3 — Activity: multi-select chips for type (None / Walk / Run / Cycle / Strength / Yoga / Other) — tap to toggle, multiple allowed. Below: single intensity chip row (Low / Medium / High) for the day's overall load. "None" hides intensity. Tap "Continue" to advance (auto-advance breaks with multi-select).
- Step 4 — Stress: 1–10 slider, same pattern as sleep
- Step 5 — Period today? Yes / No
- Auto-save after each step. Swipe back to edit.
- On final step: tap "See my day" → output screen

**c. Daily output**
- Hero: large readiness number (animated)
- Below: one-sentence guidance
- Below that: phase pill ("Day 14 — Ovulation") + weather chip ("12° rainy")
- Tap "why?" → expandable card showing the 4 score components as horizontal bars

**d. Timeline**
- Horizontal scroll, 28 days visible at default zoom
- One vertical bar per day — height = readiness, fill colour = mood, icon row beneath = activity + weather
- Cycle-phase tint as muted background band
- Tap a day → bottom sheet with that day's full entry

**e. Insights** (on-demand only)
- No card on home screen — insights surface only when explicitly asked.
- "Find a pattern" button at the bottom of the timeline view (visible only after ≥14 entries).
- Tap → shows one insight, full screen, with a "Show another" button. Tap-through cycles unseen rules.
- Empty state when nothing fires: "No clear patterns yet — keep going."

**f. Settings**
- Reminder time picker
- Cycle profile (last period start, typical length) — editable
- Export data: JSON or CSV (one button each)
- Delete all data (with confirmation)
- Log out

### 4.4 Empty / cold-start states

- **Day 0–2:** no readiness number shown. Replaced with: "Learning your baseline — 3 entries needed."
- **Day 3–13:** readiness number shown, but tagged "early days" subtly. No insights surfaced.
- **Day 14+:** full experience.

### 4.5 Accessibility (light pass)

- Slider current values shown as large numerals (not just position)
- Contrast ratios ≥4.5:1 throughout
- All interactive elements keyboard-reachable
- Reduce-motion media query disables animations

---

## 5. Daily check-in inputs

| Input | Type | Required | Notes |
|---|---|---|---|
| Mood score | 0–10 | Yes | Slider; defaults to 5 on first open |
| Mood variable | bool | No | Toggle below slider; default false |
| Sleep | 1–10 | Yes | Self-reported, no wearable in v1.0 |
| Activity types | multi-select | Yes | None / Walk / Run / Cycle / Strength / Yoga / Other (multiple allowed) |
| Activity intensity | enum | If types ≠ {None} | Low / Medium / High — applies to overall day |
| Stress | 1–10 | Yes | |
| Menstruation today | bool | Yes | |

**Auto-collected:**
- `weather_snapshot` — once per day, on first check-in of the day, via Open-Meteo using stored lat/lon
- `cycle_phase` — derived (see §7)
- `readiness_score` — derived (see §6)

---

## 6. Readiness score

### 6.1 Formula (v1.0 — explicitly tunable)

```
readiness = round(
  0.40 * sleepScore +
  0.25 * cyclePhaseScore +
  0.20 * activityRecoveryScore +
  0.15 * stressScore
)
```

Where each component is normalised to 0–100.

- **sleepScore** = `sleep_1_to_10 * 10`
- **stressScore** = `(11 - stress_1_to_10) * 10` (inverted)
- **cyclePhaseScore**: ovulation=85, follicular=75, luteal-early=60, menstrual=55, luteal-late=45, unknown=70 (neutral)
- **activityRecoveryScore**:
  - Yesterday high intensity → 50
  - Yesterday medium → 70
  - Yesterday low or rest → 85
  - No yesterday data → 70 (neutral)

### 6.2 Bands

- 80–100: "High capacity"
- 60–79: "Good"
- 40–59: "Moderate"
- <40: "Low — recovery day"

### 6.3 Calibration loop

- Daily output screen has a small thumbs up / thumbs down: "Did this match how you felt?"
- Persist as `score_feedback` per day
- After ~60 entries, review and re-tune weights manually. Not auto-learned in v1.0.

### 6.4 Cold-start

- 0–2 entries: hide score, show "learning baseline"
- 3–13 entries: show score, no insights
- 14+ entries: full experience

---

## 7. Cycle phase detection

### 7.1 Inputs

- `cycle_profile.last_period_start` (date) — set in onboarding
- `cycle_profile.typical_length` (int days, default 28) — set in onboarding
- `daily_entries.menstruation_flag` — refines the prediction over time

### 7.2 Phase windows (regular cycle)

Anchor: `day_of_cycle = days_since_last_period_start % observed_length`

- Day 1 to ~5 → **menstrual**
- Day 6 to ~13 → **follicular**
- Day 14 to ~16 → **ovulation**
- Day 17 to (length−5) → **luteal-early**
- Last 5 days of cycle → **luteal-late**

`observed_length` = mean length of last 3 completed cycles (computed from menstruation_flag transitions). Falls back to `typical_length` if <2 cycles observed.

### 7.3 Irregular-cycle handling (perimenopause path)

If the last 3 observed cycle lengths vary by >7 days OR a cycle is >45 days:
- Mark phase as **unknown**
- `cyclePhaseScore` falls back to neutral (70)
- Daily output adds a soft note: "Cycle pattern is variable lately — score uses sleep and stress only."

This is a v1.0 must-have given perimenopause is in scope.

### 7.4 Tests

Phase-detection module ships with a fixture suite. Required cases:
- Regular 28-day cycle, days 1/7/14/21/27
- Regular 35-day cycle
- First-ever entry (no cycle history)
- Two cycles, irregular (24 days, 38 days) → unknown
- Skipped month (>45 days) → unknown
- Menstruation_flag fires mid-cycle (spotting) → ignored unless gap≥10 days

---

## 8. Insights engine

### 8.1 Rules (v1.0 — hand-coded, no ML)

Each rule needs ≥14 entries before it can fire. Frequency cap: max 1 new insight per 7 days.

- **Sleep → mood**: if Pearson(sleep, mood) over last 30 days < −0.3 → "Low sleep often leads to lower mood for you."
- **Stress → mood**: same pattern, inverted
- **Activity → next-day readiness**: if avg readiness day-after-low-activity > avg readiness day-after-high-activity by >10 → "You feel better the day after lighter activity."
- **Cycle → mood**: if mood in luteal-late < other phases by >1 point → "Your mood tends to dip in the days before your period."
- **Weather → mood**: if mood on rainy days < non-rainy by >0.5 with n≥10 of each → "Rain seems to affect your mood slightly."

### 8.2 Display (on-demand, not pushed)

- No automatic surfacing on home or output screens.
- "Find a pattern" button at the bottom of the timeline view, visible only after ≥14 entries.
- Tap → full-screen insight card with one rule at a time + "Show another" button. Cycles through unseen rules.
- Frequency cap removed since insights are pull-only (no risk of spamming her).
- Empty state: "No clear patterns yet — keep going."

**Rationale for pull-only:** automatic insights risk feeling preachy or like noise. Letting her ask is calmer and gives the surface a sense of agency.

---

## 9. Notifications (v1.0 = email only)

- **Channel:** email via Resend (already configured in repo).
- **Time:** chosen by her during onboarding via a time picker. Default 20:00 Europe/Amsterdam. Editable later in Settings.
- **Onboarding step:** "What time would you like a daily reminder?" → time picker → continue.
- **Implementation:** Vercel Cron hits `/api/cron/daily-reminder` every 15 min, protected by `CRON_SECRET`. Route checks "is it within ±15min of her reminder time AND no entry today" → send via Resend.
- **Skip days:** if she's already entered today, no reminder fires.
- **Phase-based notifications (PMS warning, high-energy window):** v1.1 — needs more cycle history to be useful and not noisy.
- **SMS / push:** out of scope for v1.0. Push lands in v1.1 if she ever asks.

---

## 10. Weather

- **Provider:** Open-Meteo (free, no key, EU-friendly)
- **Lat/lon:** stored once in `cycle_profile` from onboarding (city → geocode → coords). No live geolocation.
- **Persistence:** `weather_snapshot` row written on first check-in of the day. Includes temp, precipitation, cloud cover, wind. Never refetched for past dates.
- **Display:** small icon + temp in timeline + on daily output

---

## 11. Data model

### Tables

**`cycle_profile`** (one row per user)
- `user_id` UUID PK (Supabase auth uid)
- `last_period_start` DATE
- `typical_length` INT default 28
- `lat`, `lon` NUMERIC
- `timezone` TEXT default 'Europe/Amsterdam'
- `reminder_time` TIME default '20:00' (set during onboarding)
- `created_at`, `updated_at`

**`daily_entries`**
- `id` UUID PK
- `user_id` UUID FK
- `entry_date` DATE
- `mood_score` SMALLINT (0–10)
- `mood_variable` BOOLEAN default false
- `sleep` SMALLINT (1–10)
- `stress` SMALLINT (1–10)
- `activity_types` TEXT[] — array, e.g. `{"Walk","Yoga"}`
- `activity_intensity` TEXT nullable — applies to overall day, null if activity_types = `{"None"}`
- `menstruation_flag` BOOL
- `readiness_score` SMALLINT (computed at write time)
- `cycle_phase` TEXT (computed at write time)
- `score_feedback` SMALLINT nullable (-1, 0, 1)
- `created_at`, `updated_at`
- **UNIQUE (user_id, entry_date)** — prevents double-submit

**`weather_snapshots`**
- `id` UUID PK
- `user_id` UUID FK
- `entry_date` DATE
- `temp_c`, `precip_mm`, `cloud_pct`, `wind_kmh` NUMERIC
- `condition` TEXT (sunny / cloudy / rainy / snow)
- **UNIQUE (user_id, entry_date)**

**`insights_seen`**
- `id` UUID PK
- `user_id` UUID FK
- `rule_key` TEXT
- `surfaced_at` TIMESTAMPTZ
- `dismissed_at` TIMESTAMPTZ nullable

### RLS

All four tables: `ENABLE ROW LEVEL SECURITY` + policy `user_id = auth.uid()`. Migration file committed before deploy (per Ai_Quiz feedback rules — no exceptions).

### Migrations

Single file: `supabase/migration_cycle_companion.sql`. Run in SQL editor, verify Security Advisor clean.

---

## 12. Privacy

Light section because scope is personal:
- Supabase region: EU Frankfurt, pinned at project creation
- Footer line: "Personal tool — not medical advice."
- Settings: "Export my data" (JSON download) + "Delete everything" (cascade hard-delete, with confirmation).
- No analytics, no tracking pixels, no third-party scripts.

---

## 13. Build phases

### v1.0 (this PRD)
- Magic-link auth + email allowlist (her + Mark)
- Onboarding (cycle profile, location, reminder time)
- Daily check-in (5 steps — multi-select activity, mood-variable toggle)
- Readiness score (40/25/20/15 weights)
- Phase detection with regular + irregular handling
- Timeline (28-day horizontal, cycle-aligned)
- Cold-start states (hide score days 0–2)
- Daily email reminder via Resend
- 5 insight rules — pull-only via "Find a pattern" button
- Weather snapshot (Open-Meteo, persisted)
- Export: JSON + CSV
- Delete-everything in settings

### v1.1
- Calendar overlay view (month grid alongside cycle ring)
- Better cycle prediction (auto-detect typical length once 3 cycles observed)
- Phase-based notifications (PMS warning, high-energy window) — once history is rich enough
- Weekly digest email

### v1.2
- Apple Health / Google Fit read-only sync (sleep, steps, HR if available)
- More insight rules
- Possibly: lightweight personalised model trained on her data alone

---

## 14. Success criteria

Single user, qualitative:
- She uses it daily for a full cycle without prompting
- Score-feedback thumbs are >70% positive after 60 entries
- She tells Mark unprompted that an insight was useful

No retention dashboards, no funnels.

---

## 15. Reusable patterns from Ai_Quiz

- **Auth pattern:** HMAC-derived session token + `timingSafeEqual` from `src/lib/admin/auth.ts` — adapt for the email-allowlist gate around Supabase Auth.
- **Rate limiting:** `src/lib/rateLimit.ts` on every POST. `/api/checkin` = 5/min/user, `/api/cron/daily-reminder` cron-secret only.
- **i18n:** none for v1.0 (NL only). If markdekock.com already runs next-intl, place Cycle routes outside the `[locale]` segment so they stay locale-free.
- **Animation:** existing `useCountUp` hook for the score.
- **Email:** Resend (already configured). Reuse the existing transactional template structure.
- **Migrations discipline:** committed migration file, RLS enabled, run in SQL editor before deploy.
- **Brand colours:** do NOT reuse the `brand` teal — Cycle Companion has its own calm palette per §4.2.

---

## 16. Decisions locked

Decided 2026-05-05.

| # | Decision | Choice |
|---|---|---|
| 1 | Hosting model | `markdekock.com` is a Next.js app on Vercel — `/Cycle` is a subroute. *Sub-question still open: same repo as Ai_Quiz, or sibling?* |
| 2 | Language | Dutch only |
| 3 | Onboarding cycle data | Last period start + typical length (~30s) |
| 4 | Dark mode | Auto by system preference |
| 5 | Score on days 0–2 | Hidden, "Learning your baseline" message |
| 6 | Default reminder time | Asked in onboarding |
| 7 | Reminder channel | Email only via Resend. SMS dropped (Mark, 2026-05-05). |
| 8 | Score weights | 40 (sleep) / 25 (cycle) / 20 (activity) / 15 (stress) |
| 9 | Mood input | 0–10 slider + "Was your mood variable today?" toggle |
| 10 | Activity type | Multi-select (multiple activities per day) + single overall intensity |
| 11 | Stress input | Keep 1–10 slider |
| 12 | Score feedback | Daily thumbs up/down on output screen |
| 13 | Timeline default | 28 days, cycle-aligned |
| 14 | Insights cadence | On-demand only via "Find a pattern" button |
| 15 | Export format | JSON + CSV. PDF dropped (Mark, 2026-05-05). |
| 16 | Auth allowlist | Her email + Mark's email |

⚠️ marks the two decisions Mark should review before build kickoff.

---

## 17. First-build checklist (in order)

1. Create `src/app/Cycle/` directory + add `pathname.startsWith('/Cycle')` passthrough to `middleware.ts` (mirror the `/mentor` block)
2. Write `migration_cycle_companion.sql` with the 4 tables + RLS, run it in Supabase SQL editor, verify Security Advisor clean
3. Build phase-detection module (`src/lib/cycle/phase.ts`) + unit-test fixtures (§7.4) — **do this FIRST**, it's the riskiest piece
4. Scaffold Supabase Auth magic-link flow + email allowlist (her email + Mark's) at `/Cycle/login`
5. Build onboarding flow at `/Cycle/onboarding`: cycle profile + location + reminder time
6. Build daily check-in stepper at `/Cycle/today` (mood slider + variable toggle, multi-select activity)
7. Build readiness-score computation (`src/lib/cycle/score.ts`) + output screen (with "why?" expand + thumbs feedback)
8. Build 28-day cycle-aligned timeline at `/Cycle/timeline`
9. Wire Open-Meteo client + persisted `weather_snapshots` (one row per day, written on first check-in)
10. Wire daily reminder cron at `/api/cron/cycle-reminder` via Vercel Cron + Resend
11. Insights rules (5 of them) + "Find a pattern" pull-only surface in timeline footer
12. Settings page: reminder time, profile edit, exports (JSON + CSV), delete-everything, logout
13. PWA manifest + install prompt
14. Deploy — verifies live at `markdekock.com/Cycle`

---

END OF DOCUMENT
