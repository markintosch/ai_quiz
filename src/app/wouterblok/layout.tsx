import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Growth Flywheel Scan | Wouter Blok',
  description: 'Score your growth maturity across eight performance pillars and find out where your flywheel stalls. About three minutes.',
  robots: { index: false, follow: false },
}

export default function WouterblokLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
