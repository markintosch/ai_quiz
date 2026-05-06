'use client'

// FILE: src/app/Cycle/timeline/TimelineClient.tsx
// 28-day horizontal timeline. Phase tint as background band, readiness bar
// height-coded, mood dot, weather + period markers. Tap a day to expand.

import { useMemo, useState } from 'react'
import Link from 'next/link'

interface Entry {
  date: string
  mood: number
  moodVariable: boolean
  readiness: number | null
  phase: string
  period: boolean
  activityTypes: string[]
  intensity: string | null
  alcohol: number
}

interface Weather {
  date: string
  temp: number | null
  condition: string | null
}

const PHASE_COLOR: Record<string, string> = {
  menstrual:      'var(--cycle-menstrual)',
  follicular:     'var(--cycle-follicular)',
  ovulation:      'var(--cycle-ovulation)',
  'luteal-early': 'var(--cycle-luteal-early)',
  'luteal-late':  'var(--cycle-luteal-late)',
  unknown:        'var(--cycle-border)',
}

const CONDITION_ICON: Record<string, string> = {
  sunny: '☀',
  cloudy: '☁',
  rainy: '☂',
  snow: '❄',
  'clear-night': '☾',
}

const PHASE_LABEL_NL: Record<string, string> = {
  menstrual:      'Menstruatie',
  follicular:     'Folliculair',
  ovulation:      'Ovulatie',
  'luteal-early': 'Luteaal — vroeg',
  'luteal-late':  'Luteaal — laat',
  unknown:        'Onbekend',
}

function dateRange(startISO: string, count: number): string[] {
  const days: string[] = []
  const d = new Date(startISO + 'T00:00:00Z')
  for (let i = 0; i < count; i++) {
    days.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return days
}

export default function TimelineClient({
  startDate, todayDate, entries, weather, canShowInsights,
}: {
  startDate: string
  todayDate: string
  entries: Entry[]
  weather: Weather[]
  canShowInsights: boolean
}) {
  const days = useMemo(() => dateRange(startDate, 28), [startDate])
  const entryByDate = useMemo(() => Object.fromEntries(entries.map(e => [e.date, e])), [entries])
  const weatherByDate = useMemo(() => Object.fromEntries(weather.map(w => [w.date, w])), [weather])
  const [selected, setSelected] = useState<string | null>(null)

  const sel = selected ? entryByDate[selected] : null
  const selWeather = selected ? weatherByDate[selected] : null

  return (
    <main className="min-h-screen flex flex-col px-4 py-8">
      <header className="px-2 mb-6 flex items-center justify-between">
        <h1 className="cycle-display text-3xl">Tijdlijn</h1>
        <Link
          href="/Cycle/output"
          className="text-sm underline"
          style={{ color: 'var(--cycle-muted)' }}
        >
          Terug
        </Link>
      </header>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          overflowX: 'auto',
          padding: '4px 8px 16px',
          scrollSnapType: 'x mandatory',
        }}
      >
        {days.map(day => {
          const e = entryByDate[day]
          const w = weatherByDate[day]
          const isToday = day === todayDate
          const heightPct = e?.readiness != null ? Math.max(8, e.readiness) : 0
          const phaseColor = e ? (PHASE_COLOR[e.phase] ?? 'var(--cycle-border)') : 'var(--cycle-border)'
          const dayNum = parseInt(day.slice(8, 10), 10)

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelected(day)}
              data-selected={selected === day}
              style={{
                flex: '0 0 auto',
                width: 28,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                scrollSnapAlign: 'center',
              }}
            >
              <div style={{
                height: 12,
                fontSize: 12,
                textAlign: 'center',
                color: isToday ? 'var(--cycle-accent)' : 'var(--cycle-muted)',
                fontWeight: isToday ? 600 : 400,
              }}>
                {w?.condition ? CONDITION_ICON[w.condition] : ''}
              </div>
              <div
                style={{
                  height: 140,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  position: 'relative',
                  background: phaseColor,
                  opacity: e ? 0.18 : 0.06,
                  borderRadius: 8,
                }}
              />
              <div style={{ position: 'relative', marginTop: -140 + 4, height: 140 }}>
                {e?.readiness != null && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 12,
                      height: `${heightPct}%`,
                      background: phaseColor,
                      borderRadius: 6,
                      transition: 'height 600ms ease-out',
                    }}
                  />
                )}
                {e?.period && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--cycle-menstrual)',
                    }}
                  />
                )}
              </div>
              <div style={{
                marginTop: 6,
                fontSize: 11,
                textAlign: 'center',
                color: isToday ? 'var(--cycle-accent)' : 'var(--cycle-muted)',
                fontWeight: isToday ? 600 : 400,
              }}>
                {dayNum}
              </div>
              {/* Alcohol marker — small wine-red dot below the day number */}
              {e?.alcohol && e.alcohol > 0 && (
                <div
                  aria-label={`${e.alcohol} ${e.alcohol === 1 ? 'glas' : 'glazen'} alcohol`}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#7A2E2E',
                    margin: '3px auto 0',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {sel && (
        <div className="cycle-card p-5 mt-4" style={{ alignSelf: 'center', maxWidth: 380, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="cycle-display text-xl">{selected}</span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cycle-muted)' }}
              aria-label="Sluit"
            >
              ✕
            </button>
          </div>
          <p className="text-sm mb-1">Fase: <strong>{PHASE_LABEL_NL[sel.phase] ?? sel.phase}</strong></p>
          {sel.readiness != null && (
            <p className="text-sm mb-1">Readiness: <strong>{sel.readiness}</strong></p>
          )}
          <p className="text-sm mb-1">
            Stemming: <strong>{sel.mood}/10</strong>
            {sel.moodVariable ? ' (wisselend)' : ''}
          </p>
          {sel.activityTypes.length > 0 && sel.activityTypes[0] !== 'None' && (
            <p className="text-sm mb-1">
              Beweging: <strong>{sel.activityTypes.join(', ')}</strong>
              {sel.intensity ? ` — ${sel.intensity}` : ''}
            </p>
          )}
          {sel.period && <p className="text-sm">Menstruatie ✓</p>}
          {sel.alcohol > 0 && (
            <p className="text-sm">
              Alcohol: <strong>{sel.alcohol === 3 ? '3+' : sel.alcohol} {sel.alcohol === 1 ? 'glas' : 'glazen'}</strong>
            </p>
          )}
          {selWeather?.temp != null && (
            <p className="text-sm" style={{ color: 'var(--cycle-muted)' }}>
              {CONDITION_ICON[selWeather.condition ?? ''] ?? ''} {Math.round(selWeather.temp)}°
            </p>
          )}
        </div>
      )}

      {canShowInsights && (
        <div style={{ marginTop: 'auto', paddingTop: 30, display: 'flex', justifyContent: 'center' }}>
          <Link
            href="/Cycle/insights"
            className="cycle-button"
            style={{ minWidth: 220, textAlign: 'center', textDecoration: 'none' }}
          >
            Vind een patroon
          </Link>
        </div>
      )}
    </main>
  )
}
