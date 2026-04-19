/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from 'react'

export const OG_SIZE = { width: 1200, height: 630 }

export interface OGProps {
  eyebrow:    string
  heading:    string
  sub?:       string
  cta?:       string
  /** hex colour for the CTA pill / accent bar */
  accent?:    string
  /** hex background */
  background?: string
  /** brand mark text, shown in top bar */
  brand?:     string
}

/**
 * Shared Open Graph image template for markdekock.com surfaces.
 * Works in next/og edge runtime — no external assets.
 */
export function renderOGImage({
  eyebrow,
  heading,
  sub,
  cta,
  accent     = '#E8611A',
  background = '#0F172A',
  brand      = 'Mark de Kock',
}: OGProps): ReactElement {
  return (
    <div
      style={{
        width:         '100%',
        height:        '100%',
        display:       'flex',
        flexDirection: 'column',
        background,
        padding:       '64px',
        fontFamily:    'sans-serif',
        position:      'relative',
      }}
    >
      {/* subtle accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 8,
          background: `linear-gradient(90deg, ${accent}, #F5A820)`,
        }}
      />

      {/* Brand bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}>
        <div
          style={{
            background:    '#FFFFFF',
            borderRadius:  6,
            padding:       '6px 16px',
            fontSize:      14,
            fontWeight:    800,
            color:         '#0F172A',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {brand}
        </div>
        <div style={{ color: '#94A3B8', fontSize: 14, marginLeft: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {eyebrow}
        </div>
      </div>

      {/* Heading */}
      <div
        style={{
          fontSize:      54,
          fontWeight:    800,
          color:         '#FFFFFF',
          lineHeight:    1.1,
          maxWidth:      900,
          marginBottom:  24,
          letterSpacing: '-0.02em',
        }}
      >
        {heading}
      </div>

      {/* Sub */}
      {sub && (
        <div
          style={{
            fontSize:    24,
            color:       '#CBD5E1',
            maxWidth:    780,
            lineHeight:  1.4,
            marginBottom: 'auto',
          }}
        >
          {sub}
        </div>
      )}

      {/* CTA pill */}
      {cta && (
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            background:   `linear-gradient(135deg, #F5A820, ${accent})`,
            borderRadius: 48,
            padding:      '16px 36px',
            fontSize:     22,
            fontWeight:   700,
            color:        '#FFFFFF',
            alignSelf:    'flex-start',
            marginTop:    sub ? 0 : 'auto',
          }}
        >
          {cta}
        </div>
      )}

      {/* footer url */}
      <div
        style={{
          position:  'absolute',
          bottom:    24,
          right:     32,
          fontSize:  14,
          color:     '#64748B',
        }}
      >
        markdekock.com
      </div>
    </div>
  )
}
