/**
 * In-memory sliding-window rate limiter.
 *
 * Good enough for a low-volume serverless quiz app.
 * Not cluster-safe — each Vercel function instance has its own store.
 * That is an acceptable trade-off: a determined attacker can spin up new
 * instances, but casual abuse (form re-submits, referral spam) is blocked.
 */

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

// Prune expired entries every 100 calls to keep memory lean
let pruneCount = 0
function maybePrune() {
  if (++pruneCount % 100 !== 0) return
  const now = Date.now()
  for (const [key, win] of Array.from(store)) {
    if (win.resetAt < now) store.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number   // epoch ms when the window expires
}

/**
 * Check (and increment) a rate-limit bucket.
 *
 * @param key      Unique bucket id — e.g. `"submit:1.2.3.4"`
 * @param limit    Max requests allowed inside the window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  maybePrune()
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  existing.count++
  const allowed = existing.count <= limit
  return {
    allowed,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  }
}

/**
 * Extract the client IP from Next.js request headers.
 * Handles Vercel's x-forwarded-for header.
 */
export function getClientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return headers.get('x-real-ip') ?? '0.0.0.0'
}
