import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AI impact op leiderschap — executive middag 29 juni 2026'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0D1B2A',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #F5A820, #E8611A)',
            borderRadius: '6px',
            padding: '6px 16px',
            fontSize: '14px',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '40px',
            alignSelf: 'flex-start',
          }}
        >
          Executive middag · 29 juni 2026
        </div>
        <div style={{ fontSize: '64px', fontWeight: 800, color: '#fff', lineHeight: 1.04, maxWidth: '920px', marginBottom: '24px' }}>
          AI impact op leiderschap
        </div>
        <div style={{ fontSize: '26px', color: '#b0c2d2', maxWidth: '820px', lineHeight: 1.4, marginBottom: 'auto' }}>
          Een halve dag plus een 90-dagen-traject voor CEO, CMO en CDO. Utrecht.
        </div>
        <div style={{ color: '#8aa8bb', fontSize: '22px', fontWeight: 600 }}>
          Ben van den Burg &amp; Mark de Kock
        </div>
      </div>
    ),
    { ...size }
  )
}
