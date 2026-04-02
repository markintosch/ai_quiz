import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Energy Profile · Bas Westland · e-people',
  description: '15 vragen. 5 dimensies. Eén eerlijk profiel van hoe jij werkt.',
  robots: { index: false, follow: false },
}

export default function BasEnergyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
