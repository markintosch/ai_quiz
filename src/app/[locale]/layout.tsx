import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { routing } from '@/i18n/routing'
import { createServiceClient } from '@/lib/supabase/server'
import { getProductKeyFromHost } from '@/products'

// ── Per-locale metadata (title, description, OG, hreflang) ───────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aiquiz.kirkandblackbeard.com'

const LOCALE_META: Record<string, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: 'AI Maturity Assessment | Brand PWRD Media',
    description:
      'Find out where your organisation stands on AI in 5 minutes. Free diagnostic across 6 dimensions — strategy, usage, data, talent, governance and opportunity.',
    ogLocale: 'en_GB',
  },
  nl: {
    title: 'AI Volwassenheidsanalyse | Brand PWRD Media',
    description:
      'Ontdek in 5 minuten hoe ver jouw organisatie is met AI. Gratis diagnose op 6 dimensies — strategie, gebruik, data, talent, governance en kansen.',
    ogLocale: 'nl_NL',
  },
  fr: {
    title: 'Évaluation de Maturité IA | Brand PWRD Media',
    description:
      'Découvrez en 5 minutes où en est votre organisation sur l\'IA. Diagnostic gratuit sur 6 dimensions — stratégie, utilisation, données, talent, gouvernance et opportunités.',
    ogLocale: 'fr_FR',
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
        fr: `${BASE_URL}/fr`,
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
      siteName:    'Brand PWRD Media — AI Maturity Assessment',
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
      ? ['AI maturity', 'AI assessment', 'AI readiness', 'artificial intelligence', 'digital transformation', 'Brand PWRD Media']
      : ['AI volwassenheid', 'AI assessment', 'kunstmatige intelligentie', 'digitale transformatie', 'Brand PWRD Media'],
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
              name:    'Brand PWRD Media',
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
        name:    'Brand PWRD Media',
        url:     BASE_URL,
      },
    ],
  }
}

// Recursively merges b into a (b wins on conflicts)
function deepMerge(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...a }
  for (const key of Object.keys(b)) {
    if (
      b[key] !== null &&
      typeof b[key] === 'object' &&
      !Array.isArray(b[key]) &&
      typeof a[key] === 'object' &&
      !Array.isArray(a[key])
    ) {
      out[key] = deepMerge(
        a[key] as Record<string, unknown>,
        b[key] as Record<string, unknown>
      )
    } else {
      out[key] = b[key]
    }
  }
  return out
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
  const baseMessages = await getMessages({ locale })

  // Resolve product key from the request host (subdomain routing)
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const productKey = getProductKeyFromHost(host)

  // Merge CMS overrides from Supabase on top of the JSON messages (landing section only)
  let messages = baseMessages
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('site_content')
      .select('content')
      .eq('locale', locale)
      .eq('product_key', productKey)
      .single() as { data: { content: Record<string, unknown> } | null }
    if (data?.content && Object.keys(data.content).length > 0) {
      const c = data.content
      // Support new nested { landing, company } and legacy flat landing blob
      const isNested = 'landing' in c || 'company' in c
      const landingOverrides = isNested
        ? ((c.landing as Record<string, unknown>) ?? {})
        : c
      const companyOverrides = isNested
        ? ((c.company as Record<string, unknown>) ?? {})
        : {}
      messages = {
        ...baseMessages,
        landing: deepMerge(
          baseMessages.landing as Record<string, unknown>,
          landingOverrides
        ),
        ...(Object.keys(companyOverrides).length > 0 ? {
          company: deepMerge(
            baseMessages.company as Record<string, unknown>,
            companyOverrides
          ),
        } : {}),
      }
    }
  } catch {
    // CMS table not yet created or unreachable — fall back to JSON messages silently
  }

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
