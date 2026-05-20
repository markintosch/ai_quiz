import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Summer Course Claude AI — Bouw in drie dagen je eigen AI-werkproces'
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
          background: '#1E3340',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand bar */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '44px' }}>
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
            }}
          >
            Zomercursus · 3-daagse AI build sprint
          </div>
        </div>

        {/* Main heading */}
        <div
          style={{
            fontSize: '60px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.08,
            maxWidth: '900px',
            marginBottom: '24px',
          }}
        >
          Bouw in drie dagen je eigen AI-werkproces
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: '26px',
            color: '#b0c8d8',
            maxWidth: '760px',
            lineHeight: 1.4,
            marginBottom: 'auto',
          }}
        >
          Een praktische zomercursus met Claude AI. Je werkt aan je eigen case en gaat naar huis met een werkende workflow.
        </div>

        {/* Footer: hosts + pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: '#8aa8bb', fontSize: '22px', fontWeight: 600 }}>
            Frank Meeuwsen &amp; Mark de Kock
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #F5A820, #E8611A)',
              borderRadius: '48px',
              padding: '14px 32px',
              fontSize: '22px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Reserveer je plek →
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
