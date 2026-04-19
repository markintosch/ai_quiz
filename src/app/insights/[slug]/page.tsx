import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllSlugs, getPost, type InsightLocale } from '@/lib/insights/posts'
import {
  buildBreadcrumbSchema,
  buildPersonSchema,
  serializeJsonLd,
} from '@/lib/seo/structured-data'

const BASE = 'https://markdekock.com'

type Params       = { slug: string }
type SearchParams = { lang?: string }

function resolveLocale(lang: string | undefined, fallback: InsightLocale): InsightLocale {
  if (lang === 'en') return 'en'
  if (lang === 'nl') return 'nl'
  return fallback
}

export function generateStaticParams() {
  return getAllSlugs().map(({ slug }) => ({ slug }))
}

export async function generateMetadata(
  { params, searchParams }: { params: Promise<Params>; searchParams: Promise<SearchParams> },
): Promise<Metadata> {
  const { slug } = await params
  const sp       = await searchParams

  // try to find post by slug in either locale; slugs are unique per locale
  const nlHit = getPost('nl', slug)
  const enHit = getPost('en', slug)
  const post  = nlHit ?? enHit
  if (!post) return { title: 'Not found' }

  const locale = resolveLocale(sp.lang, post.locale)
  const active = getPost(locale, slug) ?? post
  const url    = `${BASE}/insights/${active.slug}${active.locale === 'en' ? '?lang=en' : ''}`

  return {
    title:       `${active.title} | Mark de Kock`,
    description: active.description,
    keywords:    active.keywords,
    alternates: {
      canonical: url,
      languages: {
        nl: active.translation?.locale === 'nl'
          ? `${BASE}/insights/${active.translation.slug}`
          : active.locale === 'nl' ? `${BASE}/insights/${active.slug}` : undefined,
        en: active.translation?.locale === 'en'
          ? `${BASE}/insights/${active.translation.slug}?lang=en`
          : active.locale === 'en' ? `${BASE}/insights/${active.slug}?lang=en` : undefined,
        'x-default': `${BASE}/insights/${active.slug}`,
      } as Record<string, string | undefined>,
    },
    openGraph: {
      title:       active.title,
      description: active.description,
      url,
      type:        'article',
      siteName:    'Mark de Kock',
      locale:      active.locale === 'en' ? 'en_GB' : 'nl_NL',
      publishedTime: active.published,
      modifiedTime:  active.updated ?? active.published,
      authors:       ['Mark de Kock'],
    },
    twitter: {
      card: 'summary_large_image',
      title: active.title,
      description: active.description,
    },
    authors: [{ name: 'Mark de Kock', url: BASE }],
  }
}

const COPY = {
  nl: {
    back: '← Alle artikelen',
    home: '← markdekock.com',
    minutes: 'min. lezen',
    share: 'Deel dit artikel',
    shareLinkedIn: 'Deel op LinkedIn',
    shareX:        'Deel op X',
    shareCopy:     'Kopieer link',
    ctaTitle:      'Herken je dit?',
    ctaBody:       'Als dit op jouw situatie lijkt, is een gratis intakegesprek het logische startpunt. Een half uur, geen verplichting.',
    ctaLink:       'Plan een intakegesprek →',
    relatedTitle:  'Meer lezen',
  },
  en: {
    back: '← All articles',
    home: '← markdekock.com',
    minutes: 'min read',
    share: 'Share this article',
    shareLinkedIn: 'Share on LinkedIn',
    shareX:        'Share on X',
    shareCopy:     'Copy link',
    ctaTitle:      'Does this sound familiar?',
    ctaBody:       'If this looks like your situation, a free intake call is the logical next step. Thirty minutes, no commitment.',
    ctaLink:       'Book an intake →',
    relatedTitle:  'Read more',
  },
} as const

const CALENDLY_INTAKE = 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

