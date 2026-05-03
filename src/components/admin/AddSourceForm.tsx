'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORY_LABELS: Record<string, string> = {
  reference:     'Reference (creative archive)',
  street_signal: 'Street Signal (live feed / listening)',
  ground_truth:  'Ground Truth (research / data)',
  web:           'Web search provider',
  inferred:      'Inferred (model knowledge)',
}

const CATEGORY_HINTS: Record<string, string> = {
  reference:     'bv. "Tomas archive — 2024 cases" of "NRC creatief archief". Beschrijving + URL als beschikbaar.',
  street_signal: 'bv. "Brandwatch query: NL fashion mentions". URL of API-handle.',
  ground_truth:  'bv. "GfK NL trendbarometer 2025" of "Eigen klanttevredenheidsonderzoek".',
  web:           'bv. "SerpAPI" of "Anthropic web_search beta-feature". Niet voor seed-corpus — die bestaat al.',
  inferred:      '(zelden toegevoegd — dit is altijd Claude knowledge fallback)',
}

export default function AddSourceForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<string>('reference')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (name.trim().length < 2) {
      setError('Naam moet minimaal 2 tekens zijn.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/admin/atelier/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, name, description, url, notes }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setName(''); setDescription(''); setUrl(''); setNotes('')
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Toevoegen mislukt.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-brand-dark text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-brand-accent transition-colors"
      >
        + Nieuwe bron toevoegen
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3 mb-6">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-brand-dark">Nieuwe bron toevoegen</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-gray-800">Annuleer</button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Categorie</label>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-brand-accent focus:outline-none">
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <p className="text-xs text-gray-500 mt-1 italic">{CATEGORY_HINTS[category]}</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Naam *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="bv. Tomas archive · 2024 cases"
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Beschrijving</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          rows={2}
          placeholder="Wat dekt deze bron — categorie, periode, taal, omvang..."
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">URL (optioneel)</label>
        <input type="url" value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Notities (intern)</label>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Mark's notitie — bv. ingangsdatum, contact, status"
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20" />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="pt-2">
        <button type="submit" disabled={busy || name.trim().length < 2}
          className="bg-brand-dark text-white font-semibold px-5 py-2 rounded-full text-sm hover:bg-brand-accent disabled:opacity-50">
          {busy ? '…' : 'Toevoegen'}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Een nieuwe bron wordt direct opgeslagen maar nog niet automatisch door modules gebruikt — daar volgt nog wiring voor (per categorie verschillend: archief-corpus, listening-feed integratie, etc.).
        </p>
      </div>
    </form>
  )
}
