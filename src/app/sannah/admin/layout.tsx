// FILE: src/app/sannah/admin/layout.tsx
// Eigen admin-shell voor Sannah — niet de Mark-sidebar, wel haar eigen
// portfolio-look (sannah.css, theme provider). Login bij /sannah/admin/login.

import type { Metadata } from 'next'
import Script from 'next/script'
import { SannahThemeProvider, SANNAH_THEME_BOOT } from '@/components/sannah/ThemeProvider'
import '../sannah.css'

export const metadata: Metadata = {
  title:  'Sannah — beheer',
  robots: { index: false, follow: false },
}

export default function SannahAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
          {children}
        </div>
      </SannahThemeProvider>
    </>
  )
}
