// FILE: src/components/sannahremco/types.ts
// Shared types for the Sannah & Remco briefing forms.

export type Option = { value: string; label: string }

export type Question =
  | { id: string; type: 'section'; label: string; description?: string }
  | { id: string; type: 'text'; label: string; placeholder?: string; required?: boolean; help?: string }
  | { id: string; type: 'textarea'; label: string; placeholder?: string; rows?: number; required?: boolean; help?: string }
  | { id: string; type: 'email'; label: string; placeholder?: string; required?: boolean; help?: string }
  | { id: string; type: 'single'; label: string; options: Option[]; allowOther?: boolean; required?: boolean; help?: string; revealText?: Record<string, string> }
  | { id: string; type: 'multi';  label: string; options: Option[]; allowOther?: boolean; required?: boolean; help?: string }
  | { id: string; type: 'rank';   label: string; options: Option[]; topN?: number; required?: boolean; help?: string }
  | { id: string; type: 'inspiration'; label: string; count: number; help?: string }
  | { id: string; type: 'upload'; label: string; description?: string; multiple?: boolean }

export type Schema = {
  briefingType: 'sannah_portfolio' | 'remco_presence'
  title: string
  intro: string
  questions: Question[]
}

export type Upload = {
  path: string
  filename: string
  size: number
  mime: string
  url?: string
}

// Answers map: question.id → value (shape depends on question type)
//   text/textarea/email: string
//   single: string (option value, possibly with "other:<text>" sentinel)
//   multi: string[] (option values, may include "other:<text>")
//   rank: { [optionValue]: number | null }  (1, 2, 3, or null)
//   inspiration: Array<{ url: string; appeal: string }>
//   upload: Upload[]  (note: stored separately under `uploads` in the submission, not in payload)
export type AnswerValue =
  | string
  | string[]
  | Record<string, number | null>
  | Array<{ url: string; appeal: string }>
  | Upload[]
  | null
  | undefined

export type Answers = Record<string, AnswerValue>
