// FILE: src/app/admin/summercourse/questions/page.tsx
// Admin: vragen die binnenkomen via het formulier op /summercourse.

'use client'

import { useEffect, useState } from 'react'

type Status = 'new' | 'answered' | 'spam'

interface Row {
  id:          string
  email:       string
  message:     string
  status:      Status
  ip:          string | null
  user_agent:  string | null
  answered_at: string | null
  created_at:  string
}

type Counts = { new: number; answered: number; spam: number }

const FILTERS: { value: Status | 'all'; label: string }[] = [
  { value: 'new',      label: 'Nieuw' },
  { value: 'answered', label: 'Beantwoord' },
  { value: 'spam',     label: 'Spam' },
  { value: 'all',      label: 'Alles' },
]

export default function AdminSummerCourseQuestionsPage() {
  const [filter,  setFilter]  = useState<Status | 'all'>('new')
  const [rows,    setRows]    = useState<Row[]>([])
  const [counts,  setCounts]  = useState<Counts>({ new: 0, answered: 0, spam: 0 })
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [busy,    setBusy]    = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    const params = filter === 'all' ? '' : `?status=${filter}`
    try {
      const r = await fetch(`/api/admin/summercourse/questions${params}`, { cache: 'no-store' })
      const j = await r.json()
      if (!r.ok) {
        setError(j.error ?? `HTTP ${r.status}`)
        setRows([])
      } else {
        setRows(Array.isArray(j.questions) ? j.questions : [])
        if (j.counts) setCounts(j.counts)
      }
    } catch (err) {
      setError(`Netwerkfout: ${err instanceof Error ? err.message : 'onbekend'}`)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(id: string, status: Status) {
    setBusy(id)
    try {
      const r = await fetch(`/api/admin/summercourse/questions/${id}`, {
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
    if (!confirm('Permanent verwijderen?')) return
    setBusy(id)
    try {
      const r = await fetch(`/api/admin/summercourse/questions/${id}`, { method: 'DELETE' })
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">Summer Course · vragen</h1>
        <p className="text-sm text-gray-600 mt-1">
          Vragen die bezoekers via het formulier op{' '}
          <a href="/summercourse#vragen" target="_blank" className="text-brand-accent underline">
            /summercourse
          </a>{' '}
          sturen. Bij elke nieuwe vraag krijg je een mail op mark@brandpwrdmedia.com.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => {
          const active = filter === f.value
          const count =
            f.value === 'all'
              ? counts.new + counts.answered + counts.spam
              : counts[f.value]
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand'
              }`}
            >
              {f.label}
              <span className={`ml-2 text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600 text-sm">Laden…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-600 text-sm">Geen vragen met dit filter.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <article
              key={r.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <div>
                  <a
                    href={`mailto:${r.email}`}
                    className="font-semibold text-brand hover:underline"
                  >
                    {r.email}
                  </a>
                  <span className="ml-2 text-xs text-gray-600">
                    {new Date(r.created_at).toLocaleString('nl-NL', {
                      timeZone: 'Europe/Amsterdam',
                    })}
                  </span>
                </div>
                <span
                  className={`text-xs uppercase tracking-wide font-bold px-2 py-0.5 rounded ${
                    r.status === 'new'
                      ? 'bg-orange-100 text-orange-800'
                      : r.status === 'answered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {r.status}
                </span>
              </header>

              <p className="text-gray-800 whitespace-pre-wrap text-[15px] leading-relaxed">
                {r.message}
              </p>

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                {r.status !== 'answered' && (
                  <button
                    disabled={busy === r.id}
                    onClick={() => setStatus(r.id, 'answered')}
                    className="px-3 py-1 text-sm font-medium rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Markeer beantwoord
                  </button>
                )}
                {r.status !== 'new' && (
                  <button
                    disabled={busy === r.id}
                    onClick={() => setStatus(r.id, 'new')}
                    className="px-3 py-1 text-sm font-medium rounded bg-white border border-gray-300 text-gray-700 hover:border-brand disabled:opacity-50"
                  >
                    Terug naar nieuw
                  </button>
                )}
                {r.status !== 'spam' && (
                  <button
                    disabled={busy === r.id}
                    onClick={() => setStatus(r.id, 'spam')}
                    className="px-3 py-1 text-sm font-medium rounded bg-white border border-gray-300 text-gray-700 hover:border-red-400 disabled:opacity-50"
                  >
                    Spam
                  </button>
                )}
                <a
                  href={`mailto:${r.email}?subject=Re: je vraag over de Summer Course&body=Hoi,%0D%0A%0D%0A`}
                  className="px-3 py-1 text-sm font-medium rounded bg-brand-accent text-white hover:opacity-90"
                >
                  Beantwoord per mail
                </a>
                <button
                  disabled={busy === r.id}
                  onClick={() => del(r.id)}
                  className="px-3 py-1 text-sm font-medium rounded text-red-600 hover:bg-red-50 disabled:opacity-50 ml-auto"
                >
                  Verwijder
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
