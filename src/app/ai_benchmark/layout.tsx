import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://markdekock.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default:  'AI-benchmark voor marketing & sales | Mark de Kock',
    template: '%s · AI-benchmark · Mark de Kock',
  },
  description: 'Onafhankelijk onderzoek naar AI-gebruik in marketing & sales. Vergelijk je werkwijze met vele honderden professionals. Persoonlijk dashboard direct na invullen.',
  keywords: ['AI', 'marketing', 'sales', 'benchmark', 'onderzoek', 'AI-tools', 'AI-adoptie', 'marketing AI', 'sales AI'],
  authors: [{ name: 'Mark de Kock', url: 'https://markdekock.com' }],
  alternates: { canonical: '/ai_benchmark' },
  openGraph: {
    title: 'AI-benchmark voor marketing & sales',
    description: 'Vergelijk je werkwijze met vele honderden marketeers en sellers. Persoonlijk dashboard, geen verkooppraat.',
    url:     `${BASE}/ai_benchmark`,
    siteName:'Mark de Kock · AI-benchmark',
    locale:  'nl_NL',
    type:    'website',
  },
  twitter: {
    card:  'summary_large_image',
    title: 'AI-benchmark voor marketing & sales',
    description: 'Vergelijk je werkwijze met honderden marketeers en sellers.',
  },
}

export default function AiBenchmarkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
