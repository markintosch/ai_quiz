// FILE: src/app/api/admin/blog/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Admin blog API — list + create posts.
// All admin routes call isAuthorised() before touching data.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { computeReadingMinutes, slugify, EMPTY_TIPTAP_DOC, type BlogLocale, type BlogStatus, type BlogFormat, type TiptapDoc } from '@/types/blog'

export const dynamic = 'force-dynamic'

// ── GET — list posts, optionally filtered by locale/status ──────────────────
export async function GET(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const locale  = searchParams.get('locale')
  const status  = searchParams.get('status')

  const supabase = createServiceClient()
  let query = supabase
    .from('blog_posts')
    .select('id, parent_id, locale, slug, title, excerpt, format, status, published_at, author_name, tags, reading_minutes, cover_image, updated_at, created_at')
    .order('updated_at', { ascending: false })
    .limit(200)
  if (locale) query = query.eq('locale', locale)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data ?? [] })
}

// ── POST — create new post (default empty draft in NL) ──────────────────────
export async function POST(req: Request) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({})) as Partial<{
    title:     string
    locale:    BlogLocale
    format:    BlogFormat
    parent_id: string | null
    slug:      string
    content:   TiptapDoc
    excerpt:   string
    tags:      string[]
  }>

  const title  = (body.title ?? 'Nieuwe post').trim() || 'Nieuwe post'
  const locale = (body.locale === 'en' || body.locale === 'de' ? body.locale : 'nl') as BlogLocale
  const format = (body.format === 'update' ? 'update' : 'article') as BlogFormat
  const slug   = body.slug?.trim() || slugify(title) || `post-${Date.now()}`
  const content = body.content ?? EMPTY_TIPTAP_DOC
  const reading = computeReadingMinutes(content)

  const supabase = createServiceClient()

  // Make sure slug is unique within locale; append -2, -3, ... if collision.
  const finalSlug = await ensureUniqueSlug(supabase, slug, locale)

  const insertRow = {
    title,
    slug:            finalSlug,
    locale,
    format,
    parent_id:       body.parent_id ?? null,
    content,
    excerpt:         body.excerpt ?? null,
    tags:            Array.isArray(body.tags) ? body.tags : [],
    reading_minutes: reading,
    status:          'draft' as BlogStatus,
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(insertRow as never)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

// ── helpers ─────────────────────────────────────────────────────────────────
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
