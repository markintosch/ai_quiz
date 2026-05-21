import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Verantwoord AI omarmen — introductiemiddag voor CISO, DPO & compliance'
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
          Introductiemiddag · CISO, DPO &amp; compliance
        </div>
        <div style={{ fontSize: '56px', fontWeight: 800, color: '#fff', lineHeight: 1.08, maxWidth: '920px', marginBottom: '24px' }}>
          Verantwoord AI omarmen
        </div>
        <div style={{ fontSize: '26px', color: '#b0c2d2', maxWidth: '780px', lineHeight: 1.4, marginBottom: 'auto' }}>
          Van rem op AI naar enabler. Praktische guardrails voor AI-adoptie in je organisatie.
        </div>
        <div style={{ color: '#8aa8bb', fontSize: '22px', fontWeight: 600 }}>
          Mark de Kock &amp; Frank Meeuwsen
        </div>
      </div>
    ),
    { ...size }
  )
}
