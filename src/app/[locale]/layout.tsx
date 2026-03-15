import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

// ── Per-locale metadata (title, description, OG, hreflang) ───────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aiquiz.kirkandblackbeard.com'

const LOCALE_META: Record<string, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: 'AI Maturity Assessment | Kirk & Blackbeard',
    description:
      'Find out where your organisation stands on AI in 5 minutes. Free diagnostic across 6 dimensions — strategy, usage, data, talent, governance and opportunity.',
    ogLocale: 'en_GB',
  },
  nl: {
    title: 'AI Volwassenheidsanalyse | Kirk & Blackbeard',
    description:
      'Ontdek in 5 minuten hoe ver jouw organisatie is met AI. Gratis diagnose op 6 dimensies — strategie, gebruik, data, talent, governance en kansen.',
    ogLocale: 'nl_NL',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const meta = LOCALE_META[locale] ?? LOCALE_META.en

  return {
    title: meta.title,
    description: meta.description,
    metadataBase: new URL(BASE_URL),

    // ── Canonical + hreflang alternates ──────────────────────────────────────
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        en: `${BASE_URL}/en`,
        nl: `${BASE_URL}/nl`,
      },
    },

    // ── Open Graph (LinkedIn, Facebook, WhatsApp shares) ─────────────────────
    openGraph: {
      type:        'website',
      url:         `${BASE_URL}/${locale}`,
      title:       meta.title,
      description: meta.description,
      locale:      meta.ogLocale,
      alternateLocale: locale === 'en' ? ['nl_NL'] : ['en_GB'],
      siteName:    'Kirk & Blackbeard — AI Maturity Assessment',
      // opengraph-image.tsx in this segment auto-generates the OG image
    },

    // ── Twitter / X card ─────────────────────────────────────────────────────
    twitter: {
      card:        'summary_large_image',
      title:       meta.title,
      description: meta.description,
    },

    // ── Additional signals ────────────────────────────────────────────────────
    keywords: locale === 'en'
      ? ['AI maturity', 'AI assessment', 'AI readiness', 'artificial intelligence', 'digital transformation', 'Kirk & Blackbeard']
      : ['AI volwassenheid', 'AI assessment', 'kunstmatige intelligentie', 'digitale transformatie', 'Kirk & Blackbeard'],
    authors: [
      { name: 'Mark de Kock' },
      { name: 'Frank Meeuwsen', url: 'https://frankmeeuwsen.com' },
    ],
    robots: {
      index:             true,
      follow:            true,
      googleBot: {
        index:               true,
        follow:              true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet':       -1,
      },
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

// ── JSON-LD structured data ───────────────────────────────────────────────────
function buildJsonLd(locale: string) {
  const meta = LOCALE_META[locale] ?? LOCALE_META.en
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type':               'WebApplication',
        '@id':                 `${BASE_URL}/#app`,
        name:                  'AI Maturity Assessment',
        url:                   BASE_URL,
        description:           meta.description,
        applicationCategory:   'BusinessApplication',
        operatingSystem:       'Web',
        offers: {
          '@type':         'Offer',
          price:           '0',
          priceCurrency:   'EUR',
          availability:    'https://schema.org/InStock',
        },
        author: [
          {
            '@type':    'Person',
            name:       'Mark de Kock',
            jobTitle:   'AI Transformation Lead',
            worksFor: {
              '@type': 'Organization',
              name:    'Kirk & Blackbeard',
            },
          },
          {
            '@type':    'Person',
            name:       'Frank Meeuwsen',
            jobTitle:   'AI Trainer & Consultant',
            url:        'https://frankmeeuwsen.com',
          },
        ],
      },
      {
        '@type': 'Organization',
        '@id':   `${BASE_URL}/#org`,
        name:    'Kirk & Blackbeard',
        url:     BASE_URL,
      },
    ],
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound()
  }

  // Required: tells next-intl which locale is active for server components
  setRequestLocale(locale)

  // Pass locale explicitly — more reliable on Vercel edge/serverless
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(locale)) }}
      />
      {children}
    </NextIntlClientProvider>
  )
}
