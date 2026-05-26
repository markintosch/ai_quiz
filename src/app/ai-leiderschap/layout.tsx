import type { Metadata } from 'next'

const BASE = 'https://markdekock.com'

export const metadata: Metadata = {
  title: 'AI impact op leiderschap · executive sessie 29 juni 2026',
  description:
    'Praktische executive sessie voor CEO, CMO en CDO over wat AI vraagt van leiderschap. Met Ben van den Burg en Mark de Kock. Maandag 29 juni 2026, Utrecht.',
  metadataBase: new URL(BASE),
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE}/ai-leiderschap` },
  openGraph: {
    title: 'AI impact op leiderschap · executive sessie',
    description: 'Halve dag voor CEO/CMO/CDO, gevolgd door een 90-dagen-traject. 29 juni 2026, Utrecht.',
    url: `${BASE}/ai-leiderschap`,
    siteName: 'Mark de Kock & Ben van den Burg',
    type: 'website',
    locale: 'nl_NL',
  },
}

const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'BusinessEvent',
  name: 'AI impact op leiderschap · executive sessie',
  description: 'Praktische executive sessie voor CEO, CMO en CDO over wat AI vraagt van leiderschap, gevolgd door een 90-dagen-traject.',
  startDate: '2026-06-29T09:00:00+02:00',
  endDate:   '2026-06-29T17:30:00+02:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Utrecht',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Utrecht',
      addressCountry: 'NL',
    },
  },
  organizer: [
    { '@type': 'Person', name: 'Ben van den Burg' },
    { '@type': 'Person', name: 'Mark de Kock', url: 'https://markdekock.com' },
  ],
  offers: {
    '@type': 'Offer',
    price: '1595',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    url: `${BASE}/ai-leiderschap#boeken`,
  },
  maximumAttendeeCapacity: 40,
  inLanguage: 'nl',
  url:   `${BASE}/ai-leiderschap`,
  image: `${BASE}/ai-leiderschap/opengraph-image`,
}

export default function AILeiderschapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      {children}
    </>
  )
}
