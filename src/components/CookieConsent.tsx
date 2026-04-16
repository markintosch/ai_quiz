'use client'

/**
 * CookieConsent — minimal GDPR cookie banner.
 *
 * On "Accept": calls gtag consent update (full GA4 tracking + LinkedIn pixel).
 * On "Decline": dismisses without granting — GA4 continues in cookieless mode.
 * Preference stored in localStorage so the banner never shows twice.
 */

import { useEffect, useState } from 'react'
import { grantAnalyticsConsent } from '@/lib/analytics'

const STORAGE_KEY = 'cookie_consent_v1'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if user hasn't decided yet
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'granted')
    grantAnalyticsConsent()
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'denied')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position:       'fixed',
        bottom:         0,
        left:           0,
        right:          0,
        zIndex:         9999,
        background:     '#1a2332',
        borderTop:      '1px solid rgba(255,255,255,0.08)',
        padding:        '16px 24px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            '16px',
        flexWrap:       'wrap',
        fontFamily:     'inherit',
      }}
    >
      <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', maxWidth: '680px', lineHeight: 1.5 }}>
        We use cookies for anonymous analytics (Google Analytics 4) to understand how visitors use this site.
        No personal data is shared with third parties.{' '}
        <a
          href="/privacy"
          style={{ color: '#00DEFF', textDecoration: 'underline' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy policy
        </a>
      </p>

      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding:      '8px 18px',
            background:   'transparent',
            border:       '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            color:        'rgba(255,255,255,0.5)',
            fontSize:     '13px',
            cursor:       'pointer',
            fontFamily:   'inherit',
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            padding:      '8px 20px',
            background:   '#00DEFF',
            border:       'none',
            borderRadius: '6px',
            color:        '#0A1628',
            fontSize:     '13px',
            fontWeight:   700,
            cursor:       'pointer',
            fontFamily:   'inherit',
          }}
        >
          Accept cookies
        </button>
      </div>
    </div>
  )
}
