'use client'

// FILE: src/app/Cycle/insights/InsightsClient.tsx

import { useState } from 'react'
import Link from 'next/link'
import type { Insight } from '@/lib/cycle/insights'

export default function InsightsClient({
  insights, totalEntries,
}: {
  insights: Insight[]
  totalEntries: number
}) {
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(insights.length === 0)

  async function next(currentKey: string) {
    try {
      await fetch('/api/cycle/insights/seen', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rule_key: currentKey }),
      })
    } catch { /* best-effort */ }

    if (index + 1 >= insights.length) setDone(true)
    else setIndex(index + 1)
  }

  if (totalEntries < 14) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="cycle-card p-7 max-w-md w-full">
          <h1 className="cycle-display text-3xl mb-2">Nog niet.</h1>
          <p className="text-base mb-2">Patronen verschijnen vanaf 14 dagen invoer.</p>
          <p className="text-sm" style={{ color: 'var(--cycle-muted)' }}>
            Je hebt {totalEntries} {totalEntries === 1 ? 'dag' : 'dagen'} ingevoerd.
          </p>
          <Link href="/Cycle/timeline" className="cycle-button cycle-button-ghost mt-7 inline-block" style={{ textDecoration: 'none' }}>
            Terug naar tijdlijn
          </Link>
        </div>
      </main>
    )
  }

  if (done) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="cycle-card p-7 max-w-md w-full">
          <h1 className="cycle-display text-3xl mb-2">Niets nieuws.</h1>
          <p className="text-base mb-7">Geen duidelijke patronen op dit moment. Ga rustig door.</p>
          <Link href="/Cycle/timeline" className="cycle-button inline-block" style={{ textDecoration: 'none' }}>
            Terug naar tijdlijn
          </Link>
        </div>
      </main>
    )
  }

  const current = insights[index]

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="cycle-card p-7 max-w-md w-full">
        <p className="cycle-display text-3xl mb-2" style={{ lineHeight: 1.15 }}>
          {current.text}
        </p>
        <p className="text-xs mb-7" style={{ color: 'var(--cycle-muted)' }}>
          Gebaseerd op je laatste paar weken.
        </p>
        <div className="flex gap-3">
          <Link
            href="/Cycle/timeline"
            className="cycle-button cycle-button-ghost flex-1 text-center"
            style={{ textDecoration: 'none' }}
          >
            Klaar
          </Link>
          <button className="cycle-button flex-1" onClick={() => next(current.rule_key)}>
            Toon volgende
          </button>
        </div>
      </div>
    </main>
  )
}
