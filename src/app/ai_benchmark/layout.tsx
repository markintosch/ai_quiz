import type { Metadata } from 'next'
import { headers } from 'next/headers'

// Derive the actual host being served (markdekock.com, aiquiz.brandpwrdmedia.nl,
// or any other) at request time. This makes every host self-canonicalize so
// LinkedIn / X / WhatsApp don't see cross-domain og:url + og:image mismatches.
function getBaseUrl(): string {
  try {
    const h = headers()
    const host = h.get('host')
    const proto = h.get('x-forwarded-proto') || 'https'
    if (host) return `${proto}://${host}`
  } catch { /* headers() unavailable in some build contexts */ }
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://markdekock.com'
}

export async function generateMetadata(): Promise<Metadata> {
  const BASE = getBaseUrl()
  const ogUrl = `${BASE}/api/ai_benchmark/og?type=landing`
  return {
    metadataBase: new URL(BASE),
    title: {
      default:  'AI-benchmark voor marketing & sales | Mark de Kock',
      template: '%s · AI-benchmark · Mark de Kock',
    },
    description: 'Vergelijk jouw gebruik van AI-tools met die van je vakgenoten. Of je nu in marketing beweegt of sales. Kijk welke inzichten je kunt gebruiken van anderen.',
    keywords: ['AI', 'marketing', 'sales', 'benchmark', 'onderzoek', 'AI-tools', 'AI-adoptie', 'marketing AI', 'sales AI'],
    authors: [{ name: 'Mark de Kock', url: 'https://markdekock.com' }],
    alternates: { canonical: `${BASE}/ai_benchmark` },
    openGraph: {
      title: 'AI-benchmark voor marketing & sales',
      description: 'Vergelijk jouw gebruik van AI-tools met die van je vakgenoten. Of je nu in marketing beweegt of sales. Kijk welke inzichten je kunt gebruiken van anderen.',
      url:     `${BASE}/ai_benchmark`,
      siteName:'Mark de Kock · AI-benchmark',
      locale:  'nl_NL',
      type:    'website',
      images:  [{
        url:    ogUrl,
        width:  1200,
        height: 630,
        alt:    'AI-benchmark voor marketing & sales — door Mark de Kock',
      }],
    },
    twitter: {
      card:  'summary_large_image',
      title: 'AI-benchmark voor marketing & sales',
      description: 'Vergelijk jouw gebruik van AI-tools met die van je vakgenoten in marketing of sales.',
      images: [ogUrl],
    },
  }
}

export default function AiBenchmarkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
