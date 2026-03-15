// ─── Re-export question domain types ─────────────────────────
export type { QuestionType, Dimension, QuestionOption, Question } from '@/data/questions'

// ─── Scoring types (owned by engine.ts to break circular deps) ──
// engine.ts imports AnswerMap from here (type-only) — safe circular ref
import type { DimensionScore, ShadowAIResult, QuizScore, MaturityLevel } from '@/lib/scoring/engine'
export type { DimensionScore, ShadowAIResult, QuizScore, MaturityLevel }

// ─── Convenience alias ────────────────────────────────────────
export type ShadowAISeverity = 'low' | 'medium' | 'high'

// ─── Quiz state ───────────────────────────────────────────────
export type QuizVersion = 'lite' | 'full'

/** Map from question code → selected option value(s) */
export type AnswerMap = Record<string, number | string[]>

export interface QuizState {
  version: QuizVersion
  currentIndex: number
  answers: AnswerMap
  companySlug?: string
}

// ─── Lead capture form ────────────────────────────────────────
export interface LeadFormData {
  name: string
  email: string
  jobTitle: string
  companyName: string
  industry?: string
  companySize?: string
  /** Consent to process data for results delivery (required) */
  gdprConsent: boolean
  /** Optional consent to receive marketing insights & updates */
  marketingConsent: boolean
}

// ─── Supabase row shapes (mirrors schema.sql) ─────────────────
export interface Company {
  id: string
  name: string
  slug: string
  logo_url: string | null
  custom_questions: unknown | null
  active: boolean
  created_at: string
}

export interface Cohort {
  id: string
  company_id: string
  name: string
  date: string | null
  created_at: string
}

export interface Respondent {
  id: string
  cohort_id: string | null
  company_id: string | null
  name: string
  email: string
  job_title: string
  company_name: string
  industry: string | null
  company_size: string | null
  source: 'public' | 'company_slug'
  gdpr_consent: boolean
  marketing_consent: boolean
  unsubscribed: boolean
  calendly_status: string | null
  created_at: string
}

export interface Response {
  id: string
  respondent_id: string
  quiz_version: QuizVersion
  attempt_number: number
  answers: AnswerMap
  scores: QuizScore
  maturity_level: MaturityLevel
  shadow_ai_flag: boolean
  shadow_ai_severity: ShadowAISeverity | null
  recommendation_payload: import('@/lib/scoring/recommendations').Recommendation[]
  created_at: string
}

export interface Session {
  id: string
  respondent_id: string | null
  quiz_version: QuizVersion
  session_status: 'started' | 'partial' | 'completed' | 'abandoned'
  quiz_model_version: string
  results_access_mode: string
  benchmark_eligible: boolean
  consent_timestamp: string | null
  privacy_notice_version: string | null
  created_at: string
}

// ─── API payloads ─────────────────────────────────────────────
export interface SubmitQuizPayload {
  version: QuizVersion
  answers: AnswerMap
  lead: LeadFormData
  companySlug?: string
  cohortId?: string
  /** Active locale — used by API to build locale-prefixed email links */
  locale?: string
}

export interface SubmitQuizResponse {
  respondentId: string
  responseId: string
  resultsUrl: string
}
