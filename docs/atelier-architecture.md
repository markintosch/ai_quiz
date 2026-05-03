# Atelier — architecture (working framework, v0.4 PRD)

> Snapshot: 2026-05-03. Implements the v0.4 PRD framework end-to-end (all 5
> modules working) with mock corpora where no real data exists yet. Lives
> inside the `Ai_Quiz` repo at `/atelier` (no extra Vercel licence).

## Principles encoded in the framework

1. **Provenance is structural, not cosmetic.** Every claim, reference, and
   audience signal in the DB carries a `source` field. The UI surfaces it.
2. **Two-track signal model is enforced at the type level.** Street Signal
   and Ground Truth are separate columns / discriminated-union fields —
   they cannot be silently blended in code.
3. **Dutch-native by default.** Prompts to the LLM are in Dutch, the system
   role steers output to Dutch unless asked otherwise, source weighting
   biases NL.
4. **Provider-agnostic LLM interface.** First impl is Claude (Anthropic SDK).
   Each module declares the model tier it wants (`haiku|sonnet|opus`); the
   client maps that to a provider.
5. **Logged from day 1.** Every module run writes an `atelier_module_runs`
   row with input hash, model, latency, cost. Phase 1 quantitative gates
   are aggregations on this table.

## High-level flow

```
brief input  ─┐
              │
  ┌───────────▼──────────────────┐
  │ Module 1 — Brief & JTBD       │  parse → JTBD + hidden assumptions
  └───────────┬──────────────────┘
              │ JTBD + assumptions
   ┌──────────┼──────────┐
   ▼          ▼          ▼
 ┌──────┐ ┌─────────┐ ┌──────────────┐
 │ M2   │ │   M3    │ │   (parallel) │
 │ Refs │ │ Audience│ │              │
 └──┬───┘ └────┬────┘ │              │
    │          │      │              │
    └────┬─────┘      │              │
         ▼            │              │
  ┌─────────────────┐ │              │
  │ Module 4 — Tension & synthesis    │  → 2–3 directional routes
  └────────┬────────────────────────┘
           │
  ┌────────▼─────────────────────┐
  │ Module 5 — Output packaging   │  → one-pager / session outline
  └───────────────────────────────┘
```

Modules 2 + 3 run in parallel after module 1 completes, then module 4 joins.

## Modules — short spec

| # | Name | Input | Output | Model tier (default) |
|---|------|-------|--------|---------------------|
| 1 | Brief & JTBD | raw brief text + optional brand context | `JtbdParse` (jtbd, assumptions[], hidden_assumptions[], missing_pieces[]) | sonnet |
| 2 | Reference & retrieval | `JtbdParse` | `Reference[]` with `source_kind`, `source_url`, `relevance_score`, `taste_note` | haiku |
| 3 | Audience evidence | `JtbdParse` + brand context | `AudiencePicture` with two-track `signals: { streetSignal: [...], groundTruth: [...] }`, `weakClaims[]` | sonnet |
| 4 | Tension & synthesis | `JtbdParse` + `Reference[]` + `AudiencePicture` | `Direction[]` (2–3 entries with `tension`, `route`, `evidence_refs[]`) | sonnet |
| 5 | Output packaging | full session bundle | `OnePager` (NL + EN-on-request) with `provenanceMap` per claim | haiku |

## DB schema (high-level)

- `atelier_sessions` — one row per brief-to-direction working session
- `atelier_briefs` — the input brief (raw text, brand context, language)
- `atelier_module_runs` — every module invocation, with full input/output/cost
- `atelier_directions` — the 2–3 routes module 4 generates
- `atelier_references` — references attached to a session
- `atelier_audience_signals` — two-track signals attached to a session
- `atelier_outputs` — final one-pagers / outlines
- `atelier_contributors` — selected practitioners (Phase 1.5; seed schema only)

Full SQL in `supabase/migration_atelier.sql`.

## What's a stub right now (deliberately)

- Reference corpus: a small seed JSON of references in Dutch creative space.
  Real archive ingestion (Tomas's work) lands in Phase 0 of the real build.
- Audience evidence sources: starts as "Claude-knowledge-only" with a flag
  on each signal that says `provenance: 'inferred'`. Real listening feeds
  (Street Signal) and real surveys (Ground Truth) connect later.
- Contributor flow: schema is in place, no contributor UI yet — covered in
  Phase 1.5 once the workflow proves repeatable.

## What's NOT in this framework

- Auth (no contributor sign-up yet — private URL like /SannahRemco)
- Embedding-based retrieval (mock-corpus is enough to validate the contract)
- Multi-tenant team workspaces (single founder/test scope for now)
- Pricing / billing (PRD §14 still to settle indicative bands)

## Quantitative gates this framework makes measurable

Once running, you can query `atelier_module_runs` + `atelier_outputs` to
get the metrics PRD §12 needs but doesn't yet specify:

- Briefs completed in a window
- Time-to-one-pager per session
- Module-level latency / cost / failure rate
- Which directions get exported / shared (engagement proxy)
- Hidden-assumption extraction acceptance rate (manual scoring on the
  module-runs row)

These let you set Phase 1's quantitative gate after 2-3 weeks of data,
rather than guessing a threshold up front.
