import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'De Machine Pulse | VPRO 3voor12',
  description:
    'Wat vinden De Machine-luisteraars écht? Beoordeel festivals op 5 dimensies en vergelijk met de massa.',
}

export default function PulseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
