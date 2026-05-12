import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

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

// ── AI-benchmark (standalone, own /lang query toggle, NOT locale-prefixed) ───
const AI_BENCHMARK_PAGES = [
  { path: '/ai_benchmark',           priority: 0.9, changeFrequency: 'weekly' as const }, // landing
  { path: '/ai_benchmark/dashboard', priority: 0.9, changeFrequency: 'weekly' as const }, // public dashboard
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // AI-benchmark — standalone product, internal lang toggle (no locale prefix)
  for (const { path, priority, changeFrequency } of AI_BENCHMARK_PAGES) {
    entries.push({
      url:             `${BASE_URL}${path}`,
      lastModified:    new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: {
          'nl':        `${BASE_URL}${path}?lang=nl`,
          'en':        `${BASE_URL}${path}?lang=en`,
          'fr':        `${BASE_URL}${path}?lang=fr`,
          'de':        `${BASE_URL}${path}?lang=de`,
          'x-default': `${BASE_URL}${path}?lang=nl`,
        },
      },
    })
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

  // ── Blog index (NL/EN/DE) ───────────────────────────────────────────────
  entries.push({
    url:             `${BASE_URL}/blog`,
    lastModified:    new Date(),
    changeFrequency: 'weekly',
    priority:        0.9,
    alternates: {
      languages: {
        nl:          `${BASE_URL}/blog`,
        en:          `${BASE_URL}/blog?lang=en`,
        de:          `${BASE_URL}/blog?lang=de`,
        'x-default': `${BASE_URL}/blog`,
      },
    },
  })

  // ── Blog posts ──────────────────────────────────────────────────────────
  // Pull every published post + its translations, group by translation graph,
  // and emit one sitemap entry per locale variant with hreflang alternates.
  try {
    const blogEntries = await fetchBlogSitemapEntries()
    entries.push(...blogEntries)
  } catch {
    // Sitemap should not 500 if Supabase is unreachable — skip blog entries.
  }

  return entries
}

// ── Blog ────────────────────────────────────────────────────────────────────
interface BlogSitemapRow {
  id:           string
  parent_id:    string | null
  locale:       'nl' | 'en' | 'de'
  slug:         string
  noindex:      boolean
  updated_at:   string
}

async function fetchBlogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, parent_id, locale, slug, noindex, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(2000)
  if (error || !data) return []

  const rows = data as unknown as BlogSitemapRow[]
  // Group by translation graph (parent_id ?? id)
  const graphs = new Map<string, BlogSitemapRow[]>()
  for (const r of rows) {
    if (r.noindex) continue
    const root = r.parent_id ?? r.id
    if (!graphs.has(root)) graphs.set(root, [])
    graphs.get(root)!.push(r)
  }

  const out: MetadataRoute.Sitemap = []
  for (const group of Array.from(graphs.values())) {
    // Build hreflang map for this graph
    const langMap: Record<string, string> = {}
    for (const r of group) {
      langMap[r.locale] = r.locale === 'nl'
        ? `${BASE_URL}/blog/${r.slug}`
        : `${BASE_URL}/blog/${r.slug}?lang=${r.locale}`
    }
    if (!langMap['x-default']) {
      langMap['x-default'] = langMap['nl'] ?? Object.values(langMap)[0]
    }

    // One entry per locale variant, sharing the hreflang alternates
    for (const r of group) {
      out.push({
        url:             r.locale === 'nl'
          ? `${BASE_URL}/blog/${r.slug}`
          : `${BASE_URL}/blog/${r.slug}?lang=${r.locale}`,
        lastModified:    new Date(r.updated_at),
        changeFrequency: 'monthly',
        priority:        0.7,
        alternates:      { languages: langMap },
      })
    }
  }
  return out
}
