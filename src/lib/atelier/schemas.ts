// FILE: src/lib/atelier/schemas.ts
// Zod schemas for the IO contract between Atelier modules.
//
// These are validated at the LLM/module boundary so a malformed Claude
// response either coerces or fails loudly — no silently broken pipelines.

import { z } from 'zod'

// ── Module 1: Brief & JTBD ─────────────────────────────────────────────────

export const HiddenAssumptionSchema = z.object({
  text:        z.string(),
  confidence:  z.enum(['high', 'medium', 'low']).default('medium'),
  evidence:    z.string().optional(),  // why we think this is the assumption
})
export type HiddenAssumption = z.infer<typeof HiddenAssumptionSchema>

export const JtbdParseSchema = z.object({
  jtbd:               z.string().min(1).describe('The real job-to-be-done in one sentence.'),
  jtbd_dutch:         z.string().min(1).describe('Same JTBD, in Dutch.'),
  stated_objective:   z.string().describe('What the brief says it wants — quoted or paraphrased.'),
  hidden_assumptions: z.array(HiddenAssumptionSchema).describe('Things assumed but not said.'),
  missing_pieces:     z.array(z.string()).describe('Concrete information missing from the brief.'),
  brief_summary:      z.string().describe('1–2 sentence summary of the brief.'),
})
export type JtbdParse = z.infer<typeof JtbdParseSchema>

// ── Module 2: References ───────────────────────────────────────────────────

export const ReferenceSchema = z.object({
  title:           z.string().min(1),
  description:     z.string(),
  source_kind:     z.enum(['archive', 'live_source', 'inferred']),
  source_label:    z.string().describe('Human-readable provenance, e.g. "Tomas archive · 2024 · Heineken"'),
  source_url:      z.string().url().nullable().optional(),
  relevance_score: z.number().min(0).max(1),
  taste_note:      z.string().describe('Why this reference is worth attention.'),
})
export type Reference = z.infer<typeof ReferenceSchema>

export const ReferenceSetSchema = z.object({
  references: z.array(ReferenceSchema).max(8),
})
export type ReferenceSet = z.infer<typeof ReferenceSetSchema>

// ── Module 3: Audience evidence (two-track) ────────────────────────────────

export const AudienceSignalSchema = z.object({
  track:        z.enum(['street', 'ground']).describe('street = Street Signal (live / observed); ground = Ground Truth (research / surveys / data)'),
  claim:        z.string().min(1),
  evidence:     z.string().optional(),
  source_label: z.string(),
  source_url:   z.string().url().nullable().optional(),
  confidence:   z.enum(['strong', 'medium', 'weak', 'inferred']),
  contradicts:  z.array(z.string()).default([]),
})
export type AudienceSignal = z.infer<typeof AudienceSignalSchema>

export const AudiencePictureSchema = z.object({
  audience_summary: z.string().describe('1–2 sentence picture of who the audience is and what moves them.'),
  signals:          z.array(AudienceSignalSchema),
  weak_claims:      z.array(z.string()).describe('Audience claims in the brief that lack evidence — flagged.'),
})
export type AudiencePicture = z.infer<typeof AudiencePictureSchema>

// ── Module 4: Tension & synthesis ──────────────────────────────────────────

export const DirectionSchema = z.object({
  position:      z.number().int().min(1).max(3),
  tension:       z.string().describe('The friction this direction names.'),
  route:         z.string().describe('The directional route itself, in one sentence.'),
  rationale:     z.string().describe('Why this route follows from the tension + evidence.'),
  evidence_refs: z.array(z.string()).default([]).describe('Reference titles backing this route.'),
  audience_refs: z.array(z.string()).default([]).describe('Audience claim texts backing this route.'),
})
export type Direction = z.infer<typeof DirectionSchema>

export const TensionSetSchema = z.object({
  directions: z.array(DirectionSchema).min(1).max(3),
})
export type TensionSet = z.infer<typeof TensionSetSchema>

// ── Module 5: Output packaging ─────────────────────────────────────────────

export const ProvenanceMapSchema = z.record(z.string(), z.string())
export type ProvenanceMap = z.infer<typeof ProvenanceMapSchema>

export const OnePagerSchema = z.object({
  format:          z.enum(['one_pager', 'session_outline', 'direction_snapshot']),
  language:        z.enum(['nl', 'en', 'fr']).default('nl'),
  body_md:         z.string().min(1).describe('Markdown body, ready to paste into a doc.'),
  provenance_map:  ProvenanceMapSchema.default({}),
})
export type OnePager = z.infer<typeof OnePagerSchema>

// ── Whole-session bundle (handed to module 5) ──────────────────────────────

export const SessionBundleSchema = z.object({
  brief:          z.object({
    raw_text:      z.string(),
    brand_context: z.string().optional(),
    language:      z.enum(['nl', 'en', 'fr']).default('nl'),
  }),
  jtbd:           JtbdParseSchema,
  references:     z.array(ReferenceSchema),
  audience:       AudiencePictureSchema,
  directions:     z.array(DirectionSchema),
})
export type SessionBundle = z.infer<typeof SessionBundleSchema>
