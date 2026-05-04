'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  sessionId:      string
  /** ISO timestamp of the oldest data_fetched_at in the session */
  oldestFetchedAt: string | null
}

const STALE_THRESHOLD_DAYS = 7

export default function RefreshDataBanner({ sessionId, oldestFetchedAt }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!oldestFetchedAt) return null

  const ageHours = (Date.now() - new Date(oldestFetchedAt).getTime()) / (1000 * 60 * 60)
  const ageDays = ageHours / 24
  const isStale = ageDays >= STALE_THRESHOLD_DAYS

  const ageLabel = ageHours < 1
    ? 'minder dan een uur geleden'
    : ageHours < 24
    ? `${Math.round(ageHours)} ${Math.round(ageHours) === 1 ? 'uur' : 'uur'} geleden`
    : `${Math.round(ageDays)} ${Math.round(ageDays) === 1 ? 'dag' : 'dagen'} geleden`

  async function handleRefresh() {
    if (!confirm('Audience signals + live signals worden opnieuw opgehaald (CBS, Reddit, web search). Bestaande Tension/Output blijven staan. Doorgaan?')) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/atelier/session/${sessionId}/refresh`, { method: 'POST' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh mislukt.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`mb-6 rounded-2xl px-5 py-3 text-sm border ${
      isStale ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-stone-100 border-stone-200 text-stone-700'
    }`}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`inline-block h-2 w-2 rounded-full ${isStale ? 'bg-amber-500' : 'bg-stone-400'}`} />
        <span>
          Externe bronnen voor het laatst opgehaald: <strong>{ageLabel}</strong>
          {isStale && ' — verouderd, ververs voor recentere signalen.'}
        </span>
        <button
          onClick={handleRefresh}
          disabled={busy}
          className={`ml-auto text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
            isStale
              ? 'bg-brand-accent text-white hover:bg-orange-700'
              : 'bg-white text-brand-dark border border-stone-300 hover:bg-stone-50'
          }`}
        >
          {busy ? '…' : 'Bronnen vernieuwen'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  )
}
