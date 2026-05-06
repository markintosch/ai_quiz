// FILE: src/app/sannah/layout.tsx
// Sannah De Zwart — portfolio site layout.
// Tarr-style: sticky minimal nav, sans-serif, lots of whitespace, NL/EN.

import type { Metadata } from 'next'
import SannahNav from '@/components/sannah/Nav'

export const metadata: Metadata = {
  title:       'Sannah De Zwart — beeldend vormgever',
  description: 'Portfolio van Sannah De Zwart: beeldend vormgever en docent.',
  robots:      { index: true, follow: true },
}

export default function SannahLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      background: '#fff',
      color: '#1a1a1a',
      minHeight: '100vh',
      letterSpacing: '-0.005em',
    }}>
      <SannahNav />

      <main>{children}</main>

      <footer style={{
        borderTop: '1px solid #ececec',
        marginTop: 96,
        padding: '24px',
        fontSize: 11,
        color: '#9a9a9a',
        textAlign: 'center',
        letterSpacing: '0.04em',
      }}>
        © {new Date().getFullYear()} Sannah De Zwart
      </footer>
    </div>
  )
}
