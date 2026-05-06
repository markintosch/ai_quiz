'use client'

import { useState } from 'react'

export default function AlcoholStepDemo() {
  const [alcohol, setAlcohol] = useState<number>(0)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        {/* Progress dots — step 5 of 6 */}
        <div className="flex justify-center gap-2 mb-7">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <span
              key={n}
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: n <= 5 ? 'var(--cycle-accent)' : 'var(--cycle-border)',
              }}
            />
          ))}
        </div>

        <div className="cycle-card p-7">
          <h1 className="cycle-display text-3xl mb-1">Glazen alcohol gisteren?</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--cycle-muted)' }}>
            Wijn, bier, sterk — telt allemaal.
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            {[0, 1, 2, 3].map(n => (
              <button
                key={n}
                type="button"
                className="cycle-chip"
                data-selected={alcohol === n ? 'true' : 'false'}
                onClick={() => setAlcohol(n)}
                style={{ flex: 1 }}
              >
                {n === 3 ? '3+' : n}
              </button>
            ))}
          </div>

          <p className="text-xs mt-2" style={{ color: 'var(--cycle-muted)' }}>
            Niet als oordeel — alleen om te zien wat het met je slaap doet.
          </p>

          <div className="flex gap-3 mt-7">
            <button className="cycle-button cycle-button-ghost flex-1" type="button">Terug</button>
            <button className="cycle-button flex-1" type="button">Volgende</button>
          </div>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--cycle-muted)' }}>
          Demo — terug via /Cycle/demo
        </p>
      </div>
    </main>
  )
}
