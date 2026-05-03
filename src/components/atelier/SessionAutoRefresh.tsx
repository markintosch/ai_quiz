'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  runsCount: number
}

/**
 * While the orchestrator runs in the background (status='running'), poll
 * the page every 5 seconds so completed modules appear progressively.
 * Stops once the page renders status != 'running' (the parent decides
 * whether to mount this component).
 */
export default function SessionAutoRefresh({ runsCount }: Props) {
  const router = useRouter()
  const [secondsSinceMount, setSecondsSinceMount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setSecondsSinceMount(s => s + 1), 1000)
    const refresh = setInterval(() => router.refresh(), 5000)
    return () => { clearInterval(interval); clearInterval(refresh) }
  }, [router])

  return (
    <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-3 text-sm text-amber-900">
      <div className="flex items-center gap-3">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-semibold">
          Sessie loopt — modules verschijnen één voor één.
        </span>
        <span className="text-xs ml-auto">
          {runsCount} {runsCount === 1 ? 'module gestart' : 'modules gestart'} · {secondsSinceMount}s bezig
        </span>
      </div>
      <p className="text-xs text-amber-800/80 mt-1">
        Pagina vernieuwt automatisch elke 5 seconden. Een complete sessie duurt typisch 60–120 seconden.
      </p>
    </div>
  )
}
