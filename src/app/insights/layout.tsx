import type { Metadata } from 'next'
import {
  buildWebSiteSchema,
  buildBreadcrumbSchema,
  serializeJsonLd,
} from '@/lib/seo/structured-data'

const BASE = 'https://markdekock.com'

export const metadata: Metadata = {
  title: 'Insights — AI-strategie, executie en leiderschap | Mark de Kock',
  description:
    'Artikelen over AI-strategie, Shadow AI, governance en executie. Voor leidinggevenden die ambitie willen vertalen naar iets wat werkt.',
  metadataBase: new URL(BASE),
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${BASE}/insights`,
    languages: {
      'nl':        `${BASE}/insights`,
      'en':        `${BASE}/insights?lang=en`,
      'x-default': `${BASE}/insights`,
    },
    types: {
      'application/rss+xml': `${BASE}/feed.xml`,
    },
  },
  openGraph: {
    title: 'Insights — AI-strategie, executie en leiderschap | Mark de Kock',
    description:
      'Artikelen voor leidinggevenden over AI-strategie, Shadow AI en executie.',
    url: `${BASE}/insights`,
    siteName: 'Mark de Kock',
    type: 'website',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Insights | Mark de Kock',
    description: 'Artikelen over AI-strategie, Shadow AI en executie.',
  },
}

const jsonLd = serializeJsonLd([
  buildWebSiteSchema(BASE, 'Mark de Kock'),
  buildBreadcrumbSchema([
    { name: 'Mark de Kock', url: `${BASE}/mentor` },
    { name: 'Insights',     url: `${BASE}/insights` },
  ]),
])

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Mark de Kock — Insights"
        href={`${BASE}/feed.xml`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {children}
    </>
  )
}
