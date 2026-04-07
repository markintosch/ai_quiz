/**
 * Analytics utility — wraps GA4 (gtag) with console fallback in dev.
 * Usage: trackEvent('hero_cta_short_clicked', { quiz_variant: 'lite' })
 *
 * Consent mode v2 is active — GA4 runs cookieless by default (analytics_storage: denied).
 * To grant full tracking (e.g. from a consent banner accept handler):
 *   import { grantAnalyticsConsent } from '@/lib/analytics'
 *   grantAnalyticsConsent()
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void
    __loadLinkedIn?: () => void
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

/**
 * Grant full analytics consent (call from a cookie banner "accept" handler).
 * Upgrades GA4 from cookieless to full tracking and activates LinkedIn pixel.
 */
export function grantAnalyticsConsent() {
  if (typeof window === 'undefined') return

  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage:  'granted',
      ad_storage:         'granted',
      ad_user_data:       'granted',
      ad_personalization: 'granted',
    })
  }

  if (typeof window.__loadLinkedIn === 'function') {
    window.__loadLinkedIn()
  }
}
