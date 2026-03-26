import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wat ik maak | Mark de Kock',
  description: 'Een white-label assessmentplatform met acht diagnostische producten voor sectoren van pharma tot M&A. Gebouwd met AI als co-developer op elke laag.',
  openGraph: {
    title: 'Wat ik maak — Mark de Kock',
    description: 'Één codebase. Acht producten. Zeven klantcontexten. Gebouwd met Claude als co-developer.',
    url: 'https://markdekock.com/werk',
    siteName: 'markdekock.com',
    locale: 'nl_NL',
    type: 'website',
  },
  alternates: {
    canonical: 'https://markdekock.com/werk',
  },
  robots: { index: true, follow: true },
}

export default function WerkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
