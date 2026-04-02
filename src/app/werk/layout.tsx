import type { Metadata } from 'next'
import {
  buildPersonSchema,
  buildBreadcrumbSchema,
  buildWebApplicationSchema,
  serializeJsonLd,
} from '@/lib/seo/structured-data'

const BASE = 'https://markdekock.com'

export const metadata: Metadata = {
  title: 'Wat ik maak — AI-assessmentplatform | Mark de Kock',
  description:
    'Een white-label assessmentplatform met meerdere diagnostische producten voor sectoren van pharma tot M&A. Gebouwd met AI als co-developer op elke laag van de stack.',
  metadataBase: new URL(BASE),
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${BASE}/werk`,
  },
  openGraph: {
    title: 'Wat ik maak — AI-assessmentplatform | Mark de Kock',
    description:
      'Één codebase. Meerdere diagnostische producten. Verschillende klantcontexten. Gebouwd met Claude als co-developer — van scoring engine tot white-label CMS.',
    url: `${BASE}/werk`,
    siteName: 'markdekock.com',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wat ik maak — AI-assessmentplatform | Mark de Kock',
    description: 'White-label AI assessmentplatform. Meerdere producten, één codebase, gebouwd met Claude als co-developer.',
  },
  keywords: [
    'AI assessment platform', 'white-label assessment', 'AI maturity scan', 'diagnostisch platform',
    'Next.js Supabase platform', 'AI co-developer', 'Kirk & Blackbeard', 'Mark de Kock projecten',
    'AI readiness scan', 'B2B assessment tool',
  ],
  authors: [{ name: 'Mark de Kock', url: BASE }],
}

// ── Structured data (JSON-LD) ─────────────────────────────────────────────────

const jsonLd = serializeJsonLd([
  buildBreadcrumbSchema([
    { name: 'Mark de Kock',   url: `${BASE}/mentor` },
    { name: 'Wat ik maak',    url: `${BASE}/werk` },
  ]),
  buildPersonSchema({
    name:        'Mark de Kock',
    url:         BASE,
    jobTitle:    'Strategisch mentor voor AI & executie',
    description: 'Senior operator en partner bij Kirk & Blackbeard. Bouwt en implementeert AI-oplossingen in zorg, finance, FMCG en duurzaamheid.',
    orgName:     'Kirk & Blackbeard',
    orgUrl:      'https://kirkandblackbeard.com',
    country:     'NL',
    knowsAbout:  ['AI assessment', 'White-label SaaS', 'Next.js', 'Supabase', 'AI product development'],
    linkedin:    'https://www.linkedin.com/in/markdekock/',
  }),
  buildWebApplicationSchema({
    name:        'AI Maturity Assessment Platform',
    url:         `${BASE}/werk`,
    description: 'White-label diagnostisch assessmentplatform voor AI-volwassenheid en organisatiegereedheid. Gebouwd met Next.js, Supabase en Resend. Meerdere diagnostische producten voor verschillende sectoren en klantcontexten.',
    authors: [{ name: 'Mark de Kock', jobTitle: 'Strategisch mentor & platformbouwer', url: BASE, orgName: 'Kirk & Blackbeard' }],
    orgName:     'Kirk & Blackbeard',
    locale:      'nl',
  }),
])

// ── Layout ────────────────────────────────────────────────────────────────────

export default function WerkLayout({ children }: { children: React.ReactNode }) {
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
