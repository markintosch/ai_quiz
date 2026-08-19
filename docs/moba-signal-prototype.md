# Moba Signal — competitive intelligence dashboard (prototype)

Status: v0 prototype, sample data only
Route: `/moba/signal`
PRD: "Moba Competitive Intelligence Dashboard" (Moba Signal), draft v0.1, August 2026

## What this build is

A working front end for the PRD's information hierarchy, rendered against a
deterministic seed dataset. It exists to validate two things before anything
heavier is built (PRD phase 0):

1. The tier ordering: does the ranking read in 90 seconds?
2. The scoring model: do the three factors and the display rules put the right
   items on top?

There is no database, no agent pipeline and no auth yet. All items are
illustrative sample data, clearly labelled as such on the page.

## Files

| File | Contents |
|---|---|
| `src/products/moba_signal/types.ts` | Domain model: entities, signals, claims, events, sources, proposals, context corpus |
| `src/products/moba_signal/data.ts` | Seed dataset, everything computed against a fixed `asOf` date |
| `src/products/moba_signal/selectors.ts` | Impact scoring, display bands, status-bar metrics, ownership labels, group rollup |
| `src/components/moba/signal/*` | One component per tier |
| `src/app/moba/signal/page.tsx` | Route, noindexed |

## PRD rules implemented in code

- **Three-factor impact score** (proximity + materiality + credibility) with
  the display bands Critical 8-9, Notable 5-7, Context 3-4, Noise below 3.
- **The honesty rule**: an item can never be Critical on credibility 1. See
  `band()` in `selectors.ts`; the rumour item `s-20` in the seed data
  demonstrates it.
- **Ownership display rule**: `entityLabel()` renders "Diamond (part of
  Moba)" and "Staalkat (part of Sanovo)" wherever the entity name renders.
  `laneEntityId()` performs the group rollup, so a Staalkat win aggregates
  under Sanovo on the timeline and in the counts.
- **Every number carries its baseline** in the status bar.
- **Structured "so what"**: three prompts (what it means, consider doing, who
  needs to know), with attribution, timestamps and threaded replies.
- **Provenance on every item**: source URL, first seen, last confirmed,
  asserting agent, human-reviewed flag, inference label.
- **Source health is public**: failed and stale sources show first, with the
  failure reason. Context corpus items go amber past their review date.
- **One approval standard**: agent proposals and human contributions share the
  same queue. Accept/Reject buttons are rendered but disabled (read-only
  prototype).
- **Event radar cadence**: `eventPhase()` derives T-90 → T+30 stage from the
  fixed `asOf` date. Attendance-gap and stand-growth flags are rendered.
- **Technology radar**: placeholder only, per the P2 scope decision.

## Deliberately not built

- Persistence, agent crew, collection pipeline (PRD §8) — the dashboard is the
  render layer; the agent is a separate build decision (open question:
  build/buy/assemble).
- Auth. The page is noindexed but publicly reachable in this prototype. Real
  access control (marketing + innovation only) is a P0 requirement before any
  real data enters.
- Editing: annotations, headline override and approvals are read-only.

## Next steps (from the PRD)

1. Decide build/buy/assemble for the agent side (blocking open question).
2. Phase 0: run the source list manually for 3 weeks, validate the scoring
   model against this UI.
3. P0 build: entity graph with provenance in Supabase, Collector/Verifier/
   Analyst on cadence, approval queue wired, contribution ingress.

## Phase A + B: the live pipeline (added later)

The dashboard now has a real data path next to the sample dataset. The code
lives in `src/lib/signal/` — copied and refined from the Atelier pattern, but
a fully separate namespace (no shared imports, tables prefixed
`moba_signal_*`) so the two products never mix.

### Flow

1. `supabase/migration_moba_signal.sql` creates the tables and seeds the
   entities (with ownership relations), sources and context corpus.
2. `/admin/moba-signal` is the collection console: run a collector per
   source, review what the agents propose, decide curator proposals.
3. A run (`src/lib/signal/runner.ts`) fetches the source's listing page plus
   up to five article pages, extracts dated facts with Claude Haiku against a
   strict schema (`extract.ts` — items without a resolvable date, or dated in
   the future, are dropped at the gate), links entities by name and alias,
   and scores deterministically (`score.ts`) so the analyst can always see
   why an item scored what it did. Everything lands `review_status='proposed'`.
4. Approval requires a linked entity. Approved items render on
   `/moba/signal`; rejected items are kept with the review note — that is the
   learning loop's raw material. Unknown company names become curator entity
   proposals.
5. `/moba/signal` renders live data when approved items exist, and falls back
   to the labelled sample dataset otherwise (or with `?demo`). In live mode
   the claims tracker, head to head and event calendar still show curated
   sample content until their phases land; the footer says so.

### To activate in production

1. Run `supabase/migration_moba_signal.sql` in the Supabase SQL editor.
2. Ensure `ANTHROPIC_API_KEY` is set in the Vercel environment.
3. Open `/admin/moba-signal`, hit "Run now" on a source, review the queue.
4. Fill `account_names` on the `ctx-accounts` context row so proximity
   scoring can flag strategic accounts.

### Not yet in this phase

Cron cadence (the run route is admin-triggered; add a Vercel cron next), the
Verifier's cross-source clustering, the backfill queue, the Asia-report
import job, and Wayback claims diffing. Live collection was not run in the
build environment (no database or API key there); the fetch, extraction and
review paths are exercised by the admin console against production config.
