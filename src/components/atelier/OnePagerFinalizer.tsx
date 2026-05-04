// FILE: src/components/atelier/OnePagerFinalizer.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Mounts on a 'completed' session that does NOT yet have a one-pager.
// Triggers /api/atelier/session/[id]/finalize on first mount, then polls
// the page every 5 seconds via router.refresh() until the parent stops
// rendering this component (because has_one_pager flipped true).
//
// The finalize endpoint is rate-limited (30/h per IP) and deduplicates via
// the has_one_pager check, so accidental double-mounts are safe.

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  sessionId: string
}

export default function OnePagerFinalizer({ sessionId }: Props) {
  const router = useRouter()
  const [secondsSinceMount, setSecondsSinceMount] = useState(0)
  const [error, setError] = useState('')
  const triggered = useRef(false)

  // Kick off Module 5 once on first mount.
  useEffect(() => {
    if (triggered.current) return
    triggered.current = true
    fetch(`/api/atelier/session/${sessionId}/finalize`, { method: 'POST' })
      .then(async res => {
        if (!res.ok && res.status !== 409) {
          const json = await res.json().catch(() => ({})) as { error?: string }
          setError(json.error || `Finalize gaf status ${res.status}.`)
        }
      })
      .catch(() => setError('Finalize-call mislukt — probeer de pagina te verversen.'))
  }, [sessionId])

  // Counter + page-refresh polling, same cadence as SessionAutoRefresh.
  useEffect(() => {
    const tick = setInterval(() => setSecondsSinceMount(s => s + 1), 1000)
    const refresh = setInterval(() => router.refresh(), 5000)
    return () => { clearInterval(tick); clearInterval(refresh) }
  }, [router])

  return (
    <div className="mb-6 rounded-2xl bg-blue-50 border border-blue-200 px-5 py-3 text-sm text-blue-900">
      <div className="flex items-center gap-3">
        <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="font-semibold">
          One-pager wordt nu gegenereerd…
        </span>
        <span className="text-xs ml-auto">
          {secondsSinceMount}s bezig
        </span>
      </div>
      <p className="text-xs text-blue-800/80 mt-1">
        Module 5 draait apart van de orchestrator zodat 'ie zijn eigen tijdsbudget heeft. Pagina vernieuwt elke 5 seconden — zodra de one-pager klaar is verschijnt 'ie hier onderaan.
      </p>
      {error && (
        <p className="text-xs text-red-700 mt-2">
          {error}
        </p>
      )}
    </div>
  )
}
