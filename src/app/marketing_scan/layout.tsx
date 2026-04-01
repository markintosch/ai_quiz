import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketing Organisation Scan | Wouter Blok',
  description: 'Assess how AI-ready and data-driven your marketing organisation is across 8 performance pillars.',
  robots: { index: false, follow: false },
}

export default function MarketingScanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
