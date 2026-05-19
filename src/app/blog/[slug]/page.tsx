// FILE: src/app/blog/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Public blog post detail page.
//
// SEO/GEO:
// - Article JSON-LD with author, datePublished, dateModified, articleBody.
// - hreflang alternates pointing to translated versions when present.
// - Canonical URL per locale (NL = bare path, EN/DE = ?lang=).
// - meta_title / meta_description override fields.
// - noindex flag respected.
//
// 404 logic: if a slug exists in another locale (translation graph), suggest
// the translation in the language switcher rather than hard-404.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { pickLang, STRINGS, formatDate, type Lang } from '@/lib/blog/strings'
import { RenderTiptap, tiptapToPlainText } from '@/lib/blog/renderTiptap'
import type { BlogPostRow } from '@/types/blog'
import SubscribeForm from '@/components/blog/SubscribeForm'
import SocialShare    from '@/components/blog/SocialShare'
import CommentsList   from '@/components/blog/CommentsList'
import CommentForm    from '@/components/blog/CommentForm'
import { BlogCover } from '@/components/blog/BlogCover'
import { pickOgImage } from '@/lib/blog/cover'

export const dynamic = 'force-dynamic'

const BASE = 'https://markdekock.com'

// ── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ lang?: string }>
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const lang = pickLang(searchParams.lang)
  const post = await fetchPostBySlug(params.slug, lang)

  if (!post) {
    return {
      title:       'Niet gevonden | Mark de Kock',
      description: 'Deze blogpost bestaat niet of is verplaatst.',
      robots:      { index: false, follow: false },
    }
  }

  const translations = post.parent_id
    ? await fetchTranslationsByParent(post.parent_id)                  // we are a translation
    : await fetchTranslationsByParent(post.id)                         // we are the source

  const description = (post.meta_description ?? post.excerpt ?? tiptapToPlainText(post.content, 280)).slice(0, 320)
  const title       = post.meta_title ?? post.title
  const path        = `/blog/${post.slug}`
  const canonical   = post.locale === 'nl' ? `${BASE}${path}` : `${BASE}${path}?lang=${post.locale}`
  const s           = STRINGS[lang]

  // hreflang map — include this post's locale + every translation we have
  const languages: Record<string, string> = {
    [post.locale]: canonical,
  }
  for (const t of translations) {
    if (t.id === post.id) continue
    const tPath = `/blog/${t.slug}`
    languages[t.locale] = t.locale === 'nl' ? `${BASE}${tPath}` : `${BASE}${tPath}?lang=${t.locale}`
  }
  if (!languages['x-default']) {
    // Default to NL if a NL version exists, otherwise the post itself.
    const nl = translations.find((t) => t.locale === 'nl')
    languages['x-default'] = nl ? `${BASE}/blog/${nl.slug}` : canonical
  }

  return {
    title:       title,
    description,
    alternates: {
      canonical,
      languages,
    },
    robots: post.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type:        'article',
      title,
      description,
      url:         canonical,
      siteName:    'Mark de Kock — Brand PWRD Media',
      locale:      s.ogLocale,
      // Social previews kunnen geen video tonen — kies cover_image (als die een
      // afbeelding is) of cover_poster als fallback. Anders geen og:image.
      images:      (() => {
        const og = pickOgImage(post.cover_image, post.cover_poster)
        return og ? [{ url: og, alt: post.cover_alt ?? title }] : undefined
      })(),
      publishedTime:  post.published_at ?? undefined,
      modifiedTime:   post.updated_at,
      authors:        [post.author_name],
      tags:           post.tags,
    },
    twitter: {
      card:        pickOgImage(post.cover_image, post.cover_poster) ? 'summary_large_image' : 'summary',
      title,
      description,
      images:      (() => {
        const og = pickOgImage(post.cover_image, post.cover_poster)
        return og ? [og] : undefined
      })(),
    },
  }
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function BlogPostPage(
  props: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ lang?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const lang = pickLang(searchParams.lang)
  const post = await fetchPostBySlug(params.slug, lang)

  if (!post) notFound()

  const translations = post.parent_id
    ? await fetchTranslationsByParent(post.parent_id)
    : await fetchTranslationsByParent(post.id)

  const s = STRINGS[lang]

  // ── JSON-LD Article — what AI crawlers / Google use to summarise ─────
  const articleJsonLd = {
    '@context':       'https://schema.org',
    '@type':          'Article',
    headline:         post.title,
    description:      post.meta_description ?? post.excerpt ?? '',
    image:            (() => {
      const og = pickOgImage(post.cover_image, post.cover_poster)
      return og ? [og] : undefined
    })(),
    datePublished:    post.published_at,
    dateModified:     post.updated_at,
    author: {
      '@type': 'Person',
      name:    post.author_name,
      url:     `${BASE}/mentor`,
    },
    publisher: {
      '@type': 'Organization',
      name:    'Brand PWRD Media',
      url:     BASE,
    },
    inLanguage:       post.locale,
    keywords:         post.tags.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id':   post.locale === 'nl' ? `${BASE}/blog/${post.slug}` : `${BASE}/blog/${post.slug}?lang=${post.locale}`,
    },
  }

  return (
    <main className="min-h-screen bg-white">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link
            href={lang === 'nl' ? '/blog' : `/blog?lang=${lang}`}
            className="text-sm font-medium text-gray-700 hover:text-brand"
          >
            {s.backToBlog}
          </Link>
          {translations.length > 1 && (
            <div className="flex gap-1 text-sm">
              {translations
                .sort((a, b) => a.locale.localeCompare(b.locale))
                .map((t) => (
                  <Link
                    key={t.id}
                    href={t.locale === 'nl' ? `/blog/${t.slug}` : `/blog/${t.slug}?lang=${t.locale}`}
                    className={
                      t.locale === post.locale
                        ? 'rounded bg-brand px-2.5 py-1 font-semibold text-white'
                        : 'rounded px-2.5 py-1 text-gray-600 hover:bg-gray-100 hover:text-brand'
                    }
                  >
                    {t.locale.toUpperCase()}
                  </Link>
                ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Article ─────────────────────────────────────────── */}
      <article className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
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
          <span className="text-gray-600">· {s.byAuthor} {post.author_name}</span>
        </div>

        <h1 className="mb-6 text-4xl font-bold leading-tight text-brand md:text-5xl">{post.title}</h1>

        {post.excerpt && (
          <p className="mb-8 text-xl leading-relaxed text-gray-700">{post.excerpt}</p>
        )}

        {post.cover_image && (
          <div className="mb-10 overflow-hidden rounded-md border border-gray-200">
            <BlogCover
              src={post.cover_image}
              alt={post.cover_alt}
              poster={post.cover_poster}
            />
          </div>
        )}

        {/* ── Body — server-rendered Tiptap JSON ──────────── */}
        <div className="prose-blog">
          <RenderTiptap doc={post.content} />
        </div>

        {/* ── Tags ────────────────────────────────────────── */}
        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Social share — onder de body, voor de comments ─
             Blog leeft altijd onder markdekock.com (canonical merknaam),
             ook al draait de Next-app op een andere host. */}
        <div className="mt-8">
          <SocialShare
            url={post.locale === 'nl'
              ? `https://markdekock.com/blog/${post.slug}`
              : `https://markdekock.com/blog/${post.slug}?lang=${post.locale}`}
            title={post.title}
            lang={lang}
          />
        </div>
      </article>

      {/* ── Comments ────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <CommentsList postId={post.id} lang={lang} />
          <CommentForm  postId={post.id} lang={lang} />
        </div>
      </section>

      {/* ── Subscribe ───────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-2xl px-6 py-14">
          <SubscribeForm lang={lang} sourcePath={`/blog/${post.slug}`} sourcePostId={post.id} />
        </div>
      </section>

      {/* JSON-LD Article */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </main>
  )
}

// ── Data ────────────────────────────────────────────────────────────────────

async function fetchPostBySlug(slug: string, lang: Lang): Promise<BlogPostRow | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug',   slug)
    .eq('locale', lang)
    .eq('status', 'published')
    .maybeSingle()
  return (data as unknown as BlogPostRow) ?? null
}

/**
 * Get all posts in a translation graph. parentId is either:
 *   - the parent_id of a translation (so we want its siblings + parent), or
 *   - the id of the source post (so we want its translations + itself).
 * We do both: SELECT WHERE id = parentId OR parent_id = parentId.
 */
async function fetchTranslationsByParent(parentId: string): Promise<BlogPostRow[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .or(`id.eq.${parentId},parent_id.eq.${parentId}`)
  return (data as unknown as BlogPostRow[]) ?? []
}
