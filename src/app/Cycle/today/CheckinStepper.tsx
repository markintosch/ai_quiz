'use client'

// FILE: src/app/Cycle/today/CheckinStepper.tsx
// 5-step daily check-in. Auto-saves nothing locally; on the final step we
// POST the whole entry to /api/cycle/checkin which computes phase + score
// and writes the row.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ActivityType, ActivityIntensity } from '@/lib/cycle/types'
import { SYMPTOM_GROUPS_NL, SYMPTOM_LABEL_NL, type SymptomKey } from '@/lib/cycle/symptoms'

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  None:     'Rust',
  Walk:     'Wandelen',
  Run:      'Hardlopen',
  Cycle:    'Fietsen',
  Strength: 'Kracht',
  Yoga:     'Yoga',
  Other:    'Anders',
}

const INTENSITY_LABELS: Record<ActivityIntensity, string> = {
  Low:    'Licht',
  Medium: 'Gemiddeld',
  High:   'Pittig',
}

type SymptomIntensity = 1 | 2 | 3 | 4 | 5

interface InitialEntry {
  mood_score: number
  mood_variable: boolean
  sleep: number
  stress: number
  activity_types: ActivityType[]
  activity_intensity: ActivityIntensity | null
  alcohol_glasses: number
  symptoms: Partial<Record<SymptomKey, SymptomIntensity>>
  nap_taken: boolean
  busy_day: boolean
  menstruation_flag: boolean
}

