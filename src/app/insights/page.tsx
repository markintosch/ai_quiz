import Link from 'next/link'
import type { Metadata } from 'next'
import { getPostsByLocale, type InsightLocale } from '@/lib/insights/posts'

const BASE = 'https://markdekock.com'

type SearchParams = { lang?: string }

function resolveLocale(lang: string | undefined): InsightLocale {
  return lang === 'en' ? 'en' : 'nl'
}

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<SearchParams> },
): Promise<Metadata> {
  const sp = await searchParams
  const locale = resolveLocale(sp.lang)
  const title = locale === 'en'
    ? 'Insights — AI strategy, execution and leadership | Mark de Kock'
    : 'Insights — AI-strategie, executie en leiderschap | Mark de Kock'
  const description = locale === 'en'
    ? 'Articles for leaders on AI strategy, Shadow AI, governance and execution.'
    : 'Artikelen voor leidinggevenden over AI-strategie, Shadow AI en executie.'
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/insights${locale === 'en' ? '?lang=en' : ''}`,
      languages: {
        nl:         `${BASE}/insights`,
        en:         `${BASE}/insights?lang=en`,
        'x-default': `${BASE}/insights`,
      },
    },
  }
}

const COPY = {
  nl: {
    eyebrow: 'Insights',
    title:   'Artikelen voor leidinggevenden',
    sub:     'Over AI-strategie, Shadow AI, governance en executie. Geen hype, geen tool reviews — alleen wat ik in de praktijk zie werken.',
    read:    'Lees verder →',
    minutes: 'min. lezen',
    back:    '← Terug naar markdekock.com',
    langSwitch: 'Read in English',
    feed:    'RSS-feed',
  },
  en: {
    eyebrow: 'Insights',
    title:   'Writing for leaders',
    sub:     'On AI strategy, Shadow AI, governance and execution. No hype, no tool reviews — only what I see work in practice.',
    read:    'Read more →',
    minutes: 'min read',
    back:    '← Back to markdekock.com',
    langSwitch: 'Lees in het Nederlands',
    feed:    'RSS feed',
  },
} as const

export default async function InsightsIndexPage(
  { searchParams }: { searchParams: Promise<SearchParams> },
) {
  const sp = await searchParams
  const locale = resolveLocale(sp.lang)
  const copy = COPY[locale]
  const posts = getPostsByLocale(locale)

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" }}>
      <nav style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/mentor" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
            {copy.back}
          </Link>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link
              href={locale === 'nl' ? '/insights?lang=en' : '/insights'}
              style={{ fontSize: 13, color: '#1D4ED8', textDecoration: 'none' }}
            >
              {copy.langSwitch}
            </Link>
            <a href="/feed.xml" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
              {copy.feed}
            </a>
          </div>
        </div>
      </nav>

      <header style={{ padding: '64px 24px 32px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D97706', marginBottom: 12 }}>
            {copy.eyebrow}
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, marginBottom: 16 }}>
            {copy.title}
          </h1>
          <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.7 }}>
            {copy.sub}
          </p>
        </div>
      </header>

      <section style={{ padding: '48px 24px 96px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/insights/${post.slug}${locale === 'en' ? '?lang=en' : ''}`}
              style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20,
                padding: '28px 28px 24px', textDecoration: 'none', display: 'block',
                transition: 'transform 0.15s, border-color 0.15s',
              }}
            >
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>
                <time dateTime={post.published}>
                  {new Date(post.published).toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </time>
                {' · '}
                {post.readMinutes} {copy.minutes}
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginBottom: 10 }}>
                {post.title}
              </h2>
              <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.65, marginBottom: 14 }}>
                {post.description}
              </p>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>
                {copy.read}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
