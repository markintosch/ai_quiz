'use client'

// FILE: src/app/Cycle/onboarding/OnboardingClient.tsx
// Three-step onboarding: cycle, location, reminder.

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface GeocodeHit {
  name: string
  country: string
  admin1?: string
  lat: number
  lon: number
  timezone: string
}

export default function OnboardingClient() {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)

  const [step, setStep]              = useState<1 | 2 | 3>(1)
  const [lastPeriod, setLastPeriod]  = useState<string>(today)
  const [typicalLength, setLength]   = useState<number>(28)
  const [cityQuery, setCityQuery]    = useState<string>('')
  const [hits, setHits]              = useState<GeocodeHit[]>([])
  const [chosen, setChosen]          = useState<GeocodeHit | null>(null)
  const [reminderTime, setReminder]  = useState<string>('20:00')
  const [submitting, setSubmitting]  = useState(false)
  const [error, setError]            = useState<string>('')

  async function searchCity(q: string) {
    setCityQuery(q)
    setChosen(null)
    if (q.trim().length < 2) { setHits([]); return }
    try {
      const res = await fetch(`/api/cycle/geocode?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setHits(json.results ?? [])
    } catch {
      setHits([])
    }
  }

  async function submit() {
    if (!chosen) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/cycle/onboarding', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          last_period_start: lastPeriod,
          typical_length:    typicalLength,
          lat:               chosen.lat,
          lon:               chosen.lon,
          timezone:          chosen.timezone,
          reminder_time:     reminderTime,
        }),
      })
      if (!res.ok) {
        setError('Opslaan mislukt. Probeer opnieuw.')
        setSubmitting(false)
        return
      }
      router.push('/Cycle/today')
    } catch {
      setError('Geen verbinding. Probeer opnieuw.')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-7">
          {[1, 2, 3].map(n => (
            <span
              key={n}
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: n <= step ? 'var(--cycle-accent)' : 'var(--cycle-border)',
              }}
            />
          ))}
        </div>

        <div className="cycle-card p-7">
          {step === 1 && (
            <div>
              <h1 className="cycle-display text-3xl mb-1">Welkom.</h1>
              <p className="text-sm mb-5" style={{ color: 'var(--cycle-muted)' }}>
                Een persoonlijke tool, alleen voor jou.
              </p>

              <p className="text-sm mb-6" style={{ lineHeight: 1.6 }}>
                Dagelijks dertig seconden invullen — stemming, slaap, beweging, eventueel een glas wijn.
                Per dag krijg je een readiness-score, en over de weken heen ontstaat een tijdlijn
                waarin trends zichtbaar worden die specifiek voor <em>jou</em> gelden. Niets wordt
                gedeeld. We beginnen met je cyclus, omdat die de achtergrond is waartegen alles
                meebeweegt.
              </p>

              <label className="block text-sm mb-2 font-medium">Wanneer begon je laatste menstruatie?</label>
              <input
                type="date"
                className="cycle-input mb-6"
                value={lastPeriod}
                max={today}
                onChange={e => setLastPeriod(e.target.value)}
              />

              <label className="block text-sm mb-2 font-medium">
                Hoe lang is je gemiddelde cyclus? <span className="cycle-display text-xl ml-2">{typicalLength}</span> dagen
              </label>
              <input
                type="range"
                min={21}
                max={45}
                step={1}
                value={typicalLength}
                onChange={e => setLength(Number(e.target.value))}
                className="cycle-slider mb-3"
              />

              <p className="text-xs mb-6" style={{ color: 'var(--cycle-muted)' }}>
                Niet zeker? Vul gewoon je beste schatting in — alle waarden zijn later aanpasbaar in Instellingen.
              </p>

              <button
                className="cycle-button w-full"
                onClick={() => setStep(2)}
                disabled={!lastPeriod}
              >
                Volgende
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="cycle-display text-3xl mb-1">Waar woon je?</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--cycle-muted)' }}>
                Voor het weer in de tijdlijn.
              </p>

              <input
                type="text"
                className="cycle-input mb-3"
                placeholder="Amsterdam"
                value={cityQuery}
                onChange={e => searchCity(e.target.value)}
                autoFocus
              />

              {hits.length > 0 && !chosen && (
                <ul className="mb-3" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {hits.map((h, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="cycle-chip w-full"
                        style={{ justifyContent: 'flex-start' }}
                        onClick={() => { setChosen(h); setCityQuery(h.name); setHits([]) }}
                      >
                        {h.name}{h.admin1 ? `, ${h.admin1}` : ''} — {h.country}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {chosen && (
                <p className="text-sm mb-6" style={{ color: 'var(--cycle-muted)' }}>
                  Gekozen: {chosen.name}, {chosen.country}
                </p>
              )}

              <div className="flex gap-3">
                <button className="cycle-button cycle-button-ghost flex-1" onClick={() => setStep(1)}>
                  Terug
                </button>
                <button className="cycle-button flex-1" onClick={() => setStep(3)} disabled={!chosen}>
                  Volgende
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="cycle-display text-3xl mb-1">Herinnering.</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--cycle-muted)' }}>
                Wanneer wil je een mailtje om in te checken?
              </p>

              <label className="block text-sm mb-2 font-medium">Tijdstip</label>
              <input
                type="time"
                className="cycle-input mb-7"
                value={reminderTime}
                onChange={e => setReminder(e.target.value)}
              />

              <div className="flex gap-3">
                <button className="cycle-button cycle-button-ghost flex-1" onClick={() => setStep(2)} disabled={submitting}>
                  Terug
                </button>
                <button className="cycle-button flex-1" onClick={submit} disabled={submitting}>
                  {submitting ? 'Bezig…' : 'Klaar'}
                </button>
              </div>

              {error && (
                <p className="text-sm mt-3" style={{ color: 'var(--cycle-accent)' }}>{error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
