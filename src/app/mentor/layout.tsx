import type { Metadata } from 'next'
import {
  buildPersonSchema,
  buildProfessionalServiceSchema,
  buildWebSiteSchema,
  buildFAQSchema,
  serializeJsonLd,
} from '@/lib/seo/structured-data'

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Strategisch mentor voor AI & executie | Mark de Kock',
  description:
    'Van AI-ambitie naar heldere richting, intern draagvlak en een eerste use case die werkt. Persoonlijke begeleiding voor senior leiders. Partner Kirk & Blackbeard. Max. 5 trajecten tegelijk.',
  metadataBase: new URL('https://markdekock.com'),
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://markdekock.com',
    languages: {
      'nl': 'https://markdekock.com',
      'en': 'https://markdekock.com/en',
    },
  },
  openGraph: {
    title: 'Van AI-ambitie naar richting, draagvlak en een use case die werkt | Mark de Kock',
    description:
      'Persoonlijke begeleiding voor senior leiders. Geen training, geen consultancy — strategische mentoring op het punt waar ambitie concreet moet worden. Max. 5 trajecten tegelijk.',
    url: 'https://markdekock.com',
    siteName: 'Mark de Kock',
    type: 'website',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strategisch mentor voor AI & executie | Mark de Kock',
    description: 'Persoonlijke begeleiding voor senior leiders. Van AI-ambitie naar iets wat echt werkt.',
  },
  keywords: [
    'AI strategie directie', 'AI mentor', 'strategisch mentor AI', 'AI implementatie organisatie',
    'AI readiness management', 'Kirk & Blackbeard', 'Mark de Kock', 'AI executie',
    'digitale transformatie leiderschap', 'AI begeleiding senior leiders',
  ],
  authors: [{ name: 'Mark de Kock', url: 'https://markdekock.com' }],
}

// ── Structured data (JSON-LD) ─────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: 'Wat doet een strategisch AI-mentor?',
    answer:
      'Een strategisch AI-mentor helpt leidinggevenden en managementteams AI te vertalen naar concrete richting en keuzes — zonder dat ze zelf technisch expert hoeven te worden. De focus ligt op prioriteiten, intern draagvlak en een eerste use case die daadwerkelijk werkt.',
  },
  {
    question: 'Voor wie is strategische AI-mentoring bedoeld?',
    answer:
      'Voor senior leiders en managementteams die weten dat AI impact gaat hebben op hun organisatie, maar moeite hebben met de vertaling naar concrete stappen. Geen training, maar persoonlijke begeleiding bij echte beslissingen.',
  },
  {
    question: 'Wat is het verschil tussen AI-mentoring en AI-consultancy?',
    answer:
      'Een consultant levert een rapport of implementeert een oplossing. Een mentor begeleidt jou als leidinggevende — zodat de richting, de keuzes en het eigenaarschap intern blijven. Het doel is dat jij na drie maanden zelfstandig verder kunt.',
  },
  {
    question: 'Hoe lang duurt een AI-mentortraject bij Mark de Kock?',
    answer:
      'Een standaard traject duurt drie maanden. Het begint met een gratis intakegesprek om te beoordelen of er een match is. Mark werkt met maximaal vijf trajecten tegelijk voor persoonlijke betrokkenheid.',
  },
  {
    question: 'Wat kost een intake bij Mark de Kock?',
    answer:
      'Het intakegesprek is gratis en vrijblijvend. Tijdens de intake beoordelen Mark en de leidinggevende samen of er een match is qua situatie, urgentie en verwachtingen.',
  },
]

const jsonLd = serializeJsonLd([
  buildWebSiteSchema('https://markdekock.com', 'Mark de Kock'),
  buildPersonSchema({
    name:        'Mark de Kock',
    url:         'https://markdekock.com',
    jobTitle:    'Strategisch mentor voor AI & executie',
    description: 'Senior operator en partner bij Kirk & Blackbeard. Twintig jaar ervaring in strategie, groei, klantbeleving en executie. Begeleidt leidinggevenden bij het vertalen van AI-ambitie naar richting, draagvlak en een eerste werkende use case.',
    orgName:     'Kirk & Blackbeard',
    orgUrl:      'https://kirkandblackbeard.com',
    country:     'NL',
    knowsAbout:  ['AI strategie', 'Digitale transformatie', 'Verandermanagement', 'Executie', 'Klantbeleving', 'Groei'],
    linkedin:    'https://www.linkedin.com/profile/view?id=8838938',
  }),
  buildProfessionalServiceSchema({
    name:        'Strategisch mentorschap AI & executie | Mark de Kock',
    url:         'https://markdekock.com',
    description: 'Driemanands persoonlijk traject voor senior leiders: van AI-ambitie naar heldere prioriteiten, intern draagvlak en een eerste use case die werkt.',
    providerName: 'Mark de Kock',
    country:     'Netherlands',
    languages:   ['nl', 'en'],
    freeIntake:  true,
  }),
  buildFAQSchema(FAQ_ITEMS),
])

// ── Layout ────────────────────────────────────────────────────────────────────

export default function MentorLayout({ children }: { children: React.ReactNode }) {
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
