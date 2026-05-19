// FILE: src/app/admin/blog/[id]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Admin: edit a single blog post.
//
// Layout:
//   ┌─ left (lg:col-span-2)              ─┬─ right sidebar ─┐
//   │  Title input                        │  Status         │
//   │  Excerpt textarea                   │  Format         │
//   │  Cover image upload + preview       │  Slug           │
//   │  Tiptap editor                      │  Tags           │
//   │                                     │  Reading time   │
//   │                                     │  Translations   │
//   │                                     │  SEO overrides  │
//   └─────────────────────────────────────┴─────────────────┘
//
// All saves go through PUT /api/admin/blog/[id].
// "Publiceer" toggles status → 'published' and stamps published_at.
// "Vertaal naar EN/DE" calls /api/admin/blog/translate and opens the new draft.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BlogEditor from '@/components/admin/blog/BlogEditor'
import { BlogCover } from '@/components/blog/BlogCover'
import { isVideoUrl } from '@/lib/blog/cover'
import {
  EMPTY_TIPTAP_DOC,
  type BlogFormat,
  type BlogLocale,
  type BlogStatus,
  type TiptapDoc,
} from '@/types/blog'

interface Post {
  id:               string
  parent_id:        string | null
  locale:           BlogLocale
  slug:             string
  title:            string
  excerpt:          string | null
  content:          TiptapDoc
  cover_image:      string | null
  cover_alt:        string | null
  cover_poster:     string | null
  format:           BlogFormat
  status:           BlogStatus
  published_at:     string | null
  author_name:      string
  tags:             string[]
  reading_minutes:  number | null
  meta_title:       string | null
  meta_description: string | null
  noindex:          boolean
  updated_at:       string
}
interface Translation {
  id: string; locale: BlogLocale; slug: string; title: string; status: BlogStatus
}

