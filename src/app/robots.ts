import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

// Dynamic robots.ts — derives the actual host being served at request time.
// Without this, NEXT_PUBLIC_BASE_URL (which points to one domain on Vercel)
// would also drive the sitemap link, sending crawlers on the wrong host to
// the wrong sitemap.
export const dynamic = 'force-dynamic'

function getBaseUrl(): string {
  try {
    const h = headers()
    const host  = h.get('host')
    const proto = h.get('x-forwarded-proto') || 'https'
    if (host) return `${proto}://${host}`
  } catch { /* not available in some build contexts */ }
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'
}

const ALLOW_PATHS = ['/', '/en/', '/nl/', '/fr/', '/mentor/', '/werk/', '/oplossingen/']
const DISALLOW_PATHS = [
  '/admin/',
  '/api/',
  '/arena/',
  '/cx/',
  '/cx_essense/',
  '/energy_profile/',
  '/marketing_scan/',
  '/oncology/',
  '/madaster/',
  '/abbvie/',
  '/manda/',
  '/pulse/',
  '/shop/',
  '/arena-study/',
  '/*/results/',
  '/results/',
]

// Explicit AI-crawler welcomes — research shows LLM crawlers respond more
// reliably to dedicated User-Agent stanzas than to falling through *-rules.
// All get the same allow list as the default rule, with a tighter disallow
// (only blocks admin/api/results — not the various branded scans).
const AI_CRAWLERS = [
  'GPTBot',           // OpenAI training crawler
  'ChatGPT-User',     // OpenAI user-initiated browse (live answers)
  'OAI-SearchBot',    // OpenAI's search index crawler
  'ClaudeBot',        // Anthropic's training crawler
  'anthropic-ai',     // Legacy Anthropic UA (still seen)
  'Claude-User',      // Anthropic user-initiated browse
  'PerplexityBot',    // Perplexity training
  'Perplexity-User',  // Perplexity live answers
  'Google-Extended',  // Google's separate AI/Bard crawler
  'CCBot',            // Common Crawl (feeds many LLMs)
] as const

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = getBaseUrl()
  return {
    rules: [
      // Default — every other bot follows these allow/disallow rules.
      {
        userAgent: '*',
        allow:    ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },
      // Explicit welcomes for AI crawlers. Same allow list. Tighter disallow.
      ...AI_CRAWLERS.map(ua => ({
        userAgent: ua,
        allow:    ALLOW_PATHS,
        disallow: ['/admin/', '/api/', '/results/', '/*/results/'],
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
