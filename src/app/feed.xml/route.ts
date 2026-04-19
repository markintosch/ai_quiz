import { getAllPosts } from '@/lib/insights/posts'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const posts = getAllPosts()
  const lastBuild = new Date(posts[0]?.published ?? Date.now()).toUTCString()

  const items = posts.map(post => {
    const url = `${BASE}/insights/${post.slug}${post.locale === 'en' ? '?lang=en' : ''}`
    const pubDate = new Date(post.published).toUTCString()
    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>Mark de Kock</dc:creator>
      <language>${post.locale === 'en' ? 'en' : 'nl'}</language>
      ${post.keywords.map(k => `<category>${escapeXml(k)}</category>`).join('\n      ')}
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mark de Kock — Insights</title>
    <link>${BASE}/insights</link>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>AI-strategie, executie en leiderschap — voor leidinggevenden die ambitie willen vertalen naar iets wat werkt.</description>
    <language>nl-NL</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>markdekock.com</generator>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type':  'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
