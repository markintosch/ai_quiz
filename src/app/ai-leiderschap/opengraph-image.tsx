import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AI impact op leiderschap · executive sessie 29 juni of 6 juli 2026'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0D1B2A, #13243a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
          color: '#fff',
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#F5A820',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          Executive sessie · 29 juni of 6 juli 2026 · Utrecht
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: '-0.02em',
            maxWidth: 940,
          }}
        >
          AI impact op leiderschap
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#b0c2d2',
            marginTop: 26,
            maxWidth: 760,
            lineHeight: 1.45,
          }}
        >
          Voor CEO, CMO en CDO. Inclusief 90-dagen-vervolgtraject met Ben van der Burg &amp; Mark de Kock.
        </div>
        <div style={{ fontSize: 14, color: '#5a6678', marginTop: 'auto' }}>
          markdekock.com
        </div>
      </div>
    ),
    { ...size }
  )
}
