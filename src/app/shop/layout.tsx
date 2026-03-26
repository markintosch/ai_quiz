import type { ReactNode } from 'react'

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <nav
        style={{
          background: '#1a1a1a',
          padding: '0 24px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <a
          href="https://www.markdekock.com"
          style={{
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← markdekock.com
        </a>
      </nav>
      {children}
    </div>
  )
}
