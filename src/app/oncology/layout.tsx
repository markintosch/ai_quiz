import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'European Market Readiness Assessment | Oncology Diagnostics | Kirk & Blackbeard',
  description:
    'How ready are your European markets for the next wave in cancer diagnostics? Assess market readiness across six dimensions, overlay sales data, and generate data-driven GTM strategies.',
  openGraph: {
    title: 'European Oncology Market Readiness Assessment',
    description:
      'Six dimensions. Ten markets. One clear picture of your European go-to-market readiness in oncology diagnostics.',
    siteName: 'Kirk & Blackbeard',
    type: 'website',
  },
  robots: { index: false, follow: false }, // client confidential
}

export default function OncologyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
