// FILE: src/products/types.ts
// ─── White-label product config types ────────────────────────────────────────
//
// A QuizProductConfig defines everything that is specific to one quiz product
// (AI Maturity, Digital Readiness, ESG Maturity, etc.).
//
// Rule of thumb:
//   - Business logic (questions, dimensions, scoring weights, maturity levels,
//     recommendations, copy) → lives here, in a TypeScript config file.
//   - Operational data (companies, respondents, cohorts) → lives in Supabase.
//
// To add a new product:
//   1. Create src/products/[key]/config.ts implementing QuizProductConfig
//   2. Register it in src/products/index.ts
//   3. INSERT INTO quiz_products (key, name, subdomain, ...) in Supabase
//   4. Create the first company for it in /admin/companies

import type { Question } from '@/data/questions'
import type { DimensionScore, ShadowAIResult } from '@/lib/scoring/engine'
import type { Recommendation } from '@/lib/scoring/recommendations'

// ── Dimension ─────────────────────────────────────────────────────────────────

export interface DimensionConfig {
  /** Matches Question.dimension — e.g. 'strategy_vision' */
  key: string
  /** Human-readable label — e.g. 'Strategy & Vision' */
  label: string
  /** Weight in overall score calculation (all weights must sum to 1.0) */
  weight: number
  /** Emoji icon for landing-page tiles */
  icon?: string
  /** Short description for landing-page tiles */
  description?: string
}

// ── Maturity levels ───────────────────────────────────────────────────────────

export interface MaturityThreshold {
  /** score <= maxScore maps to this level */
  maxScore: number
  /** Level name — e.g. 'Unaware', 'Leading' */
  level: string
  /** Tailwind text colour class — e.g. 'text-red-500' */
  colorClass: string
  /** Tailwind background class — e.g. 'bg-red-50' */
  bgClass: string
  /** Tailwind ring class — e.g. 'ring-red-200' */
  ringClass: string
}

// ── Calendly routing ──────────────────────────────────────────────────────────

export interface CalendlyRule {
  /** Route to this URL when overall score <= maxScore */
  maxScore: number
  url: string
}

// ── CMS default copy ──────────────────────────────────────────────────────────

export interface ProductCopy {
  badge?: string
  scoreLabel?: string
  heroHeading?: string
  heroCta?: string
}

// ── Product config ────────────────────────────────────────────────────────────

export interface QuizProductConfig {
  /** Must match quiz_products.key in Supabase */
  key: string
  /** Display name — e.g. 'AI Maturity Assessment' */
  name: string

  /** Full question bank for this product */
  questions: Question[]

  /** Ordered list of dimensions with weights (must sum to 1.0) */
  dimensions: DimensionConfig[]

  /** Maturity level thresholds (ordered ascending by maxScore) */
  scoring: {
    maturityThresholds: MaturityThreshold[]
  }

  /**
   * Short description text per maturity level, shown on the results page.
   * Keys must match MaturityThreshold.level values.
   */
  maturityDescriptions: Record<string, string>

  /** Calendly meeting routing rules — matched by overall score */
  calendly: {
    rules: CalendlyRule[]
  }

  /**
   * Generates ordered recommendations from dimension scores and flags.
   * Flags is a generic map to support product-specific signals (e.g. shadow_ai).
   */
  generateRecommendations: (
    dimensionScores: DimensionScore[],
    flags: Record<string, unknown>
  ) => Recommendation[]

  /** Default CMS copy per locale — overridden by site_content table when present */
  defaultCopy?: {
    en?: ProductCopy
    nl?: ProductCopy
    fr?: ProductCopy
  }
}

// ── Helper: resolve Calendly URL from rules ───────────────────────────────────

export function resolveCalendlyUrl(
  overall: number,
  rules: CalendlyRule[]
): string {
  for (const rule of rules) {
    if (overall <= rule.maxScore) return rule.url
  }
  return rules[rules.length - 1]?.url ?? ''
}

// ── Helper: resolve maturity threshold from config ────────────────────────────

export function resolveMaturityThreshold(
  level: string,
  thresholds: MaturityThreshold[]
): MaturityThreshold | undefined {
  return thresholds.find(t => t.level === level)
}

// ── Re-export ShadowAIResult for product config files ─────────────────────────
export type { DimensionScore, ShadowAIResult, Recommendation }
