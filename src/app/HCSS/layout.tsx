import type { Metadata } from 'next'

const BASE = 'https://markdekock.com'

// The public HCSS content is offline (see src/lib/cyber-compass/offline.ts):
// every route returns 404, so nothing here should be indexed or advertised.
export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  robots: { index: false, follow: false, nocache: true },
}

export default function HcssLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