export default function EditBlogPostPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter()
  const [post, setPost]               = useState<Post | null>(null)
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading]         = useState(true)
  const [saving,  setSaving]          = useState(false)
  const [savedAt, setSavedAt]         = useState<string | null>(null)
  const [translating, setTranslating] = useState<BlogLocale | null>(null)
  const [tagsInput, setTagsInput]     = useState('')
  const [coverUpload,  setCoverUpload]  = useState<{ pct: number; status: 'uploading'|'error'; msg?: string } | null>(null)
  const [posterUpload, setPosterUpload] = useState<{ pct: number; status: 'uploading'|'error'; msg?: string } | null>(null)

  // Load post.
  useEffect(() => {
    let ignore = false
    ;(async () => {
      const r = await fetch(`/api/admin/blog/${params.id}`, { cache: 'no-store' })
      const j = await r.json()
      if (ignore) return
      if (!r.ok) {
        alert(`Laden mislukt: ${j.error ?? r.status}`)
        return
      }
      setPost(j.post)
      setTranslations(j.translations ?? [])
      setTagsInput(((j.post.tags as string[]) ?? []).join(', '))
      setLoading(false)
    })()
    return () => { ignore = true }
  }, [params.id])

  // ── Save (debounced manual) ────────────────────────────────────────────
  const save = useCallback(async (overrides?: Partial<Post>) => {
    if (!post) return
    setSaving(true)
    const body: Record<string, unknown> = {
      title:            overrides?.title            ?? post.title,
      slug:             overrides?.slug             ?? post.slug,
      excerpt:          overrides?.excerpt          ?? post.excerpt,
      content:          overrides?.content          ?? post.content,
      cover_image:      overrides?.cover_image      ?? post.cover_image,
      cover_alt:        overrides?.cover_alt        ?? post.cover_alt,
      cover_poster:     overrides?.cover_poster     ?? post.cover_poster,
      format:           overrides?.format           ?? post.format,
      status:           overrides?.status           ?? post.status,
      tags:             overrides?.tags             ?? post.tags,
      meta_title:       overrides?.meta_title       ?? post.meta_title,
      meta_description: overrides?.meta_description ?? post.meta_description,
      noindex:          overrides?.noindex          ?? post.noindex,
      author_name:      overrides?.author_name      ?? post.author_name,
    }
    const r = await fetch(`/api/admin/blog/${post.id}`, {
      method:  'PUT',
      headers: { 'content-type': 'application/json' },
      body:    JSON.stringify(body),
    })
    const j = await r.json()
    setSaving(false)
    if (!r.ok) {
      alert(`Opslaan mislukt: ${j.error ?? r.status}`)
      return
    }
    setPost(j.post)
    setSavedAt(new Date().toISOString())
  }, [post])

  // ── Cover upload (image OR video) — signed URL direct naar Supabase ───
  // Bypasst Vercel's 4.5 MB Edge body limit; werkt tot 50 MB.
  async function uploadCover(file: File) {
    setCoverUpload({ pct: 0, status: 'uploading' })
    try {
      const url = await uploadToSupabase(file, (pct) => setCoverUpload({ pct, status: 'uploading' }))
      await save({ cover_image: url })
      setCoverUpload(null)
    } catch (err) {
      setCoverUpload({ pct: 0, status: 'error', msg: err instanceof Error ? err.message : 'onbekend' })
    }
  }

  // ── Poster upload (alleen image; voor og:image als cover een video is) ─
  async function uploadPoster(file: File) {
    if (!file.type.startsWith('image/')) {
      setPosterUpload({ pct: 0, status: 'error', msg: 'Het poster-frame moet een afbeelding zijn (jpg/png/webp).' })
      return
    }
    setPosterUpload({ pct: 0, status: 'uploading' })
    try {
      const url = await uploadToSupabase(file, (pct) => setPosterUpload({ pct, status: 'uploading' }))
      await save({ cover_poster: url })
      setPosterUpload(null)
    } catch (err) {
      setPosterUpload({ pct: 0, status: 'error', msg: err instanceof Error ? err.message : 'onbekend' })
    }
  }

  // ── Translate ──────────────────────────────────────────────────────────
  async function translateTo(target: BlogLocale) {
    if (!post) return
    if (post.locale === target) return
    if (!confirm(`Vertalen naar ${target.toUpperCase()}? Bestaande vertaling wordt overschreven.`)) return
    setTranslating(target)
    const r = await fetch('/api/admin/blog/translate', {
      method:  'POST',
      headers: { 'content-type': 'application/json' },
      body:    JSON.stringify({ sourceId: post.id, targetLocale: target }),
    })
    const j = await r.json()
    setTranslating(null)
    if (!r.ok) { alert(`Vertalen mislukt: ${j.error ?? r.status}`); return }
    if (j.post?.id) router.push(`/admin/blog/${j.post.id}`)
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  async function del() {
    if (!post) return
    if (!confirm(`Permanent verwijderen: "${post.title}"? Vertalingen worden ook verwijderd (CASCADE).`)) return
    const r = await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' })
    if (r.ok) router.push('/admin/blog')
    else alert('Verwijderen mislukt.')
  }

  if (loading || !post) {
    return <p className="py-12 text-center text-gray-600">Laden…</p>
  }

  const publicUrl = post.locale === 'nl' ? `/blog/${post.slug}` : `/blog/${post.slug}?lang=${post.locale}`

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/blog" className="text-sm text-gray-600 hover:text-brand">← Alle posts</Link>
          <h1 className="mt-1 text-xl font-bold text-brand">
            Bewerken — {post.locale.toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && <span className="text-xs text-gray-600">Opgeslagen {timeAgo(savedAt)}</span>}
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? 'Opslaan…' : 'Opslaan'}
          </button>
          {post.status === 'published' ? (
            <button
              type="button"
              onClick={() => save({ status: 'draft' })}
              disabled={saving}
              className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              Terug naar concept
            </button>
          ) : (
            <button
              type="button"
              onClick={() => save({ status: 'published' })}
              disabled={saving}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Publiceer
            </button>
          )}
          {post.status === 'published' && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              title="Bekijk live"
            >
              ↗
            </a>
          )}
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Left: editor ───────────────────────────────────── */}
        <div className="space-y-4 lg:col-span-2">
          <Field label="Titel">
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              onBlur={() => save({ title: post.title })}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-lg font-bold text-brand focus:border-brand-accent focus:outline-none"
            />
          </Field>

          <Field label="Samenvatting (excerpt)" hint="1–2 zinnen. Wordt gebruikt op de overzichtspagina + als meta description.">
            <textarea
              value={post.excerpt ?? ''}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              onBlur={() => save({ excerpt: post.excerpt })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-accent focus:outline-none"
            />
          </Field>

          <Field
            label="Coverbeeld of -video"
            hint="Afbeelding (1600 × 900 px aanbevolen) of video (MP4 werkt overal — MPEG/MOV niet altijd). Max 50 MB. Video's lopen automatisch als hero-beeld (muted, loop)."
          >
            <div className="space-y-3">
              {post.cover_image && (
                <div className="max-w-md overflow-hidden rounded-md border border-gray-200">
                  <BlogCover
                    src={post.cover_image}
                    alt={post.cover_alt}
                    poster={post.cover_poster}
                    aspect="16/9"
                  />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*,video/*"
                  disabled={coverUpload?.status === 'uploading'}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void uploadCover(f)
                    e.target.value = ''
                  }}
                  className="text-sm text-gray-700 disabled:opacity-50"
                />
                {post.cover_image && (
                  <button
                    type="button"
                    onClick={() => save({ cover_image: null, cover_alt: null, cover_poster: null })}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Verwijderen
                  </button>
                )}
              </div>

              {/* Upload progress / error feedback */}
              {coverUpload && (
                <div className={
                  'rounded-md border p-3 text-sm ' +
                  (coverUpload.status === 'error'
                    ? 'border-red-300 bg-red-50 text-red-800'
                    : 'border-blue-200 bg-blue-50 text-blue-800')
                }>
                  {coverUpload.status === 'uploading' ? (
                    <>
                      <div className="mb-1 flex items-center justify-between">
                        <span>Uploaden naar Supabase Storage…</span>
                        <span className="font-mono text-xs">{coverUpload.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
                        <div
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${coverUpload.pct}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">Upload mislukt:</p>
                      <p className="mt-1">{coverUpload.msg}</p>
                      <button
                        type="button"
                        onClick={() => setCoverUpload(null)}
                        className="mt-2 text-xs underline"
                      >
                        Verberg
                      </button>
                    </>
                  )}
                </div>
              )}

              {post.cover_image && (
                <input
                  type="text"
                  placeholder="Alt-tekst (SEO + toegankelijkheid)"
                  value={post.cover_alt ?? ''}
                  onChange={(e) => setPost({ ...post, cover_alt: e.target.value })}
                  onBlur={() => save({ cover_alt: post.cover_alt })}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-accent focus:outline-none"
                />
              )}
            </div>
          </Field>

          {/* Poster — alleen tonen als de cover een video is */}
          {post.cover_image && isVideoUrl(post.cover_image) && (
            <Field
              label="Poster-afbeelding (LinkedIn/Twitter preview)"
              hint="LinkedIn en Twitter kunnen geen video's tonen in de social-card preview — alleen afbeeldingen. Upload hier een still (1200 × 630 px) die als preview-image dient."
            >
              <div className="space-y-3">
                {post.cover_poster && (
                  // eslint-disable-next-line @next/next/no-img-element
                  (<img
                    src={post.cover_poster}
                    alt="Poster preview"
                    className="w-full max-w-md rounded-md border border-gray-200"
                  />)
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={posterUpload?.status === 'uploading'}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) void uploadPoster(f)
                      e.target.value = ''
                    }}
                    className="text-sm text-gray-700 disabled:opacity-50"
                  />
                  {post.cover_poster && (
                    <button
                      type="button"
                      onClick={() => save({ cover_poster: null })}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Verwijderen
                    </button>
                  )}
                </div>

                {posterUpload && (
                  <div className={
                    'rounded-md border p-3 text-sm ' +
                    (posterUpload.status === 'error'
                      ? 'border-red-300 bg-red-50 text-red-800'
                      : 'border-blue-200 bg-blue-50 text-blue-800')
                  }>
                    {posterUpload.status === 'uploading' ? (
                      <>
                        <div className="mb-1 flex items-center justify-between">
                          <span>Uploaden…</span>
                          <span className="font-mono text-xs">{posterUpload.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
                          <div className="h-full bg-blue-600 transition-all" style={{ width: `${posterUpload.pct}%` }} />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">Upload mislukt:</p>
                        <p className="mt-1">{posterUpload.msg}</p>
                        <button type="button" onClick={() => setPosterUpload(null)} className="mt-2 text-xs underline">
                          Verberg
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!post.cover_poster && !posterUpload && (
                  <p className="text-xs text-amber-800">
                    Zonder poster heeft je post geen preview-afbeelding op LinkedIn / Twitter.
                  </p>
                )}
              </div>
            </Field>
          )}

          <Field label="Inhoud">
            <BlogEditor
              key={post.id}                                        /* re-mount when switching post */
              initialDoc={post.content ?? EMPTY_TIPTAP_DOC}
              onChange={(doc) => setPost({ ...post, content: doc })}
            />
            <p className="mt-2 text-xs text-gray-600">
              Tip: type een URL en sleep er overheen om snel een link te maken. Klik op een bestaande link om te bewerken.
            </p>
          </Field>
        </div>

        {/* ── Right: sidebar ──────────────────────────────────── */}
        <aside className="space-y-5">
          <SidebarSection title="Status">
            <div className="text-sm">
              {post.status === 'published' ? (
                <p className="font-medium text-emerald-700">● Gepubliceerd</p>
              ) : (
                <p className="text-gray-700">○ Concept</p>
              )}
              {post.published_at && (
                <p className="mt-1 text-xs text-gray-600">
                  Gepubliceerd: {new Date(post.published_at).toLocaleString('nl-NL')}
                </p>
              )}
            </div>
          </SidebarSection>

          <SidebarSection title="Type">
            <div className="flex gap-2">
              {(['article', 'update'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => save({ format: f })}
                  className={
                    'flex-1 rounded-md border px-3 py-2 text-sm font-medium ' +
                    (post.format === f
                      ? 'border-brand-accent bg-brand-accent text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50')
                  }
                >
                  {f === 'article' ? 'Essay' : 'Update'}
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="Slug" hint={`URL: ${publicUrl}`}>
            <input
              type="text"
              value={post.slug}
              onChange={(e) => setPost({ ...post, slug: e.target.value })}
              onBlur={() => save({ slug: post.slug })}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 font-mono text-sm focus:border-brand-accent focus:outline-none"
            />
          </SidebarSection>

          <SidebarSection title="Tags" hint="Komma-gescheiden, bijv: ai, marketing, ops">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onBlur={() => {
                const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
                save({ tags })
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-accent focus:outline-none"
            />
            {post.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">#{t}</span>
                ))}
              </div>
            )}
          </SidebarSection>

          <SidebarSection title="Leestijd">
            <p className="text-sm text-gray-700">{post.reading_minutes ?? '–'} min</p>
            <p className="mt-0.5 text-xs text-gray-600">Wordt automatisch berekend bij opslaan.</p>
          </SidebarSection>

          <SidebarSection title="Vertalingen">
            <div className="space-y-2">
              {(['nl', 'en', 'de'] as const).map((loc) => {
                const t = translations.find((x) => x.locale === loc)
                if (loc === post.locale) {
                  return (
                    <div key={loc} className="flex items-center justify-between rounded border border-brand-accent/40 bg-brand-accent/5 px-3 py-2 text-sm">
                      <span className="font-medium text-brand">{loc.toUpperCase()} (deze)</span>
                      <span className="text-xs text-gray-600">{post.status}</span>
                    </div>
                  )
                }
                return (
                  <div key={loc} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm">
                    <span className="text-gray-700">{loc.toUpperCase()}</span>
                    {t ? (
                      <Link href={`/admin/blog/${t.id}`} className="text-xs font-medium text-brand-accent hover:underline">
                        {t.status} — bewerken →
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => translateTo(loc)}
                        disabled={translating !== null}
                        className="text-xs font-medium text-brand-accent hover:underline disabled:opacity-50"
                      >
                        {translating === loc ? 'Vertalen…' : '+ Vertalen'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Vertaling gebruikt Claude. Structuur (koppen, lijsten, links) blijft behouden — alleen tekst wordt vertaald.
            </p>
          </SidebarSection>

          <SidebarSection title="SEO" hint="Vul alleen in als je af wilt wijken van titel/excerpt.">
            <div className="space-y-2 text-sm">
              <input
                type="text"
                placeholder="Meta title (override)"
                value={post.meta_title ?? ''}
                onChange={(e) => setPost({ ...post, meta_title: e.target.value })}
                onBlur={() => save({ meta_title: post.meta_title || null })}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-brand-accent focus:outline-none"
              />
              <textarea
                placeholder="Meta description (override)"
                value={post.meta_description ?? ''}
                onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
                onBlur={() => save({ meta_description: post.meta_description || null })}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-brand-accent focus:outline-none"
              />
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={post.noindex}
                  onChange={(e) => save({ noindex: e.target.checked })}
                />
                Noindex (verberg voor zoekmachines)
              </label>
            </div>
          </SidebarSection>

          <SidebarSection title="Gevarenzone">
            <button
              type="button"
              onClick={del}
              className="w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Permanent verwijderen
            </button>
            {post.parent_id === null && (
              <p className="mt-2 text-xs text-gray-600">
                Dit is de bronpost — verwijderen verwijdert alle vertalingen (CASCADE).
              </p>
            )}
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}

// ── UI helpers ──────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-600">{hint}</p>}
    </div>
  )
}

function SidebarSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">{title}</h3>
      {children}
      {hint && <p className="mt-2 text-xs text-gray-600">{hint}</p>}
    </div>
  )
}

function timeAgo(iso: string): string {
  const sec = Math.round((Date.now() - Date.parse(iso)) / 1000)
  if (sec < 5)  return 'zojuist'
  if (sec < 60) return `${sec}s geleden`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} min geleden`
  return new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Twee-staps upload met signed URL (bypasst Vercel 4.5 MB Edge limit).
 *
 * 1. POST /api/admin/blog/upload-init → server geeft signed Storage URL
 * 2. PUT direct naar Supabase Storage met de file body (XHR voor progress)
 *
 * Gooit Error met human-readable bericht bij elke faal-stap.
 */
async function uploadToSupabase(
  file:       File,
  onProgress: (pct: number) => void,
): Promise<string> {
  // ── Stap 1: signed URL ophalen ──────────────────────────────────────
  const initRes = await fetch('/api/admin/blog/upload-init', {
    method:  'POST',
    headers: { 'content-type': 'application/json' },
    body:    JSON.stringify({
      filename:    file.name,
      contentType: file.type || 'application/octet-stream',
      size:        file.size,
    }),
  })
  const initText = await initRes.text()
  let init: { uploadUrl?: string; publicUrl?: string; error?: string }
  try { init = JSON.parse(initText) } catch { init = { error: initText || `HTTP ${initRes.status}` } }

  if (initRes.status === 401) throw new Error('Niet ingelogd. Login opnieuw via /admin/login.')
  if (!initRes.ok || !init.uploadUrl || !init.publicUrl) {
    throw new Error(init.error ?? `Init mislukt (HTTP ${initRes.status})`)
  }

  // ── Stap 2: PUT met XHR voor progress events ─────────────────────────
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', init.uploadUrl!)
    // Supabase signed upload accepteert raw body met deze headers:
    xhr.setRequestHeader('Content-Type',  file.type || 'application/octet-stream')
    xhr.setRequestHeader('Cache-Control', 'max-age=3600')
    xhr.setRequestHeader('x-upsert',      'false')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
      } else {
        reject(new Error(`Upload naar Storage mislukt (HTTP ${xhr.status}): ${xhr.responseText.slice(0, 200)}`))
      }
    }
    xhr.onerror = () => reject(new Error('Netwerkfout tijdens upload.'))
    xhr.send(file)
  })

  return init.publicUrl
}