export default function CheckinStepper({
  today,
  initial,
}: {
  today: string
  initial: InitialEntry | null
}) {
  const router = useRouter()

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1)
  const [mood, setMood]                 = useState<number>(initial?.mood_score ?? 5)
  const [moodVariable, setMoodVariable] = useState<boolean>(initial?.mood_variable ?? false)
  const [sleep, setSleep]               = useState<number>(initial?.sleep ?? 7)
  const [napTaken, setNapTaken]         = useState<boolean>(initial?.nap_taken ?? false)
  const [activityTypes, setTypes]       = useState<ActivityType[]>(initial?.activity_types ?? ['None'])
  const [intensity, setIntensity]       = useState<ActivityIntensity | null>(initial?.activity_intensity ?? null)
  const [stress, setStress]             = useState<number>(initial?.stress ?? 5)
  const [busyDay, setBusyDay]           = useState<boolean>(initial?.busy_day ?? false)
  const [symptoms, setSymptoms]         = useState<Partial<Record<SymptomKey, SymptomIntensity>>>(initial?.symptoms ?? {})
  const [alcohol, setAlcohol]           = useState<number>(initial?.alcohol_glasses ?? 0)
  const [period, setPeriod]             = useState<boolean>(initial?.menstruation_flag ?? false)
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState<string>('')

  function toggleSymptom(k: SymptomKey) {
    setSymptoms(prev => {
      if (prev[k] != null) {
        const { [k]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [k]: 3 as SymptomIntensity }   // default intensity = 3
    })
  }

  function setSymptomIntensity(k: SymptomKey, n: SymptomIntensity) {
    setSymptoms(prev => prev[k] != null ? { ...prev, [k]: n } : prev)
  }

  const isRest = activityTypes.length === 1 && activityTypes[0] === 'None'

  function toggleType(t: ActivityType) {
    setTypes(prev => {
      if (t === 'None') return ['None']
      const without = prev.filter(p => p !== 'None' && p !== t)
      return prev.includes(t) ? (without.length ? without : ['None']) : [...without, t]
    })
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/cycle/checkin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          entry_date:         today,
          mood_score:         mood,
          mood_variable:      moodVariable,
          sleep,
          stress,
          activity_types:     activityTypes,
          activity_intensity: isRest ? null : intensity,
          alcohol_glasses:    alcohol,
          symptoms:           Object.keys(symptoms),       // string[] presence
          symptom_intensities: symptoms,                   // { key: 1-5 }
          nap_taken:          napTaken,
          busy_day:           busyDay,
          menstruation_flag:  period,
        }),
      })
      if (!res.ok) {
        setError('Opslaan mislukt. Probeer opnieuw.')
        setSubmitting(false)
        return
      }
      router.push('/Cycle/output')
    } catch {
      setError('Geen verbinding. Probeer opnieuw.')
      setSubmitting(false)
    }
  }

  const canAdvanceActivity = isRest || (intensity !== null)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-7">
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
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
            <Step
              title="Hoe is je stemming?"
              subtitle="Schuif naar wat het dichtst bij voelt."
              onBack={null}
              onNext={() => setStep(2)}
              canAdvance
            >
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span className="cycle-display" style={{ fontSize: 84 }}>{mood}</span>
              </div>
              <input
                type="range"
                min={0} max={10} step={1}
                value={mood}
                onChange={e => setMood(Number(e.target.value))}
                className="cycle-slider mb-5"
                aria-label="Stemming van 0 tot 10"
              />
              <label
                className="flex items-center gap-3 mb-2 cursor-pointer"
                style={{ fontSize: 14, color: 'var(--cycle-muted)' }}
              >
                <input
                  type="checkbox"
                  checked={moodVariable}
                  onChange={e => setMoodVariable(e.target.checked)}
                />
                Mijn stemming wisselde vandaag
              </label>
            </Step>
          )}

          {step === 2 && (
            <Step
              title="Hoe heb je geslapen?"
              subtitle="1 = beroerd, 10 = uitgerust."
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              canAdvance
            >
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span className="cycle-display" style={{ fontSize: 84 }}>{sleep}</span>
              </div>
              <input
                type="range"
                min={1} max={10} step={1}
                value={sleep}
                onChange={e => setSleep(Number(e.target.value))}
                className="cycle-slider mb-5"
                aria-label="Slaap van 1 tot 10"
              />
              <label className="flex items-center gap-3 cursor-pointer" style={{ fontSize: 14, color: 'var(--cycle-muted)' }}>
                <input
                  type="checkbox"
                  checked={napTaken}
                  onChange={e => setNapTaken(e.target.checked)}
                />
                Dutje gehad vandaag
              </label>
            </Step>
          )}

          {step === 3 && (
            <Step
              title="Wat heb je gedaan?"
              subtitle="Meerdere opties mogelijk."
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
              canAdvance={canAdvanceActivity}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    className="cycle-chip"
                    data-selected={activityTypes.includes(t) ? 'true' : 'false'}
                    onClick={() => toggleType(t)}
                  >
                    {ACTIVITY_LABELS[t]}
                  </button>
                ))}
              </div>

              {!isRest && (
                <>
                  <p className="text-sm mb-2" style={{ color: 'var(--cycle-muted)' }}>
                    Hoe intens overall?
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['Low', 'Medium', 'High'] as ActivityIntensity[]).map(i => (
                      <button
                        key={i}
                        type="button"
                        className="cycle-chip"
                        data-selected={intensity === i ? 'true' : 'false'}
                        onClick={() => setIntensity(i)}
                        style={{ flex: 1 }}
                      >
                        {INTENSITY_LABELS[i]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </Step>
          )}

          {step === 4 && (
            <Step
              title="Hoeveel stress?"
              subtitle="1 = ontspannen, 10 = overspoeld."
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
              canAdvance
            >
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span className="cycle-display" style={{ fontSize: 84 }}>{stress}</span>
              </div>
              <input
                type="range"
                min={1} max={10} step={1}
                value={stress}
                onChange={e => setStress(Number(e.target.value))}
                className="cycle-slider mb-5"
                aria-label="Stress van 1 tot 10"
              />
              <label className="flex items-center gap-3 cursor-pointer" style={{ fontSize: 14, color: 'var(--cycle-muted)' }}>
                <input
                  type="checkbox"
                  checked={busyDay}
                  onChange={e => setBusyDay(e.target.checked)}
                />
                Drukke dag
              </label>
            </Step>
          )}

          {step === 5 && (
            <Step
              title="Iets opvallends?"
              subtitle="Tik aan wat je vandaag voelt. Niets? Klik 'Niets vandaag'."
              onBack={() => setStep(4)}
              onNext={() => setStep(6)}
              canAdvance
            >
              <button
                type="button"
                className="cycle-button cycle-button-ghost w-full mb-5"
                onClick={() => { setSymptoms({}); setStep(6) }}
                style={{ minHeight: 'auto', padding: '10px 14px', fontSize: 14 }}
              >
                Niets vandaag →
              </button>

              {SYMPTOM_GROUPS_NL.map(group => {
                const selectedInGroup = group.keys.filter(k => symptoms[k] != null)
                return (
                  <div key={group.label} style={{ marginBottom: 18 }}>
                    <p
                      className="cycle-display"
                      style={{ fontSize: 17, marginBottom: 8, color: 'var(--cycle-muted)' }}
                    >
                      {group.label}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {group.keys.map(k => (
                        <button
                          key={k}
                          type="button"
                          className="cycle-chip"
                          data-selected={symptoms[k] != null ? 'true' : 'false'}
                          onClick={() => toggleSymptom(k)}
                          style={{ minHeight: 'auto', padding: '8px 12px', fontSize: 14 }}
                        >
                          {SYMPTOM_LABEL_NL[k]}
                          {symptoms[k] != null && (
                            <span style={{ marginLeft: 6, opacity: 0.85 }}>· {symptoms[k]}</span>
                          )}
                        </button>
                      ))}
                    </div>
                    {selectedInGroup.length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedInGroup.map(k => (
                          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              fontSize: 13,
                              color: 'var(--cycle-muted)',
                              minWidth: 120,
                            }}>
                              {SYMPTOM_LABEL_NL[k]}
                            </span>
                            {([1, 2, 3, 4, 5] as SymptomIntensity[]).map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setSymptomIntensity(k, n)}
                                aria-label={`Intensiteit ${n} voor ${SYMPTOM_LABEL_NL[k]}`}
                                data-selected={symptoms[k] === n ? 'true' : 'false'}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: '50%',
                                  border: '1px solid var(--cycle-border)',
                                  background: symptoms[k] === n ? 'var(--cycle-accent)' : 'var(--cycle-card)',
                                  color: symptoms[k] === n ? '#fff' : 'var(--cycle-fg)',
                                  fontSize: 13,
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  padding: 0,
                                  transition: 'all 200ms ease-out',
                                }}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <p className="text-xs mt-2" style={{ color: 'var(--cycle-muted)' }}>
                1 = nauwelijks · 3 = duidelijk · 5 = heftig
              </p>
            </Step>
          )}

          {step === 6 && (
            <Step
              title="Glazen alcohol gisteren?"
              subtitle="Wijn, bier, sterk — telt allemaal."
              onBack={() => setStep(5)}
              onNext={() => setStep(7)}
              canAdvance
            >
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
            </Step>
          )}

          {step === 7 && (
            <div>
              <h1 className="cycle-display text-3xl mb-1">Menstruatie vandaag?</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--cycle-muted)' }}>
                Ja als er bloed is, ook bij spotting.
              </p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                <button
                  type="button"
                  className="cycle-chip"
                  data-selected={period === false ? 'true' : 'false'}
                  onClick={() => setPeriod(false)}
                  style={{ flex: 1 }}
                >
                  Nee
                </button>
                <button
                  type="button"
                  className="cycle-chip"
                  data-selected={period === true ? 'true' : 'false'}
                  onClick={() => setPeriod(true)}
                  style={{ flex: 1 }}
                >
                  Ja
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  className="cycle-button cycle-button-ghost flex-1"
                  onClick={() => setStep(6)}
                  disabled={submitting}
                >
                  Terug
                </button>
                <button
                  className="cycle-button flex-1"
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting ? 'Bezig…' : 'Bekijk mijn dag'}
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

function Step({
  title, subtitle, children, onBack, onNext, canAdvance,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  onBack: (() => void) | null
  onNext: () => void
  canAdvance: boolean
}) {
  return (
    <div>
      <h1 className="cycle-display text-3xl mb-1">{title}</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--cycle-muted)' }}>{subtitle}</p>
      {children}
      <div className="flex gap-3 mt-7">
        {onBack ? (
          <button className="cycle-button cycle-button-ghost flex-1" onClick={onBack}>Terug</button>
        ) : (
          <span style={{ flex: 1 }} />
        )}
        <button className="cycle-button flex-1" onClick={onNext} disabled={!canAdvance}>
          Volgende
        </button>
      </div>
    </div>
  )
}
