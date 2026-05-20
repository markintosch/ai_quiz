import type { Metadata } from 'next'

const BASE = 'https://markdekock.com'

export const metadata: Metadata = {
  title: 'Summer Course Claude AI | Mark de Kock & Frank Meeuwsen',
  description:
    'Driedaagse fysieke summer course Claude AI. Kleine groep (max. 12), vast ochtendprogramma en zelf bouwen onder begeleiding in de middag. Voor knowledge workers die Claude écht willen inzetten.',
  metadataBase: new URL(BASE),
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE}/summercourse` },
  openGraph: {
    title: 'Summer Course Claude AI — 3 dagen, max. 12 deelnemers',
    description:
      'Geen losse trucs, maar een persoonlijke Claude-workflow verankerd in je eigen werk. Begeleid door Mark de Kock & Frank Meeuwsen.',
    url: `${BASE}/summercourse`,
    siteName: 'Mark de Kock',
    type: 'website',
    locale: 'nl_NL',
  },
}

export default function SummerCourseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
