# Moba Signal V1 — reference documentation and rollback point

Status: V1 is the live experience at `/moba/signal`. This document freezes what
V1 is, file by file, so the team can always return to it after the V2 preview
(or a later V2 go-live) ships.

- V1 rollback commit: `250d88b` (merge of PR #82, the last change before the
  V2 preview branch). Everything described below exists exactly at that commit.
- V2 preview lives at `/moba/signal/v2` and is purely additive: no V1 file is
  restructured, no data model field is removed, no migration is required.
  V1 keeps working untouched while V2 is evaluated.

## 1. What V1 is

An internal competitive-intelligence dashboard for Moba marketing and
innovation. One page, ten tiers, ordered by the ruthless-ranking principle:
the value is not the volume of data, it is what floats to the top.

- Route: `/moba/signal` (noindexed, password-gated)
- Live mode renders approved items from the `moba_signal_*` tables collected by
  the agent pipeline and approved in `/admin/moba-signal`. When the database
  holds no approved items, is unreachable, or `?demo` is passed, the page falls
  back to the curated sample dataset, clearly labelled. A fallback is visible,
  never silent.
- Access: shared team password via `MOBA_SIGNAL_PASSWORD` (see
  `src/lib/signal/auth.ts`). Without the env var the page renders a locked
  notice and nothing else.

## 2. The V1 information hierarchy

Two views, both assembled from the same modules, re-weighted (never forked):

- **Answer**: the takeaway. Main column: competitive brief. Supporting:
  implications, positioning, claims, regions, momentum, wins, hiring, share of
  voice, events.
- **Explore**: the working view. Main column: event radar + signal feed.
  Supporting: implications, regions, momentum, hiring, share of voice, wins,
  claims, head to head, tech radar, curator queue.

Fixed tiers around the switchable grid:

1. Sticky status bar: six metrics, each against its baseline, with sparklines.
2. Analyst headline (immutable to the agent once written) + critical alert
   cards for competitor criticals from the last two quarters.
3. Timeline, always full width: 24 months of movement, Moba's lane on top,
   event band with guide lines.
4. The asymmetric module grid (main + two supporting columns).
5. Method and source health, always full width: sources, context corpus,
   method rules and known blind spots.

A region lens (click a region in Regional pressure) narrows the region-scoped
modules (feed, timeline, events, wins, hiring); cross-cutting modules ignore it.

## 3. File inventory

### Domain and data

| File | Contents |
|---|---|
| `src/products/moba_signal/types.ts` | Domain model: entities (with required ownership), signals, annotations, claims, whitespace, head-to-head, trade events, sources, proposals, open questions, context corpus, weekly brief, share of voice, positioning paper, dataset shape |
| `src/products/moba_signal/data.ts` | `SIGNAL_DEMO`: deterministic seed dataset, everything computed against a fixed `asOf` (2026-08-19), never the wall clock |
| `src/products/moba_signal/selectors.ts` | Impact scoring and bands, status-bar metrics, headline fallback, feed sort, event phases, source status, date/relative-time formatting, entity colors, momentum and win aggregations |

### Dashboard components (`src/components/moba/signal/`)

| Component | Module |
|---|---|
| `SignalDashboard.tsx` | Shell: status bar, view switcher, headline, criticals, tier layout, region lens |
| `Timeline.tsx` | 24-month multi-lane timeline with event band |
| `Feed.tsx` | Signal feed, time-bucketed, impact-ranked, noise collapsed |
| `Brief.tsx` | Weekly competitive brief (`BriefCard`) and Implications for Moba (`Implications`, with labelled demo scaffold while promoted "so whats" are sparse) |
| `Claims.tsx` | Claims and positioning: messaging house vs competitor wording |
| `Positioning.tsx` | Quarterly brand & positioning paper (fixed axes and themes) |
| `HeadToHead.tsx` | Fixed comparison axes, confidence and last-verified per cell |
| `Events.tsx` | Event radar: T-90..T+30 phases, stand-size deltas, attendance gaps, past editions |
| `Wins.tsx` | Announced wins by region, strategic-account red flag |
| `Hiring.tsx` | Vacancy clusters and senior hires read as intent (inference-labelled) |
| `Regions.tsx` | Regional pressure with schematic world map and the region lens |
| `ShareOfVoice.tsx` | LinkedIn competitor analytics: share, engagement, followers |
| `Tech.tsx` | Technology radar (demo content) |
| `SourceHealth.tsx` | Sources, context corpus, method and known blind spots |
| `Queue.tsx` | Curator queue: proposals, contributions, open questions |
| `SignalDetail.tsx` | Item drawer: provenance, score breakdown, annotations |
| `viz.tsx` | Shared visual primitives (sparkline, heat strip, event strip) |

