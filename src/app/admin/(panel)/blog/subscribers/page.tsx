// FILE: src/app/admin/blog/subscribers/page.tsx
// Admin: blog newsletter subscribers list.

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Subscriber = {
  id:                string
  email:             string
  locale:            'nl' | 'en' | 'de'
  confirmed:         boolean
  confirmed_at:      string | null
  unsubscribed_at:   string | null
  source_path:       string | null
  source_post_id:    string | null
  created_at:        string
}
type Counts = { confirmed: number; pending: number; unsubscribed: number; total: number }

const FILTERS = [
  { value: 'all',          label: 'Alle'           },
  { value: 'confirmed',    label: 'Bevestigd'      },
  { value: 'pending',      label: 'Pending opt-in' },
  { value: 'unsubscribed', label: 'Uitgeschreven'  },
] as const

export default function AdminBlogSubscribers() {
  const [filter, setFilter] = useState<typeof FILTERS[number]['value']>('all')
  const [rows,   setRows]   = useState<Subscriber[]>([])
  const [counts, setCounts] = useState<Counts>({ confirmed: 0, pending: 0, unsubscribed: 0, total: 0 })
  const [loading,setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const params = filter === 'all' ? '' : `?status=${filter}`
    const r = await fetch(`/api/admin/blog/subscribers${params}`, { cache: 'no-store' })
    const j = await r.json()
    setRows(Array.isArray(j.subscribers) ? j.subscribers : [])
    if (j.counts) setCounts(j.counts)
    setLoading(false)
  }
  useEffect(() => { void load() }, [filter])

  async function del(id: string, email: string) {
    if (!confirm(`Permanent verwijderen: ${email}? AVG-recht: gebruik dit voor "vergeten" verzoeken.`)) return
    const r = await fetch(`/api/admin/blog/subscribers?id=${id}`, { method: 'DELETE' })
    if (r.ok) load()
    else alert('Verwijderen mislukt.')
  }

  function downloadCsv() {
    const header = ['email','locale','status','confirmed_at','unsubscribed_at','source_path','created_at']
    const lines  = rows.map(r => [
      r.email,
      r.locale,
      r.unsubscribed_at ? 'unsubscribed' : (r.confirmed ? 'confirmed' : 'pending'),
      r.confirmed_at ?? '',
      r.unsubscribed_at ?? '',
      r.source_path ?? '',
      r.created_at,
    ].map(csvCell).join(','))
    const csv  = [header.join(','), ...lines].join('\n')
    const url  = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a    = document.createElement('a')
    a.href = url; a.download = `blog-subscribers-${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/blog" className="text-sm text-gray-600 hover:text-brand">← Blog</Link>
          <h1 className="mt-1 text-2xl font-bold text-brand">Blog-abonnees</h1>
          <p className="text-sm text-gray-600">Double opt-in via Resend. Lijst is vrij om te exporteren naar je e-mailtool.</p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={rows.length === 0}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          ⬇ CSV ({rows.length})
        </button>
      </div>

      {/* Counts strip */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CountBox label="Bevestigd"      value={counts.confirmed}    color="emerald" />
        <CountBox label="Pending opt-in" value={counts.pending}      color="amber"   />
        <CountBox label="Uitgeschreven"  value={counts.unsubscribed} color="gray"    />
        <CountBox label="Totaal"         value={counts.total}        color="brand"   />
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
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
          Geen abonnees in deze view.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">E-mail</th>
                <th className="px-4 py-3 text-left font-medium">Taal</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Bron</th>
                <th className="px-4 py-3 text-left font-medium">Aangemeld</th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((r) => {
                const status = r.unsubscribed_at ? 'unsubscribed' : (r.confirmed ? 'confirmed' : 'pending')
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">{r.email}</td>
                    <td className="px-4 py-3 text-gray-700">{r.locale.toUpperCase()}</td>
                    <td className="px-4 py-3">
                      {status === 'confirmed' && <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">● Bevestigd</span>}
                      {status === 'pending'   && <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">○ Pending</span>}
                      {status === 'unsubscribed' && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">↩ Uitgeschreven</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.source_path ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(r.created_at).toLocaleDateString('nl-NL', { year:'numeric', month:'short', day:'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => del(r.id, r.email)}
                        className="text-xs text-red-600 hover:text-red-700"
                        title="Permanent verwijderen (AVG)"
                      >
                        Verwijderen
                      </button>
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

function CountBox({ label, value, color }: { label: string; value: number; color: 'emerald'|'amber'|'gray'|'brand' }) {
  const cls: Record<typeof color, string> = {
    emerald: 'border-emerald-200 bg-emerald-50',
    amber:   'border-amber-200 bg-amber-50',
    gray:    'border-gray-200 bg-gray-50',
    brand:   'border-brand/30 bg-brand/5',
  }
  return (
    <div className={`rounded-md border p-3 ${cls[color]}`}>
      <p className="text-xs uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand">{value}</p>
    </div>
  )
}

function csvCell(v: string): string {
  // RFC 4180-ish quoting
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}
