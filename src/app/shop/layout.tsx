import type { ReactNode } from 'react'

export default function ShopLayout({ children }: { children: ReactNode }) {
  const ff = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <nav
        style={{
          background: '#0F172A',
          padding: '0 clamp(24px, 5vw, 80px)',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontFamily: ff,
        }}
      >
        {/* Left: brand + section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>
            Mark de Kock
          </span>
          <span style={{ color: '#94A3B8', fontSize: '13px' }}>/</span>
          <span style={{ color: '#94A3B8', fontSize: '13px' }}>
            Kennisproducten
          </span>
        </div>

        {/* Right: back link */}
        <a
          href="https://www.markdekock.com"
          style={{
            color: '#94A3B8',
            textDecoration: 'none',
            fontSize: '13px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#94A3B8' }}
        >
          ← markdekock.com
        </a>
      </nav>
      {children}
    </div>
  )
}