### Routes

| Route | Purpose |
|---|---|
| `src/app/moba/signal/page.tsx` | The dashboard (live with demo fallback) |
| `src/app/moba/signal/login/page.tsx` | Team password gate |
| `src/app/moba/signal/paper/page.tsx` + `view.tsx` | Standalone positioning paper |
| `src/app/admin/moba-signal/page.tsx` | Collection console: runs, approvals, uploads |
| `src/app/api/moba-signal/*` | Login, collection cron, brief cron, paper cron |
| `src/app/api/admin/moba-signal/*` | Admin actions behind the console |

### Agent pipeline (`src/lib/signal/`)

| File | Role |
|---|---|
| `runner.ts` | One run = one source: fetch, follow links, extract, link, score, store |
| `crawl.ts` | Public-page fetching, bot-honest UA, graceful failure |
| `extract.ts` | LLM extraction: raw text in, dated competitive facts out (schema-gated) |
| `score.ts` | Deterministic scoring and entity linking (rule-based on purpose) |
| `ingest.ts` | Manual document ingestion into the same pipeline |
| `ocr.ts` | OCR fallback for image-only uploads |
| `brief.ts` | Editor agent: Monday brief from approved items only |
| `paper.ts` | Positioning agent: quarterly brand & positioning paper |
| `social.ts` | LinkedIn analytics export parsing |
| `llm.ts` | LLM client, deliberately separate from other products |
| `db.ts` | Read path: approved rows to `SignalDataset` |
| `auth.ts` | Dashboard password auth |

### Database

Migrations, in order: `supabase/migration_moba_signal.sql`, then
`_upload`, `_sources_v2` … `_sources_v6`, `_brief`, `_paper`, `_social`.

## 4. The trust rules V1 encodes (unchanged in V2)

- Impact = proximity + materiality + credibility. Critical 8-9, Notable 5-7,
  Context 3-4, Noise below 3.
- An item can never be Critical on credibility 1: a loud rumour stays amber
  until someone verifies.
- Every assertion carries a source URL, first-seen and last-confirmed
  timestamps, who asserted it, and whether a human reviewed it.
- Inference is labelled (`inference: true`), never mixed with reported fact.
- The agent ranks, it does not declare: nothing publishes without approval,
  and the analyst headline is immutable to the agent.
- Ownership renders wherever an entity name renders: "Staalkat (part of
  Sanovo)".
- Source health, context corpus and blind spots are shown, not hidden: a
  silent gap reads as calm, which is the most dangerous failure mode.

## 5. How to roll back to V1

The V2 preview does not modify V1 behaviour, so "rolling back" is cheap at
every level:

1. **Do nothing**: `/moba/signal` is still V1. Point users back at it.
2. **Remove the preview**: delete `src/app/moba/signal/v2/`,
   `src/components/moba/signal/v2/` and `src/products/moba_signal/v2.ts`, and
   remove the "V2 preview" chip in `SignalDashboard.tsx`. No data or migration
   work needed.
3. **Full git rollback**: branch or reset from `250d88b`
   (`git checkout -b restore-v1 250d88b`). Nothing after that commit is
   required for V1 to run.

If V2 is later promoted to `/moba/signal`, keep V1 reachable (for example at
`/moba/signal/v1`) for one evaluation cycle before removing it, and update
this document with the new commit boundary.

## 6. Why V2 exists (review summary, September 2026)

The external review scored the intelligence model 9/10 and the experience
6-7/10 for sales and executives. Its core point: V1 answers "what is happening
in the competitive landscape?" while the first screen should answer "what
should I care about today?" and "what should we do about it?". The V2 preview
restructures the surface around that: an attention hero (act / prepare /
watch), actions with owners, role lenses, chapters instead of a card wall,
human language over analytical terms, search, and evidence collapsed behind a
data-confidence figure. The intelligence model, trust rules and all V1 modules
are reused, not rebuilt.
