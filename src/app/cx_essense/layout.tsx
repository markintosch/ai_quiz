import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CX Maturity Assessment | Essense',
  description: 'Discover how customer-centric your organisation really is. A 24-question diagnostic across 6 dimensions — by Essense, the hands-on CX agency.',
  robots: { index: false, follow: false },
}

export default function CxEssenseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
