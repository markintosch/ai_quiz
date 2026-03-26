import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wat ik maak | Mark de Kock',
  description: 'Een white-label assessmentplatform met acht diagnostische producten voor sectoren van pharma tot M&A. Gebouwd met AI als co-developer op elke laag.',
  robots: { index: false, follow: false }, // canonical is /werk
}

export default function WerkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
