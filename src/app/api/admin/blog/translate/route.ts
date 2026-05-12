// FILE: src/app/api/admin/blog/translate/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Admin: translate a post into another locale.
//
// POST body: { sourceId: string, targetLocale: 'en'|'de'|'nl' }
//
// Behaviour:
// 1. Read the source post (must exist + have content).
// 2. Determine the translation graph "root": parent_id ?? source.id.
// 3. If a translation in targetLocale already exists in this graph, update it
//    and return { post, replaced: true }.
// 4. Otherwise create a new draft post with parent_id = root, populate via
//    Claude, return { post, replaced: false }.
//
// Translation runs through src/lib/blog/translate.ts which preserves the
// Tiptap structure (only text leaves change).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { translatePost } from '@/lib/blog/translate'
import {
  computeReadingMinutes,
  slugify,
  type BlogLocale,
  type BlogPostRow,
} from '@/types/blog'

export const dynamic = 'force-dynamic'
export const maxDuration = 120                              // Vercel: 2-min budget

export async function POST(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as Partial<{
    sourceId:     string
    targetLocale: BlogLocale
  }>
  const sourceId     = body.sourceId
  const targetLocale = body.targetLocale

  if (!sourceId || (targetLocale !== 'nl' && targetLocale !== 'en' && targetLocale !== 'de')) {
    return NextResponse.json({ error: 'sourceId + targetLocale required' }, { status: 400 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const supabase = createServiceClient()
  const { data: source } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', sourceId)
    .maybeSingle()

  if (!source) return NextResponse.json({ error: 'source not found' }, { status: 404 })

  const src = source as unknown as BlogPostRow

  if (src.locale === targetLocale) {
    return NextResponse.json({ error: `source is already in ${targetLocale}` }, { status: 400 })
  }

  // Translation graph root.
  const rootId = src.parent_id ?? src.id

  // Run translation.
  const t = await translatePost(
    {
      title:            src.title,
      excerpt:          src.excerpt,
      meta_title:       src.meta_title,
      meta_description: src.meta_description,
      content:          src.content,
    },
    src.locale,
    targetLocale,
  )
  const reading = computeReadingMinutes(t.content)

  // Look for an existing translation in this graph + locale.
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('id, slug')
    .eq('locale', targetLocale)
    .or(`id.eq.${rootId},parent_id.eq.${rootId}`)
    .maybeSingle()

  if (existing) {
    const existingRow = existing as { id: string; slug: string }
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        title:            t.title,
        excerpt:          t.excerpt,
        meta_title:       t.meta_title,
        meta_description: t.meta_description,
        content:          t.content,
        reading_minutes:  reading,
      } as never)
      .eq('id', existingRow.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data, replaced: true })
  }

  // No existing translation — create a new draft post linked to the source.
  const baseSlug = slugify(t.title) || `post-${Date.now()}`
  const finalSlug = await ensureUniqueSlug(supabase, baseSlug, targetLocale)

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      parent_id:        rootId,
      locale:           targetLocale,
      slug:             finalSlug,
      title:            t.title,
      excerpt:          t.excerpt,
      meta_title:       t.meta_title,
      meta_description: t.meta_description,
      content:          t.content,
      reading_minutes:  reading,
      format:           src.format,
      status:           'draft',
      tags:             src.tags,
      cover_image:      src.cover_image,
      cover_alt:        src.cover_alt,
      author_name:      src.author_name,
    } as never)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data, replaced: false })
}

async function ensureUniqueSlug(
  supabase: ReturnType<typeof createServiceClient>,
  base: string,
  locale: BlogLocale,
): Promise<string> {
  let candidate = base
  for (let i = 2; i < 100; i++) {
    const { data } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('locale', locale)
      .eq('slug',   candidate)
      .maybeSingle()
    if (!data) return candidate
    candidate = `${base}-${i}`
  }
  return `${base}-${Date.now()}`
}
