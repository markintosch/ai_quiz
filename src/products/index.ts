// FILE: src/products/index.ts
// ─── Quiz product registry ────────────────────────────────────────────────────
//
// Add a new product:
//   1. Create src/products/[key]/config.ts
//   2. Import it below and add to REGISTRY
//   3. INSERT INTO quiz_products (key, name, subdomain, ...) in Supabase

import { AI_MATURITY_CONFIG } from './ai_maturity/config'
import type { QuizProductConfig } from './types'

const REGISTRY: Record<string, QuizProductConfig> = {
  ai_maturity: AI_MATURITY_CONFIG,
  // digital_readiness: DIGITAL_READINESS_CONFIG,   ← add future products here
  // esg_maturity:      ESG_MATURITY_CONFIG,
}

/**
 * Look up a product config by its key.
 * Falls back to ai_maturity for legacy responses that pre-date multi-product support.
 */
export function getProductConfig(key?: string | null): QuizProductConfig {
  if (key && REGISTRY[key]) return REGISTRY[key]
  return REGISTRY['ai_maturity']
}

/** All registered product keys */
export function getAllProductKeys(): string[] {
  return Object.keys(REGISTRY)
}

/** All registered product configs */
export function getAllProducts(): QuizProductConfig[] {
  return Object.values(REGISTRY)
}

export type { QuizProductConfig }
export * from './types'
