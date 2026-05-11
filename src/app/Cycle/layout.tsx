// FILE: src/app/Cycle/layout.tsx
// Standalone Cycle Companion layout. Cream/blush palette, soft serif for
// numerals, no shared header/footer with the rest of markdekock.com.

import type { Metadata, Viewport } from 'next'
import './cycle.css'

export const metadata: Metadata = {
  title: 'Cycle Companion',
  description: 'Persoonlijke cyclus, stemming en levenstijl tracker.',
  robots: { index: false, follow: false },
  manifest: '/Cycle/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title:   'Cycle',
    statusBarStyle: 'default',
    startupImage: '/Cycle/apple-touch-icon.png',
  },
  icons: {
    icon: [
      { url: '/Cycle/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/Cycle/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/Cycle/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF1ED' },
    { media: '(prefers-color-scheme: dark)',  color: '#2A2422' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function CycleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cycle-root min-h-screen w-full">
      {children}
    </div>
  )
}
