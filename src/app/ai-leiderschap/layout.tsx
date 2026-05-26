import type { Metadata } from 'next'

const BASE = 'https://markdekock.com'

export const metadata: Metadata = {
  title: 'AI impact op leiderschap — executive middag 29 juni 2026',
  description:
    'Praktische executive middag voor CEO, CMO en CDO over wat AI vraagt van leiderschap. Met Ben van den Burg en Mark de Kock. Maandag 29 juni 2026, Utrecht.',
  metadataBase: new URL(BASE),
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE}/ai-leiderschap` },
  openGraph: {
    title: 'AI impact op leiderschap — executive middag',
    description: 'Halve dag voor CEO/CMO/CDO, gevolgd door een 90-dagen-traject. 29 juni 2026, Utrecht.',
    url: `${BASE}/ai-leiderschap`,
    siteName: 'Mark de Kock & Ben van den Burg',
    type: 'website',
    locale: 'nl_NL',
  },
}

export default function AILeiderschapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
