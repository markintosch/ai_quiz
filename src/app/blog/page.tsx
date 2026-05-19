// FILE: src/app/blog/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Public /blog index — magazine-stijl.
//
// Layout:
//   1. Header + locale switcher
//   2. Hero (intro)
//   3. Filter tabs (Alles / Essays / Updates) — bepaalt welke posts in beeld
//   4. FEATURED — laatste post volledig leesbaar (cover, body via RenderTiptap)
//      met "Lees op eigen pagina →" deeplink (canonical blijft /blog/[slug])
//   5. EARLIER POSTS — grid met cards van oudere posts
//   6. Subscribe form
//
// SEO: per-locale title/description, hreflang, ItemList JSON-LD.
// Geen Article JSON-LD op /blog — die hoort bij de canonical /blog/[slug] page.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { pickLang, STRINGS, formatDate, type Lang } from '@/lib/blog/strings'
import type { BlogPostRow, BlogFormat } from '@/types/blog'
import SubscribeForm from '@/components/blog/SubscribeForm'
import { BlogCover } from '@/components/blog/BlogCover'
import { RenderTiptap } from '@/lib/blog/renderTiptap'
import { pickOgImage } from '@/lib/blog/cover'

export const dynamic = 'force-dynamic'

const BASE = 'https://markdekock.com'

// ── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata(
  props: {
    searchParams: Promise<{ lang?: string }>
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const lang = pickLang(searchParams.lang)
  const s    = STRINGS[lang]
  const canonical = lang === 'nl' ? `${BASE}/blog` : `${BASE}/blog?lang=${lang}`

  // og:image — kies de cover van de laatste post (afbeelding of poster van een
  // video). Als die er niet is, fallback naar Mark's portret. Zorgt voor een
  // visuele preview in LinkedIn / WhatsApp / Slack / Twitter.
  const latest    = await fetchLatestPostForOgImage(lang)
  const dynamicOg = latest ? pickOgImage(latest.cover_image, latest.cover_poster) : null
  const ogImage   = dynamicOg ?? `${BASE}/markdekock_2026.png`

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
      images:      [{ url: ogImage, alt: latest?.title ?? 'Mark de Kock — Blog' }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       s.metaTitle,
      description: s.metaDescription,
      images:      [ogImage],
    },
  }
}

/** Slim lookup voor og:image — alleen cover-velden ophalen, niet de hele content. */
async function fetchLatestPostForOgImage(lang: Lang): Promise<
  { title: string; cover_image: string | null; cover_poster: string | null } | null
> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('title, cover_image, cover_poster')
    .eq('status', 'published')
    .eq('locale', lang)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as { title: string; cover_image: string | null; cover_poster: string | null } | null) ?? null
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function BlogIndexPage(
  props: {
    searchParams: Promise<{ lang?: string; format?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const lang = pickLang(searchParams.lang)
  const s    = STRINGS[lang]

  const posts = await fetchPublishedPosts(lang)
  const filterFormat: BlogFormat | 'all' =
    searchParams.format === 'article' || searchParams.format === 'update'
      ? searchParams.format
      : 'all'
  const filtered = filterFormat === 'all' ? posts : posts.filter((p) => p.format === filterFormat)

  // Magazine split: latest is featured (full body), rest goes in the grid below.
  const featured = filtered[0]
  const older    = filtered.slice(1)

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
          <Link
            href={lang === 'nl' ? '/mentor' : `/mentor?lang=${lang}`}
            className="text-sm font-medium text-gray-700 hover:text-brand"
          >
            {s.homeLink}
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

      {/* ── Filter tabs (alleen tonen als er meer dan 1 post is) ── */}
      {filtered.length > 1 && (
        <nav className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-5xl gap-6 px-6 py-4 text-sm">
            <FilterTab href={tabUrl(lang, 'all')}      active={filterFormat === 'all'}>{s.filterAll}</FilterTab>
            <FilterTab href={tabUrl(lang, 'article')}  active={filterFormat === 'article'}>{s.filterArticles}</FilterTab>
            <FilterTab href={tabUrl(lang, 'update')}   active={filterFormat === 'update'}>{s.filterUpdates}</FilterTab>
          </div>
        </nav>
      )}

      {/* ── No posts ─────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="text-gray-600">{s.noPostsYet}</p>
        </section>
      )}

      {/* ── Featured (latest, volledig leesbaar) ─────────────── */}
      {featured && (
        <section className="mx-auto max-w-3xl px-6 pt-12 pb-8">
          {/* Latest-post badge + deep link to canonical */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-accent">
              {s.latestPost}
            </span>
            <Link
              href={postUrl(featured, lang, /*relative*/ true)}
              className="text-xs font-medium text-brand-accent hover:underline"
              title={s.openInOwnPage}
            >
              {s.openInOwnPage}
            </Link>
          </div>

          <article>
            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
              <span className={featured.format === 'update'
                ? 'rounded-full bg-brand-gold/15 px-2.5 py-0.5 font-medium text-brand-dark'
                : 'rounded-full bg-brand/10 px-2.5 py-0.5 font-medium text-brand'
              }>
                {featured.format === 'update' ? s.filterUpdates : s.filterArticles}
              </span>
              {featured.published_at && (
                <span className="text-gray-600">{formatDate(featured.published_at, lang)}</span>
              )}
              {featured.reading_minutes && (
                <span className="text-gray-600">· {s.readingMinutes(featured.reading_minutes)}</span>
              )}
              <span className="text-gray-600">· {s.byAuthor} {featured.author_name}</span>
            </div>

            <h2 className="mb-5 text-3xl font-bold leading-tight text-brand md:text-4xl">
              <Link href={postUrl(featured, lang, true)} className="hover:underline">
                {featured.title}
              </Link>
            </h2>

            {featured.excerpt && (
              <p className="mb-7 text-lg leading-relaxed text-gray-700">{featured.excerpt}</p>
            )}

            {featured.cover_image && (
              <div className="mb-8 overflow-hidden rounded-md border border-gray-200">
                <BlogCover
                  src={featured.cover_image}
                  alt={featured.cover_alt}
                  poster={featured.cover_poster}
                />
              </div>
            )}

            <div className="prose-blog">
              <RenderTiptap doc={featured.content} />
            </div>

            {featured.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-gray-100 pt-5">
                {featured.tags.map((t) => (
                  <span key={t} className="rounded bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom-of-article deep link (ook handig voor delen) */}
            <div className="mt-6 text-center">
              <Link
                href={postUrl(featured, lang, true)}
                className="inline-block text-sm font-medium text-brand-accent hover:underline"
              >
                {s.openInOwnPage}
              </Link>
            </div>
          </article>
        </section>
      )}

      {/* ── Earlier posts grid ───────────────────────────────── */}
      {older.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <h2 className="mb-6 text-xl font-semibold text-brand">{s.earlierPosts}</h2>
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {older.map((p) => (
                <PostCard key={p.id} post={p} lang={lang} />
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Subscribe ───────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-14">
          <SubscribeForm lang={lang} sourcePath="/blog" />
        </div>
      </section>

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
          <div className="overflow-hidden rounded-t-lg">
            <BlogCover
              src={post.cover_image}
              alt={post.cover_alt}
              poster={post.cover_poster}
              aspect="16/9"
            />
          </div>
        )}
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2 text-xs">
            <span className={post.format === 'update'
              ? 'rounded-full bg-brand-gold/15 px-2 py-0.5 font-medium text-brand-dark'
              : 'rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand'
            }>
              {post.format === 'update' ? s.filterUpdates : s.filterArticles}
            </span>
            {post.published_at && (
              <span className="text-gray-600">{formatDate(post.published_at, lang)}</span>
            )}
          </div>
          <h3 className="mb-1.5 text-base font-bold leading-tight text-brand">{post.title}</h3>
          {post.excerpt && (
            <p className="line-clamp-3 text-sm leading-relaxed text-gray-700">{post.excerpt}</p>
          )}
          {post.reading_minutes && (
            <p className="mt-3 text-xs text-gray-600">{s.readingMinutes(post.reading_minutes)}</p>
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
