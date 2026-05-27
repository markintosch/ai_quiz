import type { Metadata } from 'next'

const BASE = 'https://markdekock.com'

export const metadata: Metadata = {
  title: 'AI impact op leiderschap · executive sessie 29 juni of 6 juli 2026',
  description:
    'Praktische executive sessie voor CEO, CMO en CDO over wat AI vraagt van leiderschap. Met Ben van den Burg en Mark de Kock. Kies maandag 29 juni of maandag 6 juli 2026, Utrecht.',
  metadataBase: new URL(BASE),
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE}/ai-leiderschap` },
  openGraph: {
    title: 'AI impact op leiderschap · executive sessie',
    description: 'Halve dag voor CEO/CMO/CDO, gevolgd door een 90-dagen-traject. 29 juni of 6 juli 2026, Utrecht.',
    url: `${BASE}/ai-leiderschap`,
    siteName: 'Mark de Kock & Ben van den Burg',
    type: 'website',
    locale: 'nl_NL',
  },
}

function buildEvent(name: string, startISO: string, endISO: string) {
  return {
    '@type': 'BusinessEvent',
    name,
    description: 'Praktische executive sessie voor CEO, CMO en CDO over wat AI vraagt van leiderschap, gevolgd door een 90-dagen-traject.',
    startDate: startISO,
    endDate: endISO,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Utrecht',
      address: { '@type': 'PostalAddress', addressLocality: 'Utrecht', addressCountry: 'NL' },
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
    maximumAttendeeCapacity: 20,
    inLanguage: 'nl',
    url: `${BASE}/ai-leiderschap`,
    image: `${BASE}/ai-leiderschap/opengraph-image`,
  }
}

const eventSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    buildEvent('AI impact op leiderschap · 29 juni 2026', '2026-06-29T13:30:00+02:00', '2026-06-29T17:30:00+02:00'),
    buildEvent('AI impact op leiderschap · 6 juli 2026',  '2026-07-06T13:30:00+02:00', '2026-07-06T17:30:00+02:00'),
  ],
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
