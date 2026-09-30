// FILE: src/app/admin/blog/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Admin: list of all blog posts grouped by translation graph.
// Filter by status / locale. "Nieuwe post" creates a draft via API and
// redirects into the editor.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type PostListItem = {
  id:               string
  parent_id:        string | null
  locale:           'nl' | 'en' | 'de'
  slug:             string
  title:            string
  excerpt:          string | null
  format:           'article' | 'update'
  status:           'draft'   | 'published'
  published_at:     string | null
  reading_minutes:  number | null
  cover_image:      string | null
  updated_at:       string
}

const LOCALE_LABEL: Record<PostListItem['locale'], string> = {
  nl: '🇳🇱', en: '🇬🇧', de: '🇩🇪',
}

export default function AdminBlogList() {
  const router = useRouter()
  const [posts,    setPosts]    = useState<PostListItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [loadError,setLoadError]= useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [filterLocale, setFilterLocale] = useState<'all' | PostListItem['locale']>('all')

  async function load() {
    setLoading(true)
    setLoadError(null)
    const params = new URLSearchParams()
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (filterLocale !== 'all') params.set('locale', filterLocale)
    try {
      const r = await fetch(`/api/admin/blog?${params.toString()}`, { cache: 'no-store' })
      const text = await r.text()
      let j: { posts?: PostListItem[]; error?: string }
      try { j = JSON.parse(text) } catch { j = { error: text || `HTTP ${r.status}` } }
      if (r.status === 401) {
        setLoadError('Niet ingelogd of sessie verlopen — log opnieuw in via /admin/login.')
        setPosts([])
      } else if (!r.ok) {
        const tableMissing = (j.error ?? '').toLowerCase().includes('blog_posts')
                          || (j.error ?? '').toLowerCase().includes('does not exist')
                          || (j.error ?? '').toLowerCase().includes('schema cache')
        setLoadError(tableMissing
          ? 'De `blog_posts` tabel bestaat nog niet. Run eerst de SQL: supabase/migration_blog.sql in de Supabase SQL editor.'
          : `Laden mislukt (HTTP ${r.status}): ${j.error ?? 'onbekende fout'}`)
        setPosts([])
      } else {
        setPosts(Array.isArray(j.posts) ? j.posts : [])
      }
    } catch (err) {
      setLoadError(`Netwerkfout: ${err instanceof Error ? err.message : 'onbekend'}`)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [filterStatus, filterLocale])

  async function createPost() {
    setCreating(true)
    let r: Response
    try {
      r = await fetch('/api/admin/blog', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ title: 'Nieuwe post', locale: 'nl', format: 'article' }),
      })
    } catch (err) {
      setCreating(false)
      alert(`Netwerkfout: ${err instanceof Error ? err.message : 'onbekend'}`)
      return
    }

    const text = await r.text()
    let j: { post?: { id?: string }; error?: string }
    try { j = JSON.parse(text) } catch { j = { error: text || `HTTP ${r.status}` } }
    setCreating(false)

    if (r.status === 401) {
      alert('Niet ingelogd of sessie verlopen. Login opnieuw via /admin/login.')
      return
    }
    if (!r.ok || !j?.post?.id) {
      const friendly = (j.error ?? '').toLowerCase().includes('blog_posts')
                    || (j.error ?? '').toLowerCase().includes('does not exist')
        ? 'De `blog_posts` tabel bestaat nog niet. Run eerst de SQL: supabase/migration_blog.sql in de Supabase SQL editor.'
        : `Aanmaken mislukt (HTTP ${r.status}): ${j.error ?? 'onbekende fout'}`
      console.error('createPost failed', { status: r.status, body: j })
      alert(friendly)
      return
    }
    router.push(`/admin/blog/${j.post!.id}`)
  }

  // Group by translation graph: rootId = parent_id ?? id
  const grouped = groupByGraph(posts)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand">Blog</h1>
          <p className="text-sm text-gray-600">Beheer posts voor /blog (NL/EN/DE).</p>
        </div>
        <button
          type="button"
          onClick={createPost}
          disabled={creating}
          className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90 disabled:opacity-50"
        >
          {creating ? 'Bezig…' : '+ Nieuwe post'}
        </button>
      </div>

      {/* Error banner — toont SQL-migratie / login / netwerk fouten */}
      {loadError && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">Oeps:</p>
          <p className="mt-1">{loadError}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <FilterSelect
          label="Status"
          value={filterStatus}
          onChange={(v) => setFilterStatus(v as typeof filterStatus)}
          options={[
            { value: 'all',       label: 'Alles' },
            { value: 'draft',     label: 'Concept' },
            { value: 'published', label: 'Gepubliceerd' },
          ]}
        />
        <FilterSelect
          label="Taal"
          value={filterLocale}
          onChange={(v) => setFilterLocale(v as typeof filterLocale)}
          options={[
            { value: 'all', label: 'Alle' },
            { value: 'nl',  label: 'NL' },
            { value: 'en',  label: 'EN' },
            { value: 'de',  label: 'DE' },
          ]}
        />
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-600">Laden…</p>
      ) : grouped.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 py-16 text-center text-gray-600">
          Nog geen posts. Klik op "+ Nieuwe post" om te beginnen.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Titel</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Talen</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Bijgewerkt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {grouped.map((g) => {
                // Show the source row (NL or oldest) as the headline.
                const head = pickHead(g.posts)
                return (
                  <tr key={g.rootId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/blog/${head.id}`} className="font-medium text-brand hover:underline">
                        {head.title}
                      </Link>
                      <div className="mt-0.5 text-xs text-gray-600">/{head.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={head.format === 'update'
                        ? 'rounded-full bg-brand-gold/15 px-2 py-0.5 text-xs font-medium text-brand-dark'
                        : 'rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand'
                      }>
                        {head.format === 'update' ? 'Update' : 'Essay'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {g.posts
                          .sort((a, b) => a.locale.localeCompare(b.locale))
                          .map((p) => (
                            <Link
                              key={p.id}
                              href={`/admin/blog/${p.id}`}
                              className={
                                p.status === 'published'
                                  ? 'rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100'
                                  : 'rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-200'
                              }
                              title={`${p.locale.toUpperCase()} — ${p.status === 'published' ? 'gepubliceerd' : 'concept'}`}
                            >
                              {LOCALE_LABEL[p.locale]} {p.locale.toUpperCase()}
                            </Link>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {head.status === 'published' ? (
                        <span className="font-medium text-emerald-700">● Gepubliceerd</span>
                      ) : (
                        <span className="text-gray-600">○ Concept</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(head.updated_at).toLocaleDateString('nl-NL', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function FilterSelect({
  label, value, onChange, options,
}: {
  label:    string
  value:    string
  onChange: (v: string) => void
  options:  { value: string; label: string }[]
}) {
  return (
    <label className="flex items-center gap-2 text-gray-700">
      <span className="text-xs uppercase tracking-wide">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-brand-accent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

function groupByGraph(posts: PostListItem[]): { rootId: string; posts: PostListItem[] }[] {
  const map = new Map<string, PostListItem[]>()
  for (const p of posts) {
    const root = p.parent_id ?? p.id
    if (!map.has(root)) map.set(root, [])
    map.get(root)!.push(p)
  }
  return Array.from(map.entries())
    .map(([rootId, ps]) => ({ rootId, posts: ps }))
    .sort((a, b) => {
      const aMax = Math.max(...a.posts.map((p: PostListItem) => Date.parse(p.updated_at)))
      const bMax = Math.max(...b.posts.map((p: PostListItem) => Date.parse(p.updated_at)))
      return bMax - aMax
    })
}

function pickHead(posts: PostListItem[]): PostListItem {
  return posts.find((p) => p.locale === 'nl' && !p.parent_id)
      ?? posts.find((p) => !p.parent_id)
      ?? posts[0]
}
