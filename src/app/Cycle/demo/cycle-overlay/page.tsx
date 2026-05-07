'use client'

// FILE: src/app/Cycle/demo/cycle-overlay/page.tsx
// Concept A — cyclus-overlay. Three mock cycles plotted on one 28-day axis,
// most recent bold, older fainter. Toggle to compare on readiness, mood,
// or sleep. Narrative below auto-summarises the delta.

import { useState } from 'react'

type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal-early' | 'luteal-late'
type Metric = 'readiness' | 'mood' | 'sleep'

const PHASE_COLOR: Record<Phase, string> = {
  menstrual:      '#D4847E',
  follicular:     '#A8BFA0',
  ovulation:      '#E8C896',
  'luteal-early': '#C4B0BD',
  'luteal-late':  '#B8A8C4',
}

const METRIC_LABEL: Record<Metric, string> = {
  readiness: 'Readiness',
  mood:      'Stemming',
  sleep:     'Slaap',
}

const METRIC_RANGE: Record<Metric, [number, number]> = {
  readiness: [0, 100],
  mood:      [0, 10],
  sleep:     [1, 10],
}

const phaseOf = (d: number): Phase =>
  d <= 5 ? 'menstrual' :
  d <= 13 ? 'follicular' :
  d <= 16 ? 'ovulation' :
  d <= 23 ? 'luteal-early' : 'luteal-late'

// Deterministic pseudo-random per (day, seed) so charts are stable on render.
const noise = (d: number, seed: number) => {
  const x = Math.sin(d * 12.9898 + seed * 78.233) * 43758.5453
  return (x - Math.floor(x)) - 0.5
}

interface Day {
  day: number
  mood: number
  sleep: number
  readiness: number
  phase: Phase
}

interface Cycle {
  label: string
  color: string
  data: Day[]
  isCurrent: boolean
}

function makeCycle(seed: number, baselineMood: number, length = 28): Day[] {
  const out: Day[] = []
  for (let d = 1; d <= length; d++) {
    const phase = phaseOf(d)
    let mood, sleep, readiness
    if (phase === 'menstrual') {
      mood = baselineMood - 1 + noise(d, seed + 1) * 1.4
      sleep = 5.5 + noise(d, seed + 2) * 1.2
      readiness = 52 + noise(d, seed + 3) * 10
    } else if (phase === 'follicular') {
      mood = baselineMood + 1 + noise(d, seed + 1) * 0.9
      sleep = 7 + noise(d, seed + 2) * 1
      readiness = 72 + noise(d, seed + 3) * 9
    } else if (phase === 'ovulation') {
      mood = baselineMood + 2 + noise(d, seed + 1) * 0.7
      sleep = 7.5 + noise(d, seed + 2) * 0.8
      readiness = 86 + noise(d, seed + 3) * 7
    } else if (phase === 'luteal-early') {
      mood = baselineMood + noise(d, seed + 1) * 1.1
      sleep = 6.5 + noise(d, seed + 2) * 1.2
      readiness = 65 + noise(d, seed + 3) * 9
    } else {
      mood = baselineMood - 2 + noise(d, seed + 1) * 1.4
      sleep = 5 + noise(d, seed + 2) * 1.3
      readiness = 45 + noise(d, seed + 3) * 11
    }
    out.push({
      day: d,
      mood:      Math.max(0, Math.min(10, mood)),
      sleep:     Math.max(1, Math.min(10, sleep)),
      readiness: Math.max(0, Math.min(100, readiness)),
      phase,
    })
  }
  return out
}

const CYCLES: Cycle[] = [
  // Oldest first, most recent last. Colours go from neutral grey → rose.
  { label: 'Maart',         color: '#A89890', isCurrent: false, data: makeCycle(1, 5.0) },
  { label: 'April',         color: '#B8A8C4', isCurrent: false, data: makeCycle(2, 5.6) },
  { label: 'Mei (huidig)',  color: '#D4847E', isCurrent: true,  data: makeCycle(3, 6.4).slice(0, 18) },
]

function average(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
}

function deltaNarrative(metric: Metric, cycles: Cycle[]): string | null {
  if (cycles.length < 2) return null
  const recent = cycles[cycles.length - 1]
  const prev   = cycles[cycles.length - 2]
  const recentAvg = average(recent.data.map(d => d[metric]))
  const prevAvg   = average(prev.data.map(d => d[metric]))
  const delta = recentAvg - prevAvg
  const direction = delta > 0 ? 'hoger' : 'lager'
  const abs = Math.abs(delta)
  const strength = abs > (metric === 'readiness' ? 5 : 0.7) ? 'duidelijk' : 'iets'

  // Phase-specific delta — find the phase where the difference is largest
  const phases: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal-early', 'luteal-late']
  let topPhase: Phase = 'menstrual'
  let topDelta = 0
  for (const p of phases) {
    const r = average(recent.data.filter(d => d.phase === p).map(d => d[metric]))
    const v = average(prev.data.filter(d => d.phase === p).map(d => d[metric]))
    if (Math.abs(r - v) > Math.abs(topDelta)) { topDelta = r - v; topPhase = p }
  }
  const phaseLabelNL: Record<Phase, string> = {
    menstrual: 'menstruatie', follicular: 'folliculaire fase',
    ovulation: 'ovulatie', 'luteal-early': 'luteale begin', 'luteal-late': 'luteale eindfase',
  }

  return `${recent.label.replace(' (huidig)', '')} ligt gemiddeld ${strength} ${direction} dan ${prev.label}, ` +
    `vooral zichtbaar in de ${phaseLabelNL[topPhase]}.`
}

