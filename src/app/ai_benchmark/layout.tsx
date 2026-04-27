import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI-benchmark voor marketing & sales | Mark de Kock',
  description: 'Vergelijk je AI-gebruik met honderden marketeers en sellers. Persoonlijk dashboard, geen verkooppraat. Onderdeel van het onderzoek "State of AI in Marketing & Sales".',
  robots: { index: false, follow: false },
}

export default function AiBenchmarkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
