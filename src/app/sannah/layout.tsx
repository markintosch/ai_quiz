// FILE: src/app/sannah/layout.tsx
// Sannah de Zwart — portfolio site layout.
// Tarr-style: sticky minimal nav, sans-serif, lots of whitespace, NL/EN.
// Theme: light/dark via SannahThemeProvider + CSS variables (sannah.css).

import type { Metadata } from 'next'
import Script from 'next/script'
import SannahNav from '@/components/sannah/Nav'
import { SannahThemeProvider, SANNAH_THEME_BOOT } from '@/components/sannah/ThemeProvider'
import './sannah.css'

export const metadata: Metadata = {
  title:       'Sannah de Zwart — beeldend vormgever',
  description: 'Portfolio van Sannah de Zwart: beeldend vormgever en docent.',
  robots:      { index: true, follow: true },
}

export default function SannahLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Inline script — zet data-sannah voor React hydrateert (geen flash) */}
      <Script id="sannah-theme-boot" strategy="beforeInteractive">
        {SANNAH_THEME_BOOT}
      </Script>

      <SannahThemeProvider>
        <div
          className="sannah-root"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
            letterSpacing: '-0.005em',
          }}
        >
          <SannahNav />

          <main>{children}</main>

          <footer style={{
            borderTop: '1px solid var(--sannah-border)',
            marginTop: 96,
            padding: '24px',
            fontSize: 11,
            color: 'var(--sannah-text-faded)',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}>
            © {new Date().getFullYear()} Sannah de Zwart
          </footer>
        </div>
      </SannahThemeProvider>
    </>
  )
}
