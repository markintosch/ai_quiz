// ─── Naming a response's product ──────────────────────────────────────────────
// Every product writes to the same `responses` table, so any admin view that
// mixes products needs to say which one a row came from. Kept next to
// resultHref so the two answers about a response — what it is, and where it is
// viewable — stay in step.

/** Legacy responses (pre multi-product) have product_key = NULL: those are AI maturity. */
export const AI_MATURITY_KEY = 'ai_maturity'

/** Acronyms that should stay uppercase in product labels. */
const ACRONYMS = new Set(['ai', 'pr', 'hr', 'cx', 'esg', 'hcss', 'sbs', 'md'])

/** Turn a product_key like "pr_maturity" into a readable label like "PR Maturity". */
export function productLabel(key: string | null | undefined): string {
  return (key ?? AI_MATURITY_KEY)
    .split(/[_-]/)
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}
