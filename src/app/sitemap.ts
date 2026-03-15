import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aiquiz.kirkandblackbeard.com'
const LOCALES = ['en', 'nl']

// Public pages that should be indexed
const PUBLIC_PATHS = [
  { path: '',         priority: 1.0,  changeFrequency: 'weekly'  as const },
  { path: '/quiz',    priority: 0.9,  changeFrequency: 'monthly' as const },
  { path: '/quiz/extended', priority: 0.8, changeFrequency: 'monthly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    for (const { path, priority, changeFrequency } of PUBLIC_PATHS) {
      entries.push({
        url:              `${BASE_URL}/${locale}${path}`,
        lastModified:     new Date(),
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

  return entries
}
