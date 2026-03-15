import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt    = 'AI Maturity Assessment — Kirk & Blackbeard'
export const size   = { width: 1200, height: 630 }
export const contentType = 'image/png'

const LOCALE_COPY: Record<string, { heading: string; sub: string; cta: string }> = {
  en: {
    heading: 'Where does your organisation stand on AI?',
    sub:     'Free 5-minute diagnostic across 6 dimensions. Instant results.',
    cta:     'Start the AI scan →',
  },
  nl: {
    heading: 'Hoe ver is jouw organisatie met AI?',
    sub:     'Gratis 5-minuten-diagnose op 6 dimensies. Direct resultaat.',
    cta:     'Start de AI-scan →',
  },
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const copy = LOCALE_COPY[locale] ?? LOCALE_COPY.en

  return new ImageResponse(
    (
      <div
        style={{
          width:      '100%',
          height:     '100%',
          display:    'flex',
          flexDirection: 'column',
          background: '#354E5E',
          padding:    '64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand bar */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
          <div
            style={{
              background:   'linear-gradient(135deg, #F5A820, #E8611A)',
              borderRadius: '6px',
              padding:      '6px 16px',
              fontSize:     '14px',
              fontWeight:   700,
              color:        '#fff',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Kirk &amp; Blackbeard
          </div>
          <div style={{ color: '#8aa8bb', fontSize: '14px', marginLeft: '16px' }}>
            AI Maturity Assessment
          </div>
        </div>

        {/* Main heading */}
        <div
          style={{
            fontSize:    '54px',
            fontWeight:  800,
            color:       '#ffffff',
            lineHeight:  1.1,
            maxWidth:    '800px',
            marginBottom: '24px',
          }}
        >
          {copy.heading}
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize:  '26px',
            color:     '#b0c8d8',
            maxWidth:  '680px',
            lineHeight: 1.4,
            marginBottom: 'auto',
          }}
        >
          {copy.sub}
        </div>

        {/* CTA pill */}
        <div
          style={{
            display:       'flex',
            alignItems:    'center',
            background:    'linear-gradient(135deg, #F5A820, #E8611A)',
            borderRadius:  '48px',
            padding:       '16px 36px',
            fontSize:      '22px',
            fontWeight:    700,
            color:         '#fff',
            alignSelf:     'flex-start',
          }}
        >
          {copy.cta}
        </div>
      </div>
    ),
    { ...size }
  )
}
