import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Circular Readiness Assessment | Madaster',
  description:
    'Discover how circular-ready your organisation really is. Assess yourself across 6 dimensions — materials registration, circular design, data infrastructure, regulatory compliance, financial valuation, and stakeholder alignment.',
  robots: { index: false, follow: false },
}

export default function MadasterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
