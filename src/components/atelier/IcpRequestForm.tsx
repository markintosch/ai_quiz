// FILE: src/components/atelier/IcpRequestForm.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Input bar at the top of /atelier/icps. User types keywords ("Gen Z fashion
// B2C Amsterdam"), clicks generate, gets redirected to the new ICP's detail
// page where they can chat-refine.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function IcpRequestForm() {
  const router = useRouter()
  const [keywords, setKeywords] = useState('')
  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState('')

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (busy || keywords.trim().length < 2) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/atelier/icps/request', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ keywords: keywords.trim() }),
      })
      const json = await res.json() as { id?: string; error?: string }
      if (!res.ok || !json.id) {
        setError(json.error || 'Genereren mislukt.')
        setBusy(false)
        return
      }
      router.push(`/atelier/icps/${json.id}`)
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleGenerate} className="rounded-2xl bg-white border border-stone-200 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">
        Aanvraag ICP
      </p>
      <p className="text-sm text-slate-600 mb-3">
        Vul keywords in (bv. <em>&quot;Gen Z fashion B2C Amsterdam&quot;</em> of <em>&quot;CFO mid-market SaaS Benelux&quot;</em>) en krijg een nieuwe ICP. Daarna kun je doorvragen om hem te verfijnen.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="Bv. CMO scale-up SaaS Nederland AI-skepsis"
          maxLength={200}
          disabled={busy}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-base focus:outline-none focus:border-brand-accent transition-colors"
        />
        <button
          type="submit"
          disabled={busy || keywords.trim().length < 2}
          className="px-6 py-3 rounded-xl bg-brand-dark text-white font-semibold hover:bg-brand-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {busy ? 'Bezig…' : 'Genereer ICP →'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {busy && <p className="mt-3 text-xs text-slate-500 italic">Eén ronde duurt typisch 10-30 seconden.</p>}
    </form>
  )
}
