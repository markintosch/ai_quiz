// FILE: src/lib/moba/content.ts
// ─── MOBA Marketing Survey — editable copy (CMS) ──────────────────────────────
//
// The survey STRUCTURE lives in code and never changes here: 6 dimensions × 3
// questions, the question codes (MP1…AF3), the option values 1–5, the priority
// keys (= dimension keys), the open-question keys (q20…q22) and the 1–5 segment
// scale. The scoring engine and the aggregation depend on all of that.
//
// What IS editable is the COPY: question text, option labels, priority labels,
// open-question text and the segment labels. Admin edits are stored as a SPARSE
// override in `moba_survey_content` and merged over the code defaults on read.
// Anything left unedited keeps following the code default.
//
// This module is pure (no server-only imports) so it is safe in both the client
// survey component and server routes. The DB getter takes the Supabase client as
// an argument rather than importing it, which keeps it isomorphic.

import type { Question } from '@/data/questions'
import { MOBA_QUESTIONS } from '@/products/moba_marketing/questions'
import {
  MOBA_PRIORITY_OPTIONS,
  MOBA_PRIORITY_TOTAL,
  MOBA_OPEN_QUESTIONS,
  MOBA_SEGMENT_QUESTION,
} from '@/products/moba_marketing/config'

// ── Resolved (ready-to-render) content ────────────────────────────────────────
export interface MobaContent {
  questions:       Question[]
  priorityOptions: { key: string; label: string }[]
  priorityTotal:   number
  openQuestions:   { key: string; text: string }[]
  segment:         { text: string; minLabel: string; maxLabel: string }
}

// ── Sparse overrides, as persisted in moba_survey_content.content ─────────────
export interface MobaContentOverrides {
  questions?:       Record<string, { text?: string; options?: Record<string, string> }>
  priorityOptions?: Record<string, string>
  openQuestions?:   Record<string, string>
  segment?:         { text?: string; minLabel?: string; maxLabel?: string }
}

const clean = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t.length ? t : undefined
}

/** The pristine, code-defined survey copy — the base every read merges onto. */
export function defaultMobaContent(): MobaContent {
  return {
    questions: MOBA_QUESTIONS.map(q => ({ ...q, options: q.options.map(o => ({ ...o })) })),
    priorityOptions: MOBA_PRIORITY_OPTIONS.map(o => ({ key: o.key, label: o.label })),
    priorityTotal: MOBA_PRIORITY_TOTAL,
    openQuestions: MOBA_OPEN_QUESTIONS.map(o => ({ key: o.key, text: o.text })),
    segment: {
      text:     MOBA_SEGMENT_QUESTION.text,
      minLabel: MOBA_SEGMENT_QUESTION.minLabel,
      maxLabel: MOBA_SEGMENT_QUESTION.maxLabel,
    },
  }
}

/** Merge sparse overrides onto the code defaults. Structure stays anchored in code. */
export function resolveMobaContent(overrides?: MobaContentOverrides | null): MobaContent {
  const base = defaultMobaContent()
  if (!overrides || typeof overrides !== 'object') return base

  base.questions = base.questions.map(q => {
    const ov = overrides.questions?.[q.code]
    if (!ov) return q
    return {
      ...q,
      text: clean(ov.text) ?? q.text,
      options: q.options.map(opt => {
        const lbl = clean(ov.options?.[String(opt.value)])
        return lbl ? { ...opt, label: lbl } : opt
      }),
    }
  })

  base.priorityOptions = base.priorityOptions.map(o => {
    const lbl = clean(overrides.priorityOptions?.[o.key])
    return lbl ? { ...o, label: lbl } : o
  })

  base.openQuestions = base.openQuestions.map(o => {
    const txt = clean(overrides.openQuestions?.[o.key])
    return txt ? { ...o, text: txt } : o
  })

  if (overrides.segment) {
    base.segment = {
      text:     clean(overrides.segment.text)     ?? base.segment.text,
      minLabel: clean(overrides.segment.minLabel) ?? base.segment.minLabel,
      maxLabel: clean(overrides.segment.maxLabel) ?? base.segment.maxLabel,
    }
  }

  return base
}

