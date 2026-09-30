'use client'

import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

interface Team {
  id: string
  name: string
  submit_token: string
  results_token: string
  segmentation_enabled: boolean
  min_responses: number
  active: boolean
  created_at: string
  submission_count: number
}

interface Feedback {
  id: string
  message: string
  context: string | null
  created_at: string
}

function CopyField({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-gray-500 w-24 shrink-0">{label}</span>
      <input
        readOnly
        value={url}
        onFocus={e => e.currentTarget.select()}
        className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
      />
      <button
        type="button"
        onClick={async () => {
          try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ }
        }}
        className="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 hover:border-brand-accent hover:text-brand-accent transition-colors shrink-0"
      >
        {copied ? 'Gekopieerd' : 'Kopieer'}
      </button>
    </div>
  )
}

export default function AdminMobaPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [segEnabled, setSegEnabled] = useState(true)
  const [minResponses, setMinResponses] = useState(4)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
    void load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/moba')
      const b = await res.json()
      if (res.ok) { setTeams(b.data ?? []); setFeedback(b.feedback ?? []) }
    } finally {
      setLoading(false)
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/moba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code: code.trim() || undefined, segmentationEnabled: segEnabled, minResponses }),
      })
      const b = await res.json()
      if (!res.ok) throw new Error(b.error ?? 'Aanmaken mislukt')
      setTeams(prev => [b.data, ...prev])
      setName('')
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aanmaken mislukt')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">MOBA Marketing Survey</h1>
      <p className="text-sm text-gray-500 mb-8">
        Maak per afname één team aan. Je krijgt een anonieme invul-link (naar het team) en een
        aparte groepsrapport-link (voor in de meeting).
      </p>

      {/* Create form */}
      <form onSubmit={create} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Nieuw team / afname</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Bijv. MOBA Marketing — jaarplan 2027"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Toegangscode (optioneel)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{origin || 'markdekock.com'}/moba/</span>
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="2027"
                className="w-40 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Leeg laten = automatische, onraadbare code. Alleen letters, cijfers en streepjes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={segEnabled} onChange={e => setSegEnabled(e.target.checked)} />
              Segmentatievraag tonen (techniek- vs marktgedreven)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              Rapport zichtbaar vanaf
              <input
                type="number" min={1} value={minResponses}
                onChange={e => setMinResponses(Number(e.target.value))}
                className="w-16 text-sm border border-gray-200 rounded-lg px-2 py-1.5"
              />
              inzendingen
            </label>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit" disabled={creating || !name.trim()}
          className="mt-5 px-6 py-2.5 bg-brand-accent text-white font-semibold rounded-xl disabled:opacity-40 hover:bg-orange-700 transition-all"
        >
          {creating ? 'Aanmaken…' : 'Team aanmaken'}
        </button>
      </form>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Feedback op de demo ({feedback.length})</h2>
          <div className="space-y-2">
            {feedback.map(f => (
              <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{f.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(f.created_at).toLocaleString('nl-NL')}{f.context ? ` · ${f.context}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams list */}
      {loading ? (
        <p className="text-sm text-gray-500">Laden…</p>
      ) : teams.length === 0 ? (
        <p className="text-sm text-gray-500">Nog geen teams aangemaakt.</p>
      ) : (
        <div className="space-y-4">
          {teams.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t.submission_count} inzending{t.submission_count === 1 ? '' : 'en'} ·
                    rapport vanaf {t.min_responses} ·
                    segmentatie {t.segmentation_enabled ? 'aan' : 'uit'}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t.active ? 'actief' : 'gesloten'}
                </span>
              </div>
              <div className="space-y-2">
                <CopyField label="Invul-link" url={`${origin}/moba/${t.submit_token}`} />
                <CopyField label="Groepsrapport" url={`${origin}/moba/results/${t.results_token}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
