// FILE: src/products/index.ts
// ─── Quiz product registry ────────────────────────────────────────────────────
//
// Add a new product:
//   1. Create src/products/[key]/config.ts
//   2. Import it below and add to REGISTRY
//   3. INSERT INTO quiz_products (key, name, subdomain, ...) in Supabase

import { AI_MATURITY_CONFIG } from './ai_maturity/config'
import { CLOUD_READINESS_CONFIG } from './cloud_readiness/config'
import type { QuizProductConfig } from './types'

const REGISTRY: Record<string, QuizProductConfig> = {
  ai_maturity:      AI_MATURITY_CONFIG,
  cloud_readiness:  CLOUD_READINESS_CONFIG,
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

// ── Subdomain → product_key mapping ──────────────────────────────────────────
// Must stay in sync with middleware.ts and quiz_products.subdomain in Supabase.
// Add new subdomains here when a product is launched.
const SUBDOMAIN_MAP: Record<string, string> = {
  'ai':           'ai_maturity',    // ai.brandpwrdmedia.nl
  'ai-maturity':  'ai_maturity',    // legacy alias
  'cloud':        'cloud_readiness',// cloud.brandpwrdmedia.nl
  'check':        'cloud_readiness',// legacy alias (truefullstaq.nl)
  'arena':        'cloud_arena',    // arena.brandpwrdmedia.nl
  // 'digital-readiness': 'digital_readiness',  ← add when product is launched
}

/**
 * Extract the product_key from a host header value.
 * Used by server components to know which product they are serving.
 *
 * @example
 * import { headers } from 'next/headers'
 * const host = (await headers()).get('host') ?? ''
 * const productKey = getProductKeyFromHost(host)
 * const config = getProductConfig(productKey)
 */
export function getProductKeyFromHost(host: string): string {
  const subdomain = host.split('.')[0] ?? ''
  return SUBDOMAIN_MAP[subdomain] ?? 'ai_maturity'
}

export type { QuizProductConfig }
export * from './types'