/**
 * Reduce a fully-edited content object to a sparse override: only fields that
 * actually differ from the code default are stored. This keeps the row small
 * and forward-compatible — if a default is later changed in code, any field the
 * admin never touched will follow the new default automatically.
 */
export function diffMobaContent(edited: MobaContent): MobaContentOverrides {
  const def = defaultMobaContent()
  const out: MobaContentOverrides = {}

  const qOut: Record<string, { text?: string; options?: Record<string, string> }> = {}
  for (const q of edited.questions) {
    const dq = def.questions.find(d => d.code === q.code)
    if (!dq) continue
    const entry: { text?: string; options?: Record<string, string> } = {}
    const text = clean(q.text)
    if (text && text !== dq.text) entry.text = text

    const optOut: Record<string, string> = {}
    for (const opt of q.options) {
      const dopt = dq.options.find(o => o.value === opt.value)
      if (!dopt) continue
      const lbl = clean(opt.label)
      if (lbl && lbl !== dopt.label) optOut[String(opt.value)] = lbl
    }
    if (Object.keys(optOut).length) entry.options = optOut
    if (entry.text || entry.options) qOut[q.code] = entry
  }
  if (Object.keys(qOut).length) out.questions = qOut

  const pOut: Record<string, string> = {}
  for (const o of edited.priorityOptions) {
    const dp = def.priorityOptions.find(d => d.key === o.key)
    const lbl = clean(o.label)
    if (dp && lbl && lbl !== dp.label) pOut[o.key] = lbl
  }
  if (Object.keys(pOut).length) out.priorityOptions = pOut

  const oOut: Record<string, string> = {}
  for (const o of edited.openQuestions) {
    const dq = def.openQuestions.find(d => d.key === o.key)
    const txt = clean(o.text)
    if (dq && txt && txt !== dq.text) oOut[o.key] = txt
  }
  if (Object.keys(oOut).length) out.openQuestions = oOut

  const seg: { text?: string; minLabel?: string; maxLabel?: string } = {}
  if (clean(edited.segment.text)     && clean(edited.segment.text)     !== def.segment.text)     seg.text     = clean(edited.segment.text)
  if (clean(edited.segment.minLabel) && clean(edited.segment.minLabel) !== def.segment.minLabel) seg.minLabel = clean(edited.segment.minLabel)
  if (clean(edited.segment.maxLabel) && clean(edited.segment.maxLabel) !== def.segment.maxLabel) seg.maxLabel = clean(edited.segment.maxLabel)
  if (Object.keys(seg).length) out.segment = seg

  return out
}

/** True when any copy has been customised away from the code defaults. */
export function isCustomised(overrides?: MobaContentOverrides | null): boolean {
  if (!overrides) return false
  return Boolean(
    (overrides.questions && Object.keys(overrides.questions).length) ||
    (overrides.priorityOptions && Object.keys(overrides.priorityOptions).length) ||
    (overrides.openQuestions && Object.keys(overrides.openQuestions).length) ||
    (overrides.segment && Object.keys(overrides.segment).length)
  )
}

// ── DB access ─────────────────────────────────────────────────────────────────
// Defensive: the table may not exist yet (migration not run) → fall back to
// code defaults so the survey keeps working.

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getMobaContentOverrides(supabase: any): Promise<MobaContentOverrides | null> {
  try {
    const { data } = await supabase
      .from('moba_survey_content')
      .select('content')
      .eq('id', 1)
      .maybeSingle()
    const content = data?.content
    return content && typeof content === 'object' ? (content as MobaContentOverrides) : null
  } catch {
    return null
  }
}

export async function getMobaContent(supabase: any): Promise<MobaContent> {
  return resolveMobaContent(await getMobaContentOverrides(supabase))
}
/* eslint-enable @typescript-eslint/no-explicit-any */
