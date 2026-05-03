'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewSessionForm() {
  const router = useRouter()
  const [rawBrief, setRawBrief] = useState('')
  const [brandContext, setBrandContext] = useState('')
  const [brandName, setBrandName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [language, setLanguage] = useState<'nl' | 'en' | 'fr'>('nl')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (rawBrief.trim().length < 30) {
      setError('Brief is te kort — minimaal 30 tekens.')
      return
    }
    setRunning(true)
    setProgress('Sessie opstarten + alle 5 modules draaien (~30–60 sec)…')

    try {
      const res = await fetch('/api/atelier/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_brief:     rawBrief,
          brand_context: brandContext || undefined,
          brand_name:    brandName || undefined,
          owner_name:    ownerName || undefined,
          owner_email:   ownerEmail || undefined,
          language,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      const sessionId = json.sessionId
      router.push(`/atelier/session/${sessionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Run mislukt.')
      setRunning(false)
      setProgress(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/40">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">

        <Link href="/atelier" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-accent mb-8">
          ← Terug naar Atelier
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-3 leading-tight">
          Nieuwe brief
        </h1>
        <p className="text-slate-700 leading-relaxed mb-10">
          Plak een brief, voeg optioneel wat brand context toe. Atelier draait alle 5 modules en levert een one-pager.
        </p>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-base font-semibold text-brand-dark mb-2">
              Brief <span className="text-brand-accent">*</span>
            </label>
            <textarea
              value={rawBrief}
              onChange={e => setRawBrief(e.target.value)}
              rows={10}
              placeholder="Plak hier de brief — origineel uit de mail, of paraphrased..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20 font-mono"
              required
            />
            <p className="text-xs text-slate-500 mt-1">{rawBrief.trim().length} tekens · min 30</p>
          </div>

          <div>
            <label className="block text-base font-semibold text-brand-dark mb-2">
              Brand context (optioneel)
            </label>
            <textarea
              value={brandContext}
              onChange={e => setBrandContext(e.target.value)}
              rows={4}
              placeholder="Wat moet Atelier weten over het merk? Positioning, recente keuzes, lopende campagnes..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">Brand naam</label>
              <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)}
                placeholder="bv. Heineken"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">Output taal</label>
              <select value={language} onChange={e => setLanguage(e.target.value as 'nl' | 'en' | 'fr')}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-brand-accent focus:outline-none">
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">Jouw naam</label>
              <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)}
                placeholder="Optioneel — voor je eigen overzicht"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">E-mail</label>
              <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)}
                placeholder="Optioneel"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button type="submit" disabled={running}
              className="w-full md:w-auto bg-brand-dark text-white font-semibold px-8 py-4 rounded-full hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {running ? (progress ?? 'Bezig...') : 'Start sessie →'}
            </button>
            <p className="text-xs text-slate-500 mt-3">
              Eén run = 5 LLM-calls. Duurt 30–60 sec. Tussentijds resultaat wordt opgeslagen in Supabase.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
