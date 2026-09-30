// FILE: src/app/admin/blog/comments/page.tsx
// Moderatie-pagina voor blog-reacties.

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Row {
  id:           string
  post_id:      string
  author_name:  string
  author_email: string
  body:         string
  status:       'pending' | 'approved' | 'spam' | 'rejected'
  created_at:   string
  source_ip:    string | null
  blog_posts:   { slug: string; locale: 'nl'|'en'|'de'; title: string } | null
}

const STATUS_FILTERS = [
  { value: 'pending',   label: 'Pending'      },
  { value: 'approved',  label: 'Goedgekeurd'  },
  { value: 'spam',      label: 'Spam'         },
  { value: 'rejected',  label: 'Afgewezen'    },
  { value: 'all',       label: 'Alles'        },
] as const

export default function AdminBlogCommentsPage() {
  const [filter,  setFilter]  = useState<typeof STATUS_FILTERS[number]['value']>('pending')
  const [rows,    setRows]    = useState<Row[]>([])
  const [counts,  setCounts]  = useState({ pending: 0, approved: 0, spam: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [busy,    setBusy]    = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    const params = filter === 'all' ? '' : `?status=${filter}`
    try {
      const r = await fetch(`/api/admin/blog/comments${params}`, { cache: 'no-store' })
      const j = await r.json()
      if (!r.ok) {
        setError(j.error ?? `HTTP ${r.status}`); setRows([])
      } else {
        setRows(Array.isArray(j.comments) ? j.comments : [])
        if (j.counts) setCounts(j.counts)
      }
    } catch (err) {
      setError(`Netwerkfout: ${err instanceof Error ? err.message : 'onbekend'}`)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [filter])

  async function setStatus(id: string, status: Row['status']) {
    setBusy(id)
    try {
      const r = await fetch(`/api/admin/blog/comments/${id}`, {
        method:  'PATCH',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        alert(`Mislukt: ${j.error ?? r.status}`)
        return
      }
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function del(id: string) {
    if (!confirm('Permanent verwijderen? Dit valt niet ongedaan te maken.')) return
    setBusy(id)
    try {
      const r = await fetch(`/api/admin/blog/comments/${id}`, { method: 'DELETE' })
      if (!r.ok) { alert(`Verwijderen mislukt`); return }
      await load()
    } finally { setBusy(null) }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">Blog-reacties</h1>
        <p className="text-sm text-gray-600">Modereer reacties — alleen goedgekeurde zijn publiek zichtbaar.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">Oeps:</p>
          <p className="mt-1">{error}</p>
          {(error.toLowerCase().includes('does not exist') || error.toLowerCase().includes('schema cache')) && (
            <p className="mt-2 text-xs">Tip: run <code className="rounded bg-red-100 px-1">supabase/migration_blog_comments.sql</code>.</p>
          )}
        </div>
      )}

      {/* Counts strip */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CountBox label="Pending" value={counts.pending} color="amber" highlight />
        <CountBox label="Goedgekeurd" value={counts.approved} color="emerald" />
        <CountBox label="Spam" value={counts.spam} color="gray" />
        <CountBox label="Afgewezen" value={counts.rejected} color="gray" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={
              'rounded-full px-3 py-1 text-xs font-medium transition-colors ' +
              (filter === f.value
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-600">Laden…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 py-16 text-center text-gray-600">
          Geen reacties in deze view.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const postUrl = r.blog_posts
              ? (r.blog_posts.locale === 'nl'
                  ? `/blog/${r.blog_posts.slug}`
                  : `/blog/${r.blog_posts.slug}?lang=${r.blog_posts.locale}`)
              : '#'
            return (
              <li key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-semibold text-brand">{r.author_name}</span>
                  <span className="font-mono text-gray-600">{r.author_email}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-600">{new Date(r.created_at).toLocaleString('nl-NL')}</span>
                  <span className="text-gray-400">·</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-700">{r.source_ip}</span>
                  <span className="ml-auto">
                    <StatusPill status={r.status} />
                  </span>
                </div>
                <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                  {r.body}
                </p>
                <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                  <Link
                    href={postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 underline hover:text-brand"
                  >
                    Op: {r.blog_posts?.title ?? r.post_id}
                  </Link>
                  <span className="ml-auto flex flex-wrap gap-2">
                    {r.status !== 'approved' && (
                      <button type="button" disabled={busy === r.id}
                        onClick={() => setStatus(r.id, 'approved')}
                        className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                        ✓ Keur goed
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button type="button" disabled={busy === r.id}
                        onClick={() => setStatus(r.id, 'rejected')}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        ✕ Afwijzen
                      </button>
                    )}
                    {r.status !== 'spam' && (
                      <button type="button" disabled={busy === r.id}
                        onClick={() => setStatus(r.id, 'spam')}
                        className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-800 hover:bg-amber-100 disabled:opacity-50">
                        ⚠ Spam
                      </button>
                    )}
                    <button type="button" disabled={busy === r.id}
                      onClick={() => del(r.id)}
                      className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100 disabled:opacity-50">
                      Verwijder
                    </button>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: Row['status'] }) {
  const cfg: Record<Row['status'], { bg: string; fg: string; label: string }> = {
    pending:  { bg: 'bg-amber-100',   fg: 'text-amber-800',   label: '○ Pending'  },
    approved: { bg: 'bg-emerald-100', fg: 'text-emerald-800', label: '● Live'     },
    spam:     { bg: 'bg-rose-100',    fg: 'text-rose-800',    label: '⚠ Spam'     },
    rejected: { bg: 'bg-gray-100',    fg: 'text-gray-700',    label: '✕ Afgewezen'},
  }
  const c = cfg[status]
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.bg} ${c.fg}`}>{c.label}</span>
}

function CountBox({ label, value, color, highlight }: {
  label: string; value: number; color: 'amber'|'emerald'|'gray'; highlight?: boolean
}) {
  const cls: Record<typeof color, string> = {
    amber:   'border-amber-200 bg-amber-50',
    emerald: 'border-emerald-200 bg-emerald-50',
    gray:    'border-gray-200 bg-gray-50',
  }
  return (
    <div className={`rounded-md border p-3 ${cls[color]} ${highlight && value > 0 ? 'ring-2 ring-amber-400' : ''}`}>
      <p className="text-xs uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand">{value}</p>
    </div>
  )
}
