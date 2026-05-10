'use client'

import { useState } from 'react'
import { SYMPTOM_GROUPS_NL, SYMPTOM_LABEL_NL, type SymptomKey } from '@/lib/cycle/symptoms'

export default function SymptomsStepDemo() {
  const [symptoms, setSymptoms] = useState<SymptomKey[]>([])

  function toggle(k: SymptomKey) {
    setSymptoms(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        {/* 7-step progress, step 5 active */}
        <div className="flex justify-center gap-2 mb-7">
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
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
          <h1 className="cycle-display text-3xl mb-1">Iets opvallends?</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--cycle-muted)' }}>
            Tik aan wat je vandaag voelt. Niets? Klik 'Niets vandaag'.
          </p>

          <button
            type="button"
            className="cycle-button cycle-button-ghost w-full mb-5"
            onClick={() => setSymptoms([])}
            style={{ minHeight: 'auto', padding: '10px 14px', fontSize: 14 }}
          >
            Niets vandaag →
          </button>

          {SYMPTOM_GROUPS_NL.map(group => (
            <div key={group.label} style={{ marginBottom: 16 }}>
              <p className="cycle-display" style={{ fontSize: 17, marginBottom: 8, color: 'var(--cycle-muted)' }}>
                {group.label}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {group.keys.map(k => (
                  <button
                    key={k}
                    type="button"
                    className="cycle-chip"
                    data-selected={symptoms.includes(k) ? 'true' : 'false'}
                    onClick={() => toggle(k)}
                    style={{ minHeight: 'auto', padding: '8px 12px', fontSize: 14 }}
                  >
                    {SYMPTOM_LABEL_NL[k]}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 mt-4">
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
