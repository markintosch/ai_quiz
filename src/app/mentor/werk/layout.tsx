import type { Metadata } from 'next'

const BASE = 'https://markdekock.com'

export const metadata: Metadata = {
  title: 'Wat ik maak | Mark de Kock',
  description: 'Een white-label assessmentplatform met acht diagnostische producten voor sectoren van pharma tot M&A. Gebouwd met AI als co-developer op elke laag.',
  metadataBase: new URL(BASE),
  robots: { index: false, follow: false }, // canonical is /werk
  alternates: {
    canonical: `${BASE}/werk`,
  },
}

export default function WerkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
