import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'
const LOCALES  = ['en', 'nl', 'fr'] as const

// ── Mark de Kock personal pages ───────────────────────────────────────────────
const MENTOR_PAGES = [
  { path: '/mentor',        priority: 1.0, changeFrequency: 'weekly'  as const },
  { path: '/mentor/aanpak', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/mentor/werk',   priority: 0.8, changeFrequency: 'monthly' as const },
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

  return entries
}
