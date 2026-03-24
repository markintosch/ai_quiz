import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Strategisch mentor voor AI & executie | Mark de Kock',
  description:
    'Van AI-ambitie naar iets wat écht werkt in jouw organisatie. Persoonlijke begeleiding voor senior leiders die AI willen vertalen naar richting, keuzes en concrete voortgang.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Van AI-ambitie naar iets wat écht werkt | Mark de Kock',
    description: 'Persoonlijke begeleiding voor senior leiders. Geen training, geen consultancy — strategische mentoring op het punt waar ambitie concreet moet worden. Max. 5 mensen tegelijk.',
    url: 'https://markdekock.com/mentor',
    siteName: 'Mark de Kock',
    type: 'website',
  },
}

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
