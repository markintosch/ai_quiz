// FILE: src/app/blog/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Public /blog index — list of published posts in the requested locale.
// URL pattern matches /mentor: NL is the default at /blog, EN/DE via ?lang=
// query string. Card layout supports both 'article' (long-form) and 'update'
// (short news) formats with a small badge.
//
// SEO: per-locale title/description, hreflang for the three locales, JSON-LD
// ItemList of the visible posts so AI crawlers can summarise the feed.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { pickLang, STRINGS, formatDate, type Lang } from '@/lib/blog/strings'
import type { BlogPostRow, BlogFormat } from '@/types/blog'

export const dynamic = 'force-dynamic'                  // always read latest from DB

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'

// ── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const lang = pickLang(searchParams.lang)
  const s    = STRINGS[lang]
  const canonical = lang === 'nl' ? `${BASE}/blog` : `${BASE}/blog?lang=${lang}`

  return {
    title:       s.metaTitle,
    description: s.metaDescription,
    alternates: {
      canonical,
      languages: {
        nl:          `${BASE}/blog`,
        en:          `${BASE}/blog?lang=en`,
        de:          `${BASE}/blog?lang=de`,
        'x-default': `${BASE}/blog`,
      },
    },
    openGraph: {
      title:       s.metaTitle,
      description: s.metaDescription,
      url:         canonical,
      siteName:    'Mark de Kock — Brand PWRD Media',
      locale:      s.ogLocale,
      type:        'website',
    },
    twitter: {
      card:        'summary_large_image',
      title:       s.metaTitle,
      description: s.metaDescription,
    },
  }
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { lang?: string; format?: string }
}) {
  const lang = pickLang(searchParams.lang)
  const s    = STRINGS[lang]

  const posts = await fetchPublishedPosts(lang)
  const filterFormat: BlogFormat | 'all' =
    searchParams.format === 'article' || searchParams.format === 'update'
      ? searchParams.format
      : 'all'
  const filtered = filterFormat === 'all' ? posts : posts.filter((p) => p.format === filterFormat)

  // ── JSON-LD ItemList for AI crawlers / GEO ─────────────────────────────
  const itemListJsonLd = {
    '@context':       'https://schema.org',
    '@type':          'ItemList',
    name:             s.metaTitle,
    itemListElement:  filtered.slice(0, 20).map((p, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      url:        postUrl(p, lang),
      name:       p.title,
      description: p.excerpt ?? '',
    })),
  }

  return (
    <main className="min-h-screen bg-white">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href={lang === 'nl' ? '/' : `/?lang=${lang}`} className="text-sm font-medium text-gray-700 hover:text-brand">
            ← Mark de Kock
          </Link>
          <LanguagePicker lang={lang} format={filterFormat} />
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-brand md:text-5xl">{s.pageTitle}</h1>
          <p className="text-lg leading-relaxed text-gray-600">{s.pageIntro}</p>
        </div>
      </section>

      {/* ── Filter tabs ──────────────────────────────────────── */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl gap-6 px-6 py-4 text-sm">
          <FilterTab href={tabUrl(lang, 'all')}      active={filterFormat === 'all'}>{s.filterAll}</FilterTab>
          <FilterTab href={tabUrl(lang, 'article')}  active={filterFormat === 'article'}>{s.filterArticles}</FilterTab>
          <FilterTab href={tabUrl(lang, 'update')}   active={filterFormat === 'update'}>{s.filterUpdates}</FilterTab>
        </div>
      </nav>

      {/* ── Post grid ────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-gray-600">{s.noPostsYet}</p>
        ) : (
          <ul className="grid gap-8 md:grid-cols-2">
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} lang={lang} />
            ))}
          </ul>
        )}
      </section>

      {/* ── Footer CTA ──────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="text-gray-700">
            {s.newsletterCta}{' '}
            <a href="mailto:mark@brandpwrdmedia.com" className="font-medium text-brand-accent underline underline-offset-2">
              mark@brandpwrdmedia.com
            </a>
          </p>
        </div>
      </footer>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </main>
  )
}

// ── Subcomponents ──────────────────────────────────────────────────────────

function PostCard({ post, lang }: { post: BlogPostRow; lang: Lang }) {
  const s = STRINGS[lang]
  return (
    <li>
      <Link
        href={postUrl(post, lang, /*relative*/ true)}
        className="block h-full rounded-lg border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-accent/40 hover:shadow-md"
      >
        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.cover_alt ?? ''}
            className="aspect-[16/9] w-full rounded-t-lg object-cover"
            loading="lazy"
          />
        )}
        <div className="p-6">
          <div className="mb-2 flex items-center gap-3 text-xs">
            <span className={post.format === 'update'
              ? 'rounded-full bg-brand-gold/15 px-2.5 py-0.5 font-medium text-brand-dark'
              : 'rounded-full bg-brand/10 px-2.5 py-0.5 font-medium text-brand'
            }>
              {post.format === 'update' ? s.filterUpdates : s.filterArticles}
            </span>
            {post.published_at && (
              <span className="text-gray-600">{formatDate(post.published_at, lang)}</span>
            )}
            {post.reading_minutes && (
              <span className="text-gray-600">· {s.readingMinutes(post.reading_minutes)}</span>
            )}
          </div>
          <h2 className="mb-2 text-xl font-bold leading-tight text-brand">{post.title}</h2>
          {post.excerpt && (
            <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-gray-700">{post.excerpt}</p>
          )}
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 4).map((t) => (
                <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </li>
  )
}

function FilterTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'border-b-2 border-brand-accent pb-2 font-semibold text-brand'
          : 'border-b-2 border-transparent pb-2 text-gray-600 hover:text-brand'
      }
    >
      {children}
    </Link>
  )
}

function LanguagePicker({ lang, format }: { lang: Lang; format: BlogFormat | 'all' }) {
  const formatQs = format === 'all' ? '' : `&format=${format}`
  const formatQsFirst = format === 'all' ? '' : `?format=${format}`
  const links: Array<{ code: Lang; label: string; href: string }> = [
    { code: 'nl', label: 'NL', href: `/blog${formatQsFirst}` },
    { code: 'en', label: 'EN', href: `/blog?lang=en${formatQs}` },
    { code: 'de', label: 'DE', href: `/blog?lang=de${formatQs}` },
  ]
  return (
    <div className="flex gap-1 text-sm">
      {links.map(({ code, label, href }) => (
        <Link
          key={code}
          href={href}
          className={
            code === lang
              ? 'rounded bg-brand px-2.5 py-1 font-semibold text-white'
              : 'rounded px-2.5 py-1 text-gray-600 hover:bg-gray-100 hover:text-brand'
          }
        >
          {label}
        </Link>
      ))}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function tabUrl(lang: Lang, format: 'all' | BlogFormat): string {
  const langQs = lang === 'nl' ? '' : `lang=${lang}`
  const fmtQs  = format === 'all' ? '' : `format=${format}`
  const qs     = [langQs, fmtQs].filter(Boolean).join('&')
  return `/blog${qs ? `?${qs}` : ''}`
}

function postUrl(post: BlogPostRow, lang: Lang, relative = false): string {
  const path = `/blog/${post.slug}`
  const url  = lang === 'nl' ? path : `${path}?lang=${lang}`
  return relative ? url : `${BASE}${url}`
}

async function fetchPublishedPosts(lang: Lang): Promise<BlogPostRow[]> {
  // Service role client — RLS on blog_posts allows public SELECT for status='published',
  // but service role keeps this consistent with /admin and avoids any anon-key surprises.
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('locale', lang)
    .order('published_at', { ascending: false })
    .limit(50)
  if (error || !data) return []
  return data as unknown as BlogPostRow[]
}
