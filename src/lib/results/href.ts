// ─── Where a stored response is actually viewable ─────────────────────────────
// Every product writes to the same `responses` table, but not every product
// scores the same way. The /[locale]/results/[id] dashboard renders a radar
// over `dimensionScores`; a product with its own scoring model (its own
// pillars, its own maturity ladder) stores a different shape and ships its own
// results page. Linking such a response into the shared pipeline renders a
// crash, not a result, so route by product_key in one place.

/** Products that score their own way and own their results page. */
const OWN_RESULTS_PAGE = new Set(['wouterblok'])

export function hasOwnResultsPage(productKey: string | null | undefined): boolean {
  return OWN_RESULTS_PAGE.has(productKey ?? '')
}

/**
 * Canonical link to a response's results, for admin tables and for redirecting
 * a response that reached the shared route by mistake.
 */
export function resultHref(
  productKey: string | null | undefined,
  responseId: string,
  locale?: string,
): string {
  switch (productKey) {
    case 'wouterblok':
      return `/wouterblok/results?id=${responseId}${locale ? `&lang=${locale}` : ''}`
    default:
      return `/results/${responseId}`
  }
}
