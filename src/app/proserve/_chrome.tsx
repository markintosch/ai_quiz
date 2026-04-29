// Shared Proserve-themed nav + footer for the demo stubs.
// Imported by /proserve/assessment-demo and /proserve/arena-demo.

import Link from 'next/link'

export const NAVY        = '#1F0F70'
export const NAVY_DARK   = '#0F0840'
export const NAVY_LIGHT  = '#2D1B96'
export const BLUE        = '#1F8EFF'
export const BLUE_SOFT   = '#E5F2FF'
export const INK         = '#1A1A2E'
export const BODY        = '#4B5468'
export const MUTED       = '#8C92A6'
export const BORDER      = '#E5E7EE'
export const LIGHT_BG    = '#F5F6F9'
export const FONT        = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export function ProserveNav({ trail }: { trail?: string }) {
  return (
    <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/proserve" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/proserve/Proserve_logo.png"
              alt="Proserve · by teamblue"
              height={40}
              width={122}
              style={{ height: 40, width: 'auto', display: 'block' }}
            />
          </Link>
          {trail && (
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>
              <Link href="/proserve" style={{ color: MUTED, textDecoration: 'none' }}>voorstel</Link>
              <span style={{ margin: '0 8px' }}>·</span>
              {trail}
            </span>
          )}
        </div>
        <a
          href="https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: BLUE, color: '#fff', fontSize: 13, fontWeight: 700,
            padding: '10px 22px', borderRadius: 100, textDecoration: 'none',
          }}
        >
          Plan een gesprek →
        </a>
      </div>
    </nav>
  )
}

export function ProserveFooter() {
  return (
    <footer style={{ background: '#000', padding: '36px 24px', color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span>Voorstel · Mark de Kock voor Proserve · {new Date().getFullYear()}</span>
        <span>
          Hosted by Mark de Kock · <a href="https://markdekock.com" style={{ color: 'rgba(255,255,255,0.7)' }}>markdekock.com</a>
        </span>
      </div>
    </footer>
  )
}

export function ProserveDemoCta({ note }: { note?: string }) {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
      color: '#fff', padding: '72px 24px',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 14 }}>
          Live zien hoe dit werkt?
        </h2>
        <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 18, letterSpacing: '-0.015em', lineHeight: 1.25 }}>
          30 minuten met Mark — in Proserve-stijl, met jullie vraagstellingen.
        </p>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, marginBottom: 28 }}>
          {note ?? 'Ik laat je het echte product zien, je dropt eigen vragen tijdens de demo, en we bespreken hoe dit past in jullie talent-funnel.'}
        </p>
        <a
          href="https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: BLUE, color: '#fff', fontWeight: 800, fontSize: 16,
            padding: '14px 36px', borderRadius: 100, textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Plan een live demo →
        </a>
      </div>
    </section>
  )
}
