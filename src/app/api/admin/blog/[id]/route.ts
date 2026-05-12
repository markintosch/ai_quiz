// FILE: src/app/api/admin/blog/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Admin blog API — read / update / delete a single post.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import {
  computeReadingMinutes,
  slugify,
  type BlogStatus,
  type BlogFormat,
  type TiptapDoc,
} from '@/types/blog'

export const dynamic = 'force-dynamic'

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // Also load translations (siblings in the parent_id graph) so the editor
  // can show "Translate to EN/DE" buttons that link to existing or new ones.
  const row = data as { parent_id: string | null; id: string }
  const parentId = row.parent_id ?? row.id
  const { data: translations } = await supabase
    .from('blog_posts')
    .select('id, locale, slug, title, status, updated_at')
    .or(`id.eq.${parentId},parent_id.eq.${parentId}`)

  return NextResponse.json({ post: data, translations: translations ?? [] })
}

// ── PUT — update post fields ────────────────────────────────────────────────
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({})) as Partial<{
    title:            string
    slug:             string
    excerpt:          string
    content:          TiptapDoc
    cover_image:      string | null
    cover_alt:        string | null
    format:           BlogFormat
    status:           BlogStatus
    published_at:     string | null
    tags:             string[]
    meta_title:       string | null
    meta_description: string | null
    noindex:          boolean
    author_name:      string
  }>

  const supabase = createServiceClient()

  // Read current row for slug-uniqueness check.
  const { data: current } = await supabase
    .from('blog_posts')
    .select('locale, slug, status, published_at')
    .eq('id', params.id)
    .maybeSingle()
  if (!current) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const update: Record<string, unknown> = {}
  if (body.title !== undefined)            update.title            = body.title.trim()
  if (body.excerpt !== undefined)          update.excerpt          = body.excerpt
  if (body.cover_image !== undefined)      update.cover_image      = body.cover_image
  if (body.cover_alt !== undefined)        update.cover_alt        = body.cover_alt
  if (body.format !== undefined)           update.format           = body.format
  if (body.tags !== undefined)             update.tags             = Array.isArray(body.tags) ? body.tags : []
  if (body.meta_title !== undefined)       update.meta_title       = body.meta_title
  if (body.meta_description !== undefined) update.meta_description = body.meta_description
  if (body.noindex !== undefined)          update.noindex          = !!body.noindex
  if (body.author_name !== undefined)      update.author_name      = body.author_name

  if (body.content !== undefined) {
    update.content         = body.content
    update.reading_minutes = computeReadingMinutes(body.content)
  }

  // Slug change — re-check uniqueness within locale (excluding this row).
  if (body.slug !== undefined) {
    const desired = slugify(body.slug) || (current as { slug: string }).slug
    if (desired !== (current as { slug: string }).slug) {
      const finalSlug = await ensureUniqueSlug(
        supabase,
        desired,
        (current as { locale: 'nl' | 'en' | 'de' }).locale,
        params.id,
      )
      update.slug = finalSlug
    }
  }

  // Status transitions: publishing for the first time → set published_at = NOW.
  // Reverting to draft → keep published_at (so re-publishing later keeps history).
  if (body.status !== undefined) {
    update.status = body.status
    if (body.status === 'published' && !(current as { published_at: string | null }).published_at) {
      update.published_at = new Date().toISOString()
    }
  }
  // Explicit override (e.g. backdating).
  if (body.published_at !== undefined) update.published_at = body.published_at

  const { data, error } = await supabase
    .from('blog_posts')
    .update(update as never)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

// ── DELETE ──────────────────────────────────────────────────────────────────
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// ── helpers ─────────────────────────────────────────────────────────────────
async function ensureUniqueSlug(
  supabase: ReturnType<typeof createServiceClient>,
  base: string,
  locale: 'nl' | 'en' | 'de',
  ignoreId: string,
): Promise<string> {
  let candidate = base
  for (let i = 2; i < 100; i++) {
    const { data } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('locale', locale)
      .eq('slug',   candidate)
      .neq('id',    ignoreId)
      .maybeSingle()
    if (!data) return candidate
    candidate = `${base}-${i}`
  }
  return `${base}-${Date.now()}`
}
