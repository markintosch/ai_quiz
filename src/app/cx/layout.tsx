import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CX Maturity Assessment | Marije Gast',
  description: 'Discover how genuinely customer-centric your organisation is. A 24-question diagnostic across 6 dimensions — by CX expert Marije Gast.',
  robots: { index: false, follow: false },
}

export default function CxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
