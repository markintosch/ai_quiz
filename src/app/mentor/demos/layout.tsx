import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demos | Mark de Kock',
  description: 'Persoonlijk gedeelde demo-overzicht van applicaties gebouwd door Mark de Kock.',
  robots: { index: false, follow: false },
}

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
