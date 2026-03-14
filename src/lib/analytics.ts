/**
 * Analytics utility — wraps GA4 (gtag) with console fallback in dev.
 * Usage: trackEvent('hero_cta_short_clicked', { quiz_variant: 'lite' })
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined') return

  // GA4 via gtag.js
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params ?? {})
  }

  // Dev/staging console fallback
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${eventName}`, params ?? {})
  }
}
