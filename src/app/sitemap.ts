import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/insights/posts'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'
const LOCALES  = ['en', 'nl', 'fr'] as const

// ── Mark de Kock personal pages ───────────────────────────────────────────────
// Note: /mentor/werk is noindex (canonical is /werk) — use /werk in sitemap
const MENTOR_PAGES = [
  { path: '/mentor',        priority: 1.0, changeFrequency: 'weekly'  as const },
  { path: '/mentor/aanpak', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/werk',          priority: 0.8, changeFrequency: 'monthly' as const },
]

// ── AI assessment public pages (locale-prefixed) ──────────────────────────────
const ASSESSMENT_PATHS = [
  { path: '',         priority: 0.7, changeFrequency: 'weekly'  as const }, // homepage
  { path: '/a',       priority: 0.6, changeFrequency: 'monthly' as const }, // lite assessment
  { path: '/a/extended', priority: 0.6, changeFrequency: 'monthly' as const }, // full assessment
]

// ── Legal / utility ───────────────────────────────────────────────────────────
const UTILITY_PAGES = [
  { path: '/privacy',     priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/voorwaarden', priority: 0.3, changeFrequency: 'yearly' as const },
]

// ── The Crew (markdekock.com — AI Marketing & Sales Command Center) ──────────
// Static HTML under /public/thecrew; each page has an EN↔NL pair.
const THECREW_PAGES: Array<{ en: string; nl: string; priority: number; changeFrequency: 'weekly' | 'monthly' }> = [
  { en: '/thecrew/en/',                           nl: '/thecrew/nl/',                           priority: 0.8, changeFrequency: 'monthly' },
  { en: '/thecrew/en/pitch-standalone.html',      nl: '/thecrew/nl/pitch-standalone.html',      priority: 0.6, changeFrequency: 'monthly' },
  { en: '/thecrew/en/concept-companion.html',     nl: '/thecrew/nl/concept-companion.html',     priority: 0.6, changeFrequency: 'monthly' },
  { en: '/thecrew/en/agency-poc-mapping.html',    nl: '/thecrew/nl/agency-poc-mapping.html',    priority: 0.5, changeFrequency: 'monthly' },
  { en: '/thecrew/en/commercial-term-sheet.html', nl: '/thecrew/nl/commercial-term-sheet.html', priority: 0.5, changeFrequency: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  // Mentor pages — no locale prefix, high priority
  for (const { path, priority, changeFrequency } of MENTOR_PAGES) {
    entries.push({
      url:             `${BASE_URL}${path}`,
      lastModified:    new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: {
          'nl': `${BASE_URL}${path}?lang=nl`,
          'en': `${BASE_URL}${path}?lang=en`,
          'de': `${BASE_URL}${path}?lang=de`,
        },
      },
    })
  }

  // Locale-prefixed assessment pages
  for (const locale of LOCALES) {
    for (const { path, priority, changeFrequency } of ASSESSMENT_PATHS) {
      entries.push({
        url:             `${BASE_URL}/${locale}${path}`,
        lastModified:    new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map(l => [l, `${BASE_URL}/${l}${path}`])
          ),
        },
      })
    }
  }

  // Utility pages
  for (const { path, priority, changeFrequency } of UTILITY_PAGES) {
    entries.push({
      url:             `${BASE_URL}${path}`,
      lastModified:    new Date(),
      changeFrequency,
      priority,
    })
  }

  // The Crew — each page listed once per locale, with hreflang pairing
  for (const page of THECREW_PAGES) {
    for (const lang of ['en', 'nl'] as const) {
      entries.push({
        url:             `${BASE_URL}${page[lang]}`,
        lastModified:    new Date(),
        changeFrequency: page.changeFrequency,
        priority:        page.priority,
        alternates: {
          languages: {
            en:          `${BASE_URL}${page.en}`,
            nl:          `${BASE_URL}${page.nl}`,
            'x-default': `${BASE_URL}${page.en}`,
          },
        },
      })
    }
  }

  // The Crew picker (language chooser at /thecrew/)
  entries.push({
    url:             `${BASE_URL}/thecrew/`,
    lastModified:    new Date(),
    changeFrequency: 'monthly',
    priority:        0.7,
  })

  // The Crew — NL-only article (essay by Mark de Kock)
  entries.push({
    url:             `${BASE_URL}/thecrew/nl/artikel.html`,
    lastModified:    new Date(),
    changeFrequency: 'yearly',
    priority:        0.5,
  })

  // ── Insights (blog) ─────────────────────────────────────────────────────────
  entries.push({
    url:             `${BASE_URL}/insights`,
    lastModified:    new Date(),
    changeFrequency: 'weekly',
    priority:        0.9,
    alternates: {
      languages: {
        nl:          `${BASE_URL}/insights`,
        en:          `${BASE_URL}/insights?lang=en`,
        'x-default': `${BASE_URL}/insights`,
      },
    },
  })

  for (const post of getAllPosts()) {
    const url = `${BASE_URL}/insights/${post.slug}${post.locale === 'en' ? '?lang=en' : ''}`
    const altLanguages: Record<string, string> = {}
    if (post.locale === 'nl') altLanguages.nl = url
    if (post.locale === 'en') altLanguages.en = url
    if (post.translation) {
      const altUrl = `${BASE_URL}/insights/${post.translation.slug}${post.translation.locale === 'en' ? '?lang=en' : ''}`
      altLanguages[post.translation.locale] = altUrl
    }
    altLanguages['x-default'] = altLanguages.nl ?? altLanguages.en ?? url

    entries.push({
      url,
      lastModified:    new Date(post.updated ?? post.published),
      changeFrequency: 'monthly',
      priority:        0.7,
      alternates: { languages: altLanguages },
    })
  }

  return entries
}
