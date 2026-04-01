import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Energy Profile | Hire.nl',
  description: 'Ontdek jouw werkstijl, communicatiepatroon en motivatie in 15 vragen.',
  robots: { index: false, follow: false },
}

export default function EnergyProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
