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
