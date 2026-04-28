import type { Metadata } from 'next'

// Interaction page — keep out of search indices.
export const metadata: Metadata = {
  title:    'Start de AI-benchmark',
  robots:   { index: false, follow: true },
  alternates: { canonical: '/ai_benchmark/start' },
}

export default function AiBenchmarkStartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
