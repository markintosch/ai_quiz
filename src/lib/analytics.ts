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
 *
 * IMPORTANT: The initial page_view fired before consent was granted, so it
 * was sent redacted and not attributed to any user. We re-fire page_view
 * here so this session is counted as a real (new) user in GA4.
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

    // Fire a fresh page_view now that consent is granted — the original
    // one was sent redacted before the user could click Accept.
    window.gtag('event', 'page_view', {
      page_path:     window.location.pathname,
      page_title:    document.title,
      page_location: window.location.href,
    })
  }

  if (typeof window.__loadLinkedIn === 'function') {
    window.__loadLinkedIn()
  }
}