// ── Chart ───────────────────────────────────────────────────────────────────
function OverlayChart({ metric }: { metric: Metric }) {
  const W = 1000, H = 480, PAD_L = 28, PAD_R = 16, PAD_T = 28, PAD_B = 40
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const [yLo, yHi] = METRIC_RANGE[metric]
  const x = (d: number) => PAD_L + ((d - 1) / 27) * innerW
  const y = (v: number) => PAD_T + (1 - (v - yLo) / (yHi - yLo)) * innerH

  // Phase bands based on day-of-cycle (phases shared across cycles).
  const bands: { start: number; end: number; phase: Phase }[] = []
  for (let d = 1; d <= 28; d++) {
    const p = phaseOf(d)
    const last = bands[bands.length - 1]
    if (last && last.phase === p) last.end = d
    else bands.push({ start: d, end: d, phase: p })
  }

  const path = (data: Day[]) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.day).toFixed(1)} ${y(d[metric]).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
      {/* phase bands */}
      {bands.map((b, i) => (
        <rect
          key={i}
          x={x(b.start - 1) + (b.start === 1 ? -PAD_L : 0)}
          y={PAD_T}
          width={x(b.end - 1) - x(b.start - 1) + innerW / 27 + (b.start === 1 ? PAD_L : 0)}
          height={innerH}
          fill={PHASE_COLOR[b.phase]}
          opacity={0.10}
        />
      ))}
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t} x1={PAD_L} x2={W - PAD_R} y1={PAD_T + t * innerH} y2={PAD_T + t * innerH} stroke="var(--cycle-border)" strokeDasharray="2 4" />
      ))}
      {/* cycle lines */}
      {CYCLES.map((c, i) => (
        <path
          key={c.label}
          d={path(c.data)}
          fill="none"
          stroke={c.color}
          strokeWidth={c.isCurrent ? 3.4 : 2.2}
          strokeOpacity={c.isCurrent ? 1 : 0.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={c.isCurrent ? undefined : i === 0 ? '6 5' : undefined}
        />
      ))}
      {/* "today" marker on the current cycle's last day */}
      {CYCLES.filter(c => c.isCurrent).map(c => {
        const last = c.data[c.data.length - 1]
        return last ? (
          <circle key="today" cx={x(last.day)} cy={y(last[metric])} r={5.5} fill={c.color} stroke="#FBF1ED" strokeWidth={2} />
        ) : null
      })}
      {/* day labels */}
      {[1, 7, 14, 21, 28].map(d => (
        <text key={d} x={x(d)} y={H - 12} fontSize={16} fill="var(--cycle-muted)" textAnchor="middle">{d}</text>
      ))}
    </svg>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function CycleOverlayDemo() {
  const [metric, setMetric] = useState<Metric>('readiness')
  const narrative = deltaNarrative(metric, CYCLES)

  return (
    <main className="min-h-screen flex flex-col px-4 py-8" style={{ gap: 24 }}>
      <header>
        <h1 className="cycle-display text-3xl mb-1">Cyclus over cyclus</h1>
        <p className="text-sm" style={{ color: 'var(--cycle-muted)' }}>
          Drie cycli op één tijdas. Huidige cyclus dik, eerdere lichter. Demo met mock data.
        </p>
      </header>

      {/* Metric toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['readiness', 'mood', 'sleep'] as Metric[]).map(m => (
          <button
            key={m}
            type="button"
            className="cycle-chip"
            data-selected={metric === m ? 'true' : 'false'}
            onClick={() => setMetric(m)}
            style={{ flex: 1 }}
          >
            {METRIC_LABEL[m]}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--cycle-card)', borderRadius: 18, padding: 16, border: '1px solid var(--cycle-border)' }}>
        <OverlayChart metric={metric} />
      </div>

      {/* Narrative */}
      {narrative && (
        <div style={{ background: 'var(--cycle-card)', borderRadius: 18, padding: 20, border: '1px solid var(--cycle-border)' }}>
          <p className="cycle-display text-2xl" style={{ lineHeight: 1.25, margin: 0 }}>
            {narrative}
          </p>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14 }}>
        {CYCLES.map(c => (
          <span key={c.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 18,
              height: 3,
              background: c.color,
              borderRadius: 2,
              opacity: c.isCurrent ? 1 : 0.65,
            }} />
            <span style={{ color: c.isCurrent ? 'var(--cycle-fg)' : 'var(--cycle-muted)', fontWeight: c.isCurrent ? 500 : 400 }}>
              {c.label}
            </span>
          </span>
        ))}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--cycle-muted)', marginTop: 12 }}>
        Mock data — terug via /Cycle/demo
      </p>
    </main>
  )
}
