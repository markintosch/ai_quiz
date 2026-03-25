import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hoe ik werk | Mark de Kock',
  description: 'Drie manieren van werken: van oriëntatie tot strategisch partnerschap. Elk traject begint met een gratis intakegesprek.',
  robots: { index: true, follow: true },
}

export default function AanpakLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
