import type { Metadata } from 'next'
import {
  buildPersonSchema,
  buildBreadcrumbSchema,
  buildProfessionalServiceSchema,
  serializeJsonLd,
} from '@/lib/seo/structured-data'

const BASE = 'https://markdekock.com'

export const metadata: Metadata = {
  title: 'Hoe ik werk — drie trajectopties | Mark de Kock',
  description:
    'Verkenning, begeleiding of strategisch partnerschap. Elk traject start met een gratis intakegesprek. Maximaal vijf klanten tegelijk.',
  metadataBase: new URL(BASE),
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${BASE}/mentor/aanpak`,
    languages: {
      'nl':        `${BASE}/mentor/aanpak`,
      'en':        `${BASE}/mentor/aanpak?lang=en`,
      'de':        `${BASE}/mentor/aanpak?lang=de`,
      'x-default': `${BASE}/mentor/aanpak`,
    },
  },
  openGraph: {
    title: 'Drie trajectopties — van verkenning tot strategisch partnerschap | Mark de Kock',
    description:
      'Verkenning (3–4 weken), Begeleiding (8–12 weken) of Strategisch partnerschap (doorlopend). Gratis intake, geen verplichting.',
    url: `${BASE}/mentor/aanpak`,
    siteName: 'Mark de Kock',
    type: 'website',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hoe ik werk — drie trajectopties | Mark de Kock',
    description: 'Van verkenning tot strategisch partnerschap. Gratis intake, geen verplichting.',
  },
  keywords: [
    'AI traject opties', 'strategisch mentorschap prijs', 'AI begeleiding kosten',
    'AI strategie traject', 'executive coaching AI', 'Mark de Kock aanpak',
    'AI mentoring Nederland', 'Kirk & Blackbeard',
  ],
  authors: [{ name: 'Mark de Kock', url: BASE }],
}

// ── Structured data (JSON-LD) ─────────────────────────────────────────────────

const jsonLd = serializeJsonLd([
  buildBreadcrumbSchema([
    { name: 'Mark de Kock',   url: `${BASE}/mentor` },
    { name: 'Hoe ik werk',    url: `${BASE}/mentor/aanpak` },
  ]),
  buildPersonSchema({
    name:        'Mark de Kock',
    url:         BASE,
    jobTitle:    'Strategisch mentor voor AI & executie',
    description: 'Senior operator en partner bij Kirk & Blackbeard. Begeleidt leidinggevenden bij het vertalen van AI-ambitie naar richting, draagvlak en een eerste werkende use case.',
    orgName:     'Kirk & Blackbeard',
    orgUrl:      'https://kirkandblackbeard.com',
    country:     'NL',
    knowsAbout:  ['AI strategy', 'AI strategie', 'Digital transformation', 'Strategic mentoring', 'Execution', 'Change management'],
    linkedin:    'https://www.linkedin.com/in/markdekock/',
  }),
  buildProfessionalServiceSchema({
    name:         'AI Mentortraject — Verkenning',
    url:          `${BASE}/mentor/aanpak#verkenning`,
    description:  'Een verkenningstraject van 3–4 weken met situatieanalyse en eerlijk richtingadvies. Gratis intakegesprek.',
    providerName: 'Mark de Kock',
    country:      'Netherlands',
    languages:    ['nl', 'en', 'de'],
    freeIntake:   true,
  }),
  buildProfessionalServiceSchema({
    name:         'AI Mentortraject — Begeleiding',
    url:          `${BASE}/mentor/aanpak#begeleiding`,
    description:  'Begeleidingstraject van 8–12 weken: richting, draagvlak en een eerste werkende use case. Fase per fase, met duidelijke deliverables.',
    providerName: 'Mark de Kock',
    country:      'Netherlands',
    languages:    ['nl', 'en', 'de'],
    freeIntake:   true,
  }),
  buildProfessionalServiceSchema({
    name:         'AI Mentortraject — Strategisch partnerschap',
    url:          `${BASE}/mentor/aanpak#partnerschap`,
    description:  'Doorlopend strategisch partnerschap voor directies die AI structureel willen verankeren in hun organisatie.',
    providerName: 'Mark de Kock',
    country:      'Netherlands',
    languages:    ['nl', 'en', 'de'],
    freeIntake:   true,
  }),
])

// ── Layout ────────────────────────────────────────────────────────────────────

export default function AanpakLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {children}
    </>
  )
}