export default async function InsightPage(
  { params, searchParams }: { params: Promise<Params>; searchParams: Promise<SearchParams> },
) {
  const { slug } = await params
  const sp       = await searchParams

  const nlHit = getPost('nl', slug)
  const enHit = getPost('en', slug)
  const base  = nlHit ?? enHit
  if (!base) notFound()

  const locale = resolveLocale(sp.lang, base.locale)
  const post   = getPost(locale, slug) ?? base
  const copy   = COPY[post.locale]

  const canonicalUrl = `${BASE}/insights/${post.slug}${post.locale === 'en' ? '?lang=en' : ''}`

  const articleJsonLd = JSON.stringify({
    '@context':     'https://schema.org',
    '@type':        'Article',
    headline:       post.title,
    description:    post.description,
    datePublished:  post.published,
    dateModified:   post.updated ?? post.published,
    inLanguage:     post.locale === 'en' ? 'en' : 'nl',
    url:            canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    author: {
      '@type': 'Person',
      name:    'Mark de Kock',
      url:     BASE,
    },
    publisher: {
      '@type': 'Organization',
      name:    'Mark de Kock',
      url:     BASE,
    },
    keywords: post.keywords.join(', '),
  })

  const supportingJsonLd = serializeJsonLd([
    buildBreadcrumbSchema([
      { name: 'Mark de Kock', url: `${BASE}/mentor` },
      { name: 'Insights',     url: `${BASE}/insights` },
      { name: post.title,     url: canonicalUrl },
    ]),
    buildPersonSchema({
      name:        'Mark de Kock',
      url:         BASE,
      jobTitle:    'Strategisch mentor voor AI & executie',
      description: 'Senior operator en partner bij Kirk & Blackbeard.',
      orgName:     'Kirk & Blackbeard',
      orgUrl:      'https://kirkandblackbeard.com',
      country:     'NL',
      linkedin:    'https://www.linkedin.com/in/markdekock/',
    }),
  ])

  const shareText = encodeURIComponent(post.title)
  const shareUrl  = encodeURIComponent(canonicalUrl)

  const related = getPost(post.locale === 'nl' ? 'nl' : 'en', post.slug === 'shadow-ai-in-organisaties' ? 'ai-strategie-voor-leiders' : post.slug === 'shadow-ai-in-organisations' ? 'ai-strategy-for-leaders' : post.locale === 'nl' ? 'shadow-ai-in-organisaties' : 'shadow-ai-in-organisations')

  return (
    <main style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: supportingJsonLd }} />

      <nav style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href={`/insights${post.locale === 'en' ? '?lang=en' : ''}`} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
            {copy.back}
          </Link>
          <Link href="/mentor" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
            {copy.home}
          </Link>
        </div>
      </nav>

      <article style={{ padding: '48px 24px 64px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
            <time dateTime={post.published}>
              {new Date(post.published).toLocaleDateString(post.locale === 'nl' ? 'nl-NL' : 'en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </time>
            {' · '}
            {post.readMinutes} {copy.minutes}
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.2, marginBottom: 16 }}>
            {post.title}
          </h1>
          <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.6, marginBottom: 40, fontStyle: 'italic' }}>
            {post.description}
          </p>

          {post.body.map((block, i) => {
            if (block.type === 'p') {
              return <p key={i} style={{ fontSize: 17, lineHeight: 1.75, color: '#1F2937', marginBottom: 20 }}>{block.text}</p>
            }
            if (block.type === 'h2') {
              return <h2 key={i} style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginTop: 36, marginBottom: 14, lineHeight: 1.3 }}>{block.text}</h2>
            }
            if (block.type === 'h3') {
              return <h3 key={i} style={{ fontSize: 19, fontWeight: 700, color: '#0F172A', marginTop: 28, marginBottom: 10 }}>{block.text}</h3>
            }
            if (block.type === 'ul') {
              return (
                <ul key={i} style={{ marginBottom: 20, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {block.items.map((it, j) => (
                    <li key={j} style={{ fontSize: 17, lineHeight: 1.7, color: '#1F2937' }}>{it}</li>
                  ))}
                </ul>
              )
            }
            if (block.type === 'quote') {
              return (
                <blockquote key={i} style={{
                  borderLeft: '3px solid #D97706', paddingLeft: 20, margin: '32px 0',
                  fontSize: 20, lineHeight: 1.55, fontStyle: 'italic', color: '#0F172A', fontWeight: 500,
                }}>
                  &ldquo;{block.text}&rdquo;
                  {block.attribution && <footer style={{ fontSize: 14, color: '#64748B', marginTop: 8, fontStyle: 'normal' }}>— {block.attribution}</footer>}
                </blockquote>
              )
            }
            return null
          })}

          {/* Share */}
          <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 48, paddingTop: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 14 }}>
              {copy.share}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, fontWeight: 600, padding: '10px 18px', borderRadius: 100, border: '1px solid #E2E8F0', textDecoration: 'none', color: '#0F172A', background: '#F8FAFC' }}
              >
                {copy.shareLinkedIn}
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, fontWeight: 600, padding: '10px 18px', borderRadius: 100, border: '1px solid #E2E8F0', textDecoration: 'none', color: '#0F172A', background: '#F8FAFC' }}
              >
                {copy.shareX}
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* CTA block */}
      <section style={{ background: '#0F172A', padding: '64px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF', marginBottom: 14 }}>
            {copy.ctaTitle}
          </h2>
          <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, marginBottom: 28 }}>
            {copy.ctaBody}
          </p>
          <a
            href={CALENDLY_INTAKE}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#D97706', color: '#FFFFFF',
              padding: '14px 32px', borderRadius: 100,
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 12px 32px rgba(217,119,6,0.35)',
            }}
          >
            {copy.ctaLink}
          </a>
        </div>
      </section>

      {related && related.slug !== post.slug && (
        <section style={{ padding: '56px 24px', background: '#F8FAFC' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 16 }}>
              {copy.relatedTitle}
            </p>
            <Link
              href={`/insights/${related.slug}${related.locale === 'en' ? '?lang=en' : ''}`}
              style={{ display: 'block', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '24px 28px', textDecoration: 'none' }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>{related.title}</h3>
              <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{related.description}</p>
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
