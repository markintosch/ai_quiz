import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Hammer Cyber Security Services — Pragmatische cybersecurity voor het MKB'
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
            fontSize: '30px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.06em',
            marginBottom: '40px',
          }}
        >
          HCSS
        </div>
        <div
          style={{
            fontSize: '58px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.08,
            maxWidth: '900px',
            marginBottom: '24px',
          }}
        >
          Pragmatische cybersecurity voor het MKB
        </div>
        <div style={{ fontSize: '26px', color: '#b0c2d2', maxWidth: '760px', lineHeight: 1.4, marginBottom: 'auto' }}>
          Cyberweerbaarheid die begrijpelijk, haalbaar en effectief blijft. Zonder enterprise-complexiteit.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: '#8aa8bb', fontSize: '22px', fontWeight: 600 }}>
            Hammer Cyber Security Services
          </div>
          <div
            style={{
              display: 'flex',
              background: 'linear-gradient(135deg, #F5A820, #E8611A)',
              borderRadius: '48px',
              padding: '14px 32px',
              fontSize: '22px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            ISO 27001 & NIST CSF
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
