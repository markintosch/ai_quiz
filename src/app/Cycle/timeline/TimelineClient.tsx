'use client'

// FILE: src/app/Cycle/timeline/TimelineClient.tsx
// 28-day horizontal timeline. Phase tint as background band, readiness bar
// height-coded, mood dot, weather + period markers. Tap a day to expand.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { movingAverage, findOutlierIndex, pearson } from '@/lib/cycle/stats'

interface Entry {
  date: string
  mood: number
  moodVariable: boolean
  sleep: number
  stress: number
  readiness: number | null
  phase: string
  period: boolean
  activityTypes: string[]
  intensity: string | null
  alcohol: number
  symptoms: string[]
  symptomIntensities: Record<string, number>
  napTaken: boolean
  busyDay: boolean
}

const SYMPTOM_LABEL_NL: Record<string, string> = {
  brain_fog:         'Brain fog',
  dizzy:             'Duizelig',
  headache:          'Hoofdpijn',
  overstimulated:    'Overprikkeld',
  sad:               'Somber',
  tired:             'Vermoeid',
  exhausted:         'Uitgeput',
  interrupted_sleep: 'Onderbroken slaap',
  restless_legs:     'Rusteloze benen',
  joint_pain:        'Gewrichtspijn',
  back_pain:         'Rugpijn',
  bloating:          'Opgeblazen buik',
  cramps:            'Menstruatiekramp',
  cold:              'Koud',
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
  const [view, setView] = useState<'days' | 'patronen'>('days')

  const sel = selected ? entryByDate[selected] : null
  const selWeather = selected ? weatherByDate[selected] : null

  const enoughForPatterns = entries.length >= 14

  return (
    <main className="min-h-screen flex flex-col px-4 py-8">
      <header className="px-2 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <h1 className="cycle-display text-3xl">Tijdlijn</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/Cycle/dashboard"
            className="text-sm underline"
            style={{ color: 'var(--cycle-muted)' }}
            title="Patronen & nulmeting-vergelijking"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/Cycle/export"
            className="text-sm underline"
            style={{ color: 'var(--cycle-muted)' }}
            title="Print-vriendelijk overzicht voor je arts"
          >
            🩺 Voor je arts
          </Link>
          <Link
            href="/Cycle/output"
            className="text-sm underline"
            style={{ color: 'var(--cycle-muted)' }}
          >
            Terug
          </Link>
        </div>
      </header>

      {/* View toggle — only show Patronen once there's enough data */}
      {enoughForPatterns && (
        <div style={{ display: 'flex', gap: 6, padding: '0 8px 14px' }}>
          <button
            type="button"
            className="cycle-chip"
            data-selected={view === 'days' ? 'true' : 'false'}
            onClick={() => setView('days')}
            style={{ minHeight: 'auto', padding: '8px 16px', fontSize: 14, flex: 1 }}
          >
            Dagen
          </button>
          <button
            type="button"
            className="cycle-chip"
            data-selected={view === 'patronen' ? 'true' : 'false'}
            onClick={() => setView('patronen')}
            style={{ minHeight: 'auto', padding: '8px 16px', fontSize: 14, flex: 1 }}
          >
            Patronen
          </button>
        </div>
      )}

      {view === 'patronen' ? (
        <PatternsView days={days} entryByDate={entryByDate} />
      ) : null}

      {view === 'days' && (
        <>
        {/* Days view (existing bar grid) */}

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
              {/* Symptom count badge — tiny number when 1+ symptoms */}
              {e?.symptoms && e.symptoms.length > 0 && (
                <div
                  aria-label={`${e.symptoms.length} symptom${e.symptoms.length === 1 ? '' : 'en'}`}
                  style={{
                    fontSize: 9,
                    lineHeight: 1,
                    marginTop: 2,
                    color: 'var(--cycle-accent)',
                    fontWeight: 600,
                  }}
                >
                  •{e.symptoms.length}
                </div>
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
          {sel.napTaken && <p className="text-sm">Dutje gehad ✓</p>}
          {sel.busyDay && <p className="text-sm">Drukke dag ✓</p>}
          {sel.symptoms.length > 0 && (
            <p className="text-sm mt-2">
              Symptomen: <strong>{sel.symptoms.map(s => {
                const label = SYMPTOM_LABEL_NL[s] ?? s
                const i = sel.symptomIntensities[s]
                return i ? `${label} (${i})` : label
              }).join(', ')}</strong>
            </p>
          )}
          {selWeather?.temp != null && (
            <p className="text-sm" style={{ color: 'var(--cycle-muted)' }}>
              {CONDITION_ICON[selWeather.condition ?? ''] ?? ''} {Math.round(selWeather.temp)}°
            </p>
          )}
        </div>
      )}
        </>
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

// ── Patronen view: small multiples with phase tints + outlier annotations ──
const METRIC_COLOR_PROD = {
  mood:      '#B86A64',
  sleep:     '#7A9A8A',
  readiness: '#D4847E',
  stress:    '#8B6B85',
} as const

function PatternsView({
  days, entryByDate,
}: {
  days: string[]
  entryByDate: Record<string, Entry>
}) {
  // Extract per-day series, leaving gaps as null
  const mood:      (number | null)[] = days.map(d => entryByDate[d]?.mood ?? null)
  const sleep:     (number | null)[] = days.map(d => entryByDate[d]?.sleep ?? null)
  const readiness: (number | null)[] = days.map(d => entryByDate[d]?.readiness ?? null)
  const stress:    (number | null)[] = days.map(d => entryByDate[d]?.stress ?? null)
  const phases: string[] = days.map(d => entryByDate[d]?.phase ?? 'unknown')

  // ── Pattern story: find the strongest correlation among the 4 metrics ────
  const pairs: { a: string; b: string; series: { x: number[]; y: number[] }; r: number }[] = []
  const seriesByLabel = {
    stemming: mood,
    slaap:    sleep,
    energie:  readiness,
    kalmte:   stress,   // higher score = less stress, calmer
  } as const
  const labels = Object.keys(seriesByLabel) as (keyof typeof seriesByLabel)[]
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const aSeries = seriesByLabel[labels[i]]
      const bSeries = seriesByLabel[labels[j]]
      const x: number[] = []
      const y: number[] = []
      for (let k = 0; k < aSeries.length; k++) {
        const av = aSeries[k]
        const bv = bSeries[k]
        if (av != null && bv != null && Number.isFinite(av) && Number.isFinite(bv)) {
          x.push(av)
          y.push(bv)
        }
      }
      if (x.length < 7) continue
      pairs.push({ a: labels[i], b: labels[j], series: { x, y }, r: pearson(x, y) })
    }
  }
  pairs.sort((p, q) => Math.abs(q.r) - Math.abs(p.r))
  const top = pairs[0]
  let narrative: string | null = null
  if (top && Math.abs(top.r) > 0.35) {
    const dir = top.r > 0
      ? 'bewegen samen op en neer'
      : 'bewegen in tegengestelde richting'
    const strength = Math.abs(top.r) > 0.6 ? 'sterk' : Math.abs(top.r) > 0.45 ? 'duidelijk' : 'licht'
    narrative = `Deze weken ${dir} je ${top.a} en ${top.b} — ${strength}.`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {narrative && (
        <div style={{
          background: 'var(--cycle-card)',
          borderRadius: 18,
          padding: 18,
          border: '1px solid var(--cycle-border)',
          marginBottom: 4,
        }}>
          <p className="cycle-display" style={{ fontSize: 20, lineHeight: 1.3, margin: 0, color: 'var(--cycle-fg)' }}>
            {narrative}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--cycle-muted)' }}>
            Gebaseerd op je laatste 28 dagen · r = {top.r.toFixed(2)}
          </p>
        </div>
      )}

      <MiniMetric label="Stemming"  values={mood}      phases={phases} color={METRIC_COLOR_PROD.mood}      max={10}  noteHigh="hoogste stemming" noteLow="laagste stemming" />
      <MiniMetric label="Slaap"     values={sleep}     phases={phases} color={METRIC_COLOR_PROD.sleep}     max={10}  noteHigh="beste slaap"      noteLow="slechtste slaap" />
      <MiniMetric label="Readiness" values={readiness} phases={phases} color={METRIC_COLOR_PROD.readiness} max={100} noteHigh="hoogste energie"  noteLow="laagste energie" />
      <MiniMetric label="Stress"    values={stress}    phases={phases} color={METRIC_COLOR_PROD.stress}    max={10}  noteHigh="meest ontspannen" noteLow="meest gestrest" inverted />
      <p className="text-xs text-center mt-2" style={{ color: 'var(--cycle-muted)' }}>
        28 dagen · 5-daags voortschrijdend gemiddelde · oranje punt = opvallendste dag
      </p>
    </div>
  )
}

function MiniMetric({
  label, values, phases, color, max, noteHigh, noteLow, inverted,
}: {
  label: string
  values: (number | null)[]
  phases: string[]
  color: string
  max: number
  noteHigh: string
  noteLow: string
  inverted?: boolean    // if true, "high" means low score (e.g. stress)
}) {
  const W = 1000, H = 200, PAD_L = 80, PAD_R = 16, PAD_T = 18, PAD_B = 30
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const x = (i: number) => PAD_L + (i / Math.max(1, values.length - 1)) * innerW
  const y = (v: number) => PAD_T + (1 - v / max) * innerH

  // Build a continuous series with gap-handling: skip nulls
  const known: { i: number; v: number }[] = []
  values.forEach((v, i) => { if (v != null && Number.isFinite(v)) known.push({ i, v }) })
  if (known.length < 3) return (
    <div style={{ background: 'var(--cycle-card)', borderRadius: 14, padding: '8px 14px', border: '1px solid var(--cycle-border)' }}>
      <span className="cycle-display" style={{ fontSize: 18 }}>{label}</span>
      <span className="text-xs" style={{ color: 'var(--cycle-muted)', marginLeft: 12 }}>nog niet genoeg data</span>
    </div>
  )

  const ma = movingAverage(known.map(k => k.v), 5)
  const outlierIdx = findOutlierIndex(ma)
  const path = ma.map((v, j) => `${j === 0 ? 'M' : 'L'} ${x(known[j].i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  // Phase bands across full timeline
  const bands: { start: number; end: number; phase: string }[] = []
  phases.forEach((p, i) => {
    const last = bands[bands.length - 1]
    if (last && last.phase === p) last.end = i
    else bands.push({ start: i, end: i, phase: p })
  })

  const hx = x(known[outlierIdx].i)
  const hy = y(ma[outlierIdx])
  const isHigh = inverted
    ? ma[outlierIdx] === Math.max(...ma)
    : ma[outlierIdx] === Math.max(...ma)
  // For "inverted" metrics (stress): high score = low actual stress = "calm"
  const note = isHigh
    ? (inverted ? noteHigh : noteHigh)
    : (inverted ? noteLow : noteLow)
  // Compute the actual date for the annotation
  const dateForLabel = `dag ${known[outlierIdx].i + 1}`

  return (
    <div style={{ background: 'var(--cycle-card)', borderRadius: 14, padding: '6px 10px', border: '1px solid var(--cycle-border)' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* Label */}
        <text x={12} y={H / 2 - 4} fontSize={26} fill="var(--cycle-fg)" fontFamily="Cormorant Garamond, Georgia, serif">{label}</text>
        <text x={12} y={H / 2 + 22} fontSize={16} fill="var(--cycle-muted)" fontFamily="Inter, system-ui">
          {Math.round(ma[ma.length - 1])}
        </text>

        {/* Phase bands */}
        {bands.map((b, i) => (
          <rect
            key={i}
            x={x(b.start) - (b.start === 0 ? 0 : innerW / (Math.max(1, values.length - 1) * 2))}
            y={PAD_T}
            width={x(b.end) - x(b.start) + innerW / Math.max(1, values.length - 1)}
            height={innerH}
            fill={PHASE_COLOR[b.phase] ?? 'var(--cycle-border)'}
            opacity={0.12}
          />
        ))}

        {/* Daily dots */}
        {known.map(({ i, v }) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={2.4} fill={color} opacity={0.4} />
        ))}

        {/* Moving average */}
        <path d={path} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />

        {/* Outlier marker + callout */}
        <circle cx={hx} cy={hy} r={7} fill="none" stroke={color} strokeWidth={2.2} />
        <circle cx={hx} cy={hy} r={3.6} fill={color} />
        <line x1={hx} y1={hy} x2={hx} y2={PAD_T + 12} stroke={color} strokeDasharray="3 3" strokeWidth={1.4} />
        <text
          x={hx < W / 2 ? hx + 10 : hx - 10}
          y={PAD_T + 12}
          fontSize={16}
          fill="var(--cycle-fg)"
          textAnchor={hx < W / 2 ? 'start' : 'end'}
          fontFamily="Inter, system-ui"
          fontWeight={500}
        >
          {note} ({dateForLabel})
        </text>

        {/* Day labels */}
        {[1, 7, 14, 21, 28].map(d => values[d - 1] !== undefined && (
          <text key={d} x={x(d - 1)} y={H - 6} fontSize={14} fill="var(--cycle-muted)" textAnchor="middle">{d}</text>
        ))}
      </svg>
    </div>
  )
}
