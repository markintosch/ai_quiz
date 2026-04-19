import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/en/', '/nl/', '/fr/', '/mentor/', '/werk/', '/insights/', '/thecrew/', '/feed.xml'],
        disallow: [
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
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
