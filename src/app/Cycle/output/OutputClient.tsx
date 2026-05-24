'use client'

// FILE: src/app/Cycle/output/OutputClient.tsx

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ReadinessBand } from '@/lib/cycle/types'

const CONDITION_ICON: Record<string, string> = {
  sunny:         '☀',
  cloudy:        '☁',
  rainy:         '☂',
  snow:          '❄',
  'clear-night': '☾',
}

const METRIC_LABEL_NL: Record<string, string> = {
  sleep:     'slaap',
  mood:      'stemming',
  readiness: 'readiness',
  stress:    'stress',
}

export default function OutputClient({
  readiness, band, guidance, phaseLabel, components, weather, feedback,
  showScore, totalEntries, experiment,
}: {
  readiness: number
  band: ReadinessBand
  guidance: string
  phaseLabel: string
  components: { sleep: number; cycle: number; activity: number; stress: number }
  weather: { temp_c: number; condition: string } | null
  feedback: -1 | 0 | 1 | null
  showScore: boolean
  totalEntries: number
  experiment: {
    description: string
    metric: string
    dayOfTotal: string
    daysRemaining: number
  } | null
}) {
  const [shown, setShown] = useState(0)
  const [whyOpen, setWhyOpen] = useState(false)
  const [thumbs, setThumbs] = useState<-1 | 0 | 1 | null>(feedback)

  // Animated count-up on mount.
  useEffect(() => {
    if (!showScore) return
    const duration = 900
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(readiness * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [readiness, showScore])

  async function setFeedback(value: -1 | 1) {
    const next = thumbs === value ? 0 : value
    setThumbs(next)
    try {
      await fetch('/api/cycle/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ feedback: next }),
      })
    } catch {
      // best-effort
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-10">
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center">

        {/* Active experiment banner from Peri-Compass */}
        {experiment && (
          <div className="cycle-card" style={{
            width: '100%',
            padding: 14,
            marginBottom: 22,
            borderColor: 'var(--cycle-accent)',
            borderWidth: 1,
          }}>
            <p className="text-xs mb-1" style={{ color: 'var(--cycle-accent)', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Experiment · dag {experiment.dayOfTotal}
            </p>
            <p className="text-sm" style={{ color: 'var(--cycle-fg)', lineHeight: 1.45 }}>
              {experiment.description}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--cycle-muted)' }}>
              We meten je {METRIC_LABEL_NL[experiment.metric] ?? experiment.metric} over deze 30 dagen — nog {experiment.daysRemaining} {experiment.daysRemaining === 1 ? 'dag' : 'dagen'}.
            </p>
          </div>
        )}

        {showScore ? (
          <>
            <div className="cycle-display" style={{
              fontSize: 144,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: 'var(--cycle-fg)',
            }}>
              {shown}
            </div>
            <p className="text-base text-center mt-3 mb-7" style={{ maxWidth: 320 }}>
              {guidance}
            </p>
          </>
        ) : (
          <>
            <p className="cycle-display text-4xl text-center mb-4">
              We leren je ritme.
            </p>
            <p className="text-sm text-center mb-7" style={{ color: 'var(--cycle-muted)', maxWidth: 280 }}>
              Nog {Math.max(0, 3 - totalEntries)} {totalEntries === 2 ? 'dag' : 'dagen'} tot je eerste readiness-score.
            </p>
          </>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="cycle-chip" style={{ pointerEvents: 'none' }}>{phaseLabel}</span>
          {weather && (
            <span className="cycle-chip" style={{ pointerEvents: 'none' }}>
              {CONDITION_ICON[weather.condition] ?? '·'} {Math.round(weather.temp_c)}°
            </span>
          )}
        </div>

        {showScore && (
          <button
            type="button"
            className="cycle-button cycle-button-ghost"
            style={{ marginTop: 22, fontSize: 14, minHeight: 'auto', padding: '8px 14px' }}
            onClick={() => setWhyOpen(o => !o)}
            aria-expanded={whyOpen}
          >
            {whyOpen ? 'Verberg uitleg' : 'Waarom?'}
          </button>
        )}

        {whyOpen && showScore && (
          <div className="cycle-card p-5 mt-4" style={{ width: '100%' }}>
            <ComponentBar label="Slaap"     value={components.sleep}    />
            <ComponentBar label="Cyclus"    value={components.cycle}    />
            <ComponentBar label="Beweging"  value={components.activity} />
            <ComponentBar label="Stress"    value={components.stress}   />
          </div>
        )}

        {showScore && (
          <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="text-sm" style={{ color: 'var(--cycle-muted)' }}>
              Past dit bij hoe je je voelt?
            </span>
            <button
              type="button"
              aria-label="Klopt"
              onClick={() => setFeedback(1)}
              className="cycle-chip"
              data-selected={thumbs === 1 ? 'true' : 'false'}
              style={{ minHeight: 'auto', padding: '6px 12px' }}
            >
              ✓
            </button>
            <button
              type="button"
              aria-label="Klopt niet"
              onClick={() => setFeedback(-1)}
              className="cycle-chip"
              data-selected={thumbs === -1 ? 'true' : 'false'}
              style={{ minHeight: 'auto', padding: '6px 12px' }}
            >
              ✗
            </button>
          </div>
        )}
      </div>

      <nav style={{ display: 'flex', gap: 14, marginTop: 30 }}>
        <Link href="/Cycle/today?edit=1" className="text-sm underline" style={{ color: 'var(--cycle-muted)' }}>
          Bewerken
        </Link>
        <Link href="/Cycle/timeline" className="text-sm underline" style={{ color: 'var(--cycle-muted)' }}>
          Tijdlijn
        </Link>
        <Link href="/Cycle/settings" className="text-sm underline" style={{ color: 'var(--cycle-muted)' }}>
          Instellingen
        </Link>
      </nav>
    </main>
  )
}

function ComponentBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: 'var(--cycle-muted)' }}>{Math.round(value)}</span>
      </div>
      <div style={{
        height: 6,
        borderRadius: 4,
        background: 'var(--cycle-border)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: 'var(--cycle-accent)',
          transition: 'width 600ms ease-out',
        }} />
      </div>
    </div>
  )
}
