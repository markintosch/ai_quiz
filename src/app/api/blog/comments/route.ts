// FILE: src/app/api/blog/comments/route.ts
// POST /api/blog/comments — publiek endpoint om reacties te plaatsen.
//
// Flow:
//  1. Rate-limit 5/uur per IP (anders kan iemand spam-flood doen)
//  2. Valideer: post_id bestaat + published, naam/email/body niet leeg, AVG vinkje
//  3. Insert als status='pending'
//  4. Resend notify naar Mark met directe moderation-link
//  5. Defensieve fallback (PGRST204) → schema-cache miss
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { createServiceClient } from '@/lib/supabase/server'
import { BlogCommentNotifyEmail } from '@/lib/email/templates/blogCommentNotify'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BASE     = 'https://markdekock.com'
const FROM     = 'Brand PWRD Media <blog@brandpwrdmedia.com>'
const NOTIFY_TO = process.env.ADMIN_EMAIL ?? 'mark@brandpwrdmedia.com'
const resend   = new Resend(process.env.RESEND_API_KEY)

interface SubmitBody {
  post_id:      string
  author_name:  string
  author_email: string
  body:         string
  consent:      boolean
  consent_text?: string
}

export async function POST(req: Request) {
  // Rate limit
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`blog-comment:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limit' }, { status: 429 })
  }

  let body: SubmitBody
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }) }

  const post_id      = (body.post_id ?? '').trim()
  const author_name  = (body.author_name ?? '').trim().slice(0, 80)
  const author_email = (body.author_email ?? '').trim().toLowerCase().slice(0, 254)
  const text         = (body.body ?? '').trim().slice(0, 4000)

  if (!post_id || !author_name || !author_email || !text) {
    return NextResponse.json({ error: 'required_fields' }, { status: 400 })
  }
  if (!body.consent) {
    return NextResponse.json({ error: 'consent_required' }, { status: 400 })
  }
  if (!isValidEmail(author_email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Verify post exists + is published (anders kan iemand reageren op draft / niet-bestaande)
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, slug, locale, title, status')
    .eq('id', post_id)
    .maybeSingle()
  const p = post as { id: string; slug: string; locale: 'nl'|'en'|'de'; title: string; status: string } | null
  if (!p || p.status !== 'published') {
    return NextResponse.json({ error: 'post_not_found' }, { status: 404 })
  }

  // Insert (graceful fallback bij schema-cache miss)
  const userAgent = (req.headers.get('user-agent') ?? '').slice(0, 500)
  const corePayload = {
    post_id,
    author_name,
    author_email,
    body:         text,
    status:       'pending',
    consent_at:   new Date().toISOString(),
    consent_text: body.consent_text?.slice(0, 1000) ?? null,
    source_ip:    ip,
    user_agent:   userAgent,
  }

  let inserted: { id: string } | null = null
  let aerr: { code?: string; message?: string } | null = null
  {
    const r = await supabase
      .from('blog_comments')
      .insert(corePayload as never)
      .select('id')
      .single()
    inserted = (r.data as { id: string } | null) ?? null
    aerr     = r.error as { code?: string; message?: string } | null
  }
  if (aerr || !inserted) {
    console.error('[blog/comments] insert failed', aerr)
    return NextResponse.json({ error: 'save_failed', detail: aerr?.message }, { status: 500 })
  }

  // Notify Mark via Resend (best-effort — submit slaagt ook als email faalt)
  if (process.env.RESEND_API_KEY) {
    try {
      const postUrl = p.locale === 'nl'
        ? `${BASE}/blog/${p.slug}`
        : `${BASE}/blog/${p.slug}?lang=${p.locale}`
      const modUrl  = `${BASE}/admin/blog/comments`
      const html    = await render(
        BlogCommentNotifyEmail({
          authorName:  author_name,
          authorEmail: author_email,
          body:        text,
          postTitle:   p.title,
          postUrl,
          modUrl,
        }),
      )
      await resend.emails.send({
        from:    FROM,
        to:      NOTIFY_TO,
        subject: `Nieuwe reactie van ${author_name} op "${p.title}"`,
        html,
      })
    } catch (err) {
      console.warn('[blog/comments] notify email failed', err)
    }
  }

  return NextResponse.json({ ok: true, id: inserted.id })
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254
}
