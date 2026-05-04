// FILE: src/components/atelier/SessionFailedBanner.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Shown when a session ends up in 'failed' status (either the orchestrator
// errored, or the auto-cleanup in the session page marked it failed because
// it ran past the Vercel maxDuration ceiling). Gives the user a one-click
// "try again" that resubmits the original brief and navigates to the new
// session.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  rawBrief:      string
  brandContext:  string | null
  brandName:     string | null
  language:      string
  reason?:       'timeout' | 'error'  // controls the explanatory line
}

export default function SessionFailedBanner({
  rawBrief, brandContext, brandName, language, reason,
}: Props) {
  const router = useRouter()
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  async function handleRestart() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/atelier/run', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          raw_brief:     rawBrief,
          brand_context: brandContext ?? undefined,
          brand_name:    brandName    ?? undefined,
          language,
        }),
      })
      const json = await res.json() as { sessionId?: string; error?: string }
      if (!res.ok || !json.sessionId) {
        setError(json.error || 'Opnieuw starten mislukt.')
        setBusy(false)
        return
      }
      router.push(`/atelier/session/${json.sessionId}`)
    } catch {
      setError('Er ging iets mis. Probeer over een minuut opnieuw.')
      setBusy(false)
    }
  }

  const explainer = reason === 'timeout'
    ? 'De sessie liep langer dan 5 minuten en is door de host afgebroken. De brief en context zijn bewaard — je kunt direct opnieuw starten.'
    : 'De orchestrator gaf een fout. De brief en context zijn bewaard — je kunt opnieuw proberen of de brief licht aanpassen.'

  return (
    <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
        <span className="font-semibold text-red-900">
          Sessie afgebroken
        </span>
      </div>
      <p className="text-sm text-red-900/85 mb-3">
        {explainer}
      </p>
      {error && (
        <p className="text-sm text-red-700 mb-3">{error}</p>
      )}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleRestart}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? 'Bezig…' : 'Probeer opnieuw →'}
        </button>
        <a
          href="/atelier"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-900 text-sm font-medium hover:bg-red-100 transition-colors"
        >
          ← Terug naar Atelier
        </a>
      </div>
    </div>
  )
}
