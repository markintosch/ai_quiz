// FILE: src/app/Cycle/demo/timeline/page.tsx
// Two contrasting timeline visualisations side-by-side for design review.
// Both use the same mock 28-day cycle data + 5-day centred moving averages.

interface Day {
  day: number
  sleep: number
  stress: number
  activity: number
  cycle: number
  mood: number
  period: boolean
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal-early' | 'luteal-late'
}

const PHASE_COLOR: Record<Day['phase'], string> = {
  menstrual:      '#D4847E',
  follicular:     '#A8BFA0',
  ovulation:      '#E8C896',
  'luteal-early': '#C4B0BD',
  'luteal-late':  '#B8A8C4',
}

const METRIC_COLOR = {
  sleep:    '#7A9A8A',
  cycle:    '#B86A64',
  activity: '#C4943C',
  stress:   '#8B6B85',
} as const

function mockData(): Day[] {
  const phaseOf = (d: number): Day['phase'] =>
    d <= 5 ? 'menstrual' :
    d <= 13 ? 'follicular' :
    d <= 16 ? 'ovulation' :
    d <= 23 ? 'luteal-early' : 'luteal-late'

  // Deterministic pseudo-random per day so the chart is stable on every render.
  const noise = (d: number, seed: number) => {
    const x = Math.sin(d * 12.9898 + seed * 78.233) * 43758.5453
    return (x - Math.floor(x)) - 0.5
  }

  const days: Day[] = []
  for (let d = 1; d <= 28; d++) {
    const phase = phaseOf(d)
    let sleepRaw, stressRaw, activityRaw, cycleScore, moodRaw

    if (phase === 'menstrual') {
      sleepRaw = 5.5 + noise(d, 1) * 1.5
      stressRaw = 5 + noise(d, 2) * 1.2
      activityRaw = 35 + noise(d, 3) * 12
      cycleScore = 55
      moodRaw = 5 + noise(d, 4) * 1.5
    } else if (phase === 'follicular') {
      sleepRaw = 7.5 + noise(d, 1) * 1
      stressRaw = 3.5 + noise(d, 2) * 1.5
      activityRaw = 65 + noise(d, 3) * 15
      cycleScore = 75
      moodRaw = 7.5 + noise(d, 4) * 1
    } else if (phase === 'ovulation') {
      sleepRaw = 7.8 + noise(d, 1) * 0.8
      stressRaw = 3 + noise(d, 2) * 1
      activityRaw = 82 + noise(d, 3) * 10
      cycleScore = 85
      moodRaw = 8.5 + noise(d, 4) * 0.7
    } else if (phase === 'luteal-early') {
      sleepRaw = 6.8 + noise(d, 1) * 1.2
      stressRaw = 5 + noise(d, 2) * 1.5
      activityRaw = 60 + noise(d, 3) * 18
      cycleScore = 60
      moodRaw = 6.5 + noise(d, 4) * 1.2
    } else {
      sleepRaw = 5 + noise(d, 1) * 1.4
      stressRaw = 6.5 + noise(d, 2) * 1.5
      activityRaw = 42 + noise(d, 3) * 18
      cycleScore = 45
      moodRaw = 5 + noise(d, 4) * 1.5
    }

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
    days.push({
      day: d,
      sleep:    Math.round(clamp(sleepRaw, 1, 10) * 10),
      stress:   Math.round((11 - clamp(stressRaw, 1, 10)) * 10),
      activity: Math.round(clamp(activityRaw, 0, 100)),
      cycle:    cycleScore,
      mood:     Math.round(clamp(moodRaw, 0, 10) * 10) / 10,
      period:   d >= 1 && d <= 5,
      phase,
    })
  }
  return days
}

function movingAverage(values: number[], window = 5): number[] {
  const out: number[] = []
  const half = Math.floor(window / 2)
  for (let i = 0; i < values.length; i++) {
    const lo = Math.max(0, i - half)
    const hi = Math.min(values.length, i + half + 1)
    const slice = values.slice(lo, hi)
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length)
  }
  return out
}

// ── Concept A: Horizon — one canvas, four MA lines overlaid ─────────────────
function HorizonChart({ data }: { data: Day[] }) {
  const W = 1000, H = 520, PAD_L = 30, PAD_R = 16, PAD_T = 24, PAD_B = 40
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const x = (d: number) => PAD_L + ((d - 1) / 27) * innerW
  const y = (v: number) => PAD_T + (1 - v / 100) * innerH

  const ma = {
    sleep:    movingAverage(data.map(d => d.sleep)),
    cycle:    movingAverage(data.map(d => d.cycle)),
    activity: movingAverage(data.map(d => d.activity)),
    stress:   movingAverage(data.map(d => d.stress)),
  }

  // Phase background bands: contiguous runs of the same phase
  const bands: { start: number; end: number; phase: Day['phase'] }[] = []
  for (const d of data) {
    const last = bands[bands.length - 1]
    if (last && last.phase === d.phase) last.end = d.day
    else bands.push({ start: d.day, end: d.day, phase: d.phase })
  }

  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i + 1).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  return (
    <div style={{ background: 'var(--cycle-card)', borderRadius: 18, padding: 14, border: '1px solid var(--cycle-border)' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* phase bands */}
        {bands.map((b, i) => (
          <rect
            key={i}
            x={x(b.start) - (b.start === 1 ? PAD_L : 0)}
            y={PAD_T}
            width={x(b.end) - x(b.start) + (b.end - b.start === 0 ? innerW / 27 : innerW / 27) + (b.start === 1 ? PAD_L : 0)}
            height={innerH}
            fill={PHASE_COLOR[b.phase]}
            opacity={0.10}
          />
        ))}

        {/* gridlines */}
        {[25, 50, 75].map(v => (
          <line key={v} x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} stroke="var(--cycle-border)" strokeDasharray="2 4" />
        ))}

        {/* MA lines */}
        <path d={path(ma.sleep)}    fill="none" stroke={METRIC_COLOR.sleep}    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={path(ma.cycle)}    fill="none" stroke={METRIC_COLOR.cycle}    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={path(ma.activity)} fill="none" stroke={METRIC_COLOR.activity} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={path(ma.stress)}   fill="none" stroke={METRIC_COLOR.stress}   strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* daily raw dots — faint */}
        {data.map(d => (
          <g key={d.day} opacity={0.35}>
            <circle cx={x(d.day)} cy={y(d.sleep)}    r={1.6} fill={METRIC_COLOR.sleep} />
            <circle cx={x(d.day)} cy={y(d.activity)} r={1.6} fill={METRIC_COLOR.activity} />
            <circle cx={x(d.day)} cy={y(d.stress)}   r={1.6} fill={METRIC_COLOR.stress} />
          </g>
        ))}

        {/* day labels */}
        {[1, 7, 14, 21, 28].map(d => (
          <text key={d} x={x(d)} y={H - 10} fontSize={11} fill="var(--cycle-muted)" textAnchor="middle" fontFamily="Inter, system-ui">
            {d}
          </text>
        ))}

        {/* period markers */}
        {data.filter(d => d.period).map(d => (
          <circle key={d.day} cx={x(d.day)} cy={H - PAD_B + 6} r={2.2} fill={PHASE_COLOR.menstrual} />
        ))}
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10, fontSize: 12, color: 'var(--cycle-muted)' }}>
        <Legend color={METRIC_COLOR.sleep}    label="Slaap" />
        <Legend color={METRIC_COLOR.cycle}    label="Cyclus" />
        <Legend color={METRIC_COLOR.activity} label="Beweging" />
        <Legend color={METRIC_COLOR.stress}   label="Stress" />
      </div>
    </div>
  )
}

// ── Concept B: Small multiples — four mini charts stacked ────────────────────
function StackedCharts({ data }: { data: Day[] }) {
  const charts = [
    { key: 'sleep',    label: 'Slaap',    color: METRIC_COLOR.sleep },
    { key: 'cycle',    label: 'Cyclus',   color: METRIC_COLOR.cycle },
    { key: 'activity', label: 'Beweging', color: METRIC_COLOR.activity },
    { key: 'stress',   label: 'Stress',   color: METRIC_COLOR.stress },
  ] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {charts.map(c => (
        <MiniChart
          key={c.key}
          label={c.label}
          color={c.color}
          values={data.map(d => d[c.key])}
          phases={data.map(d => d.phase)}
        />
      ))}
    </div>
  )
}

function MiniChart({ label, color, values, phases }: {
  label: string
  color: string
  values: number[]
  phases: Day['phase'][]
}) {
  const W = 1000, H = 220, PAD_L = 80, PAD_R = 16, PAD_T = 18, PAD_B = 30
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const x = (i: number) => PAD_L + (i / 27) * innerW
  const y = (v: number) => PAD_T + (1 - v / 100) * innerH
  const ma = movingAverage(values)
  const path = ma.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  // Phase backgrounds
  const bands: { start: number; end: number; phase: Day['phase'] }[] = []
  phases.forEach((p, i) => {
    const last = bands[bands.length - 1]
    if (last && last.phase === p) last.end = i
    else bands.push({ start: i, end: i, phase: p })
  })

  return (
    <div style={{ background: 'var(--cycle-card)', borderRadius: 14, padding: '6px 10px', border: '1px solid var(--cycle-border)' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* Label on the left */}
        <text x={12} y={H / 2 - 4} fontSize={28} fill="var(--cycle-fg)" fontFamily="Cormorant Garamond, Georgia, serif">{label}</text>
        <text x={12} y={H / 2 + 24} fontSize={18} fill="var(--cycle-muted)" fontFamily="Inter, system-ui">
          {Math.round(ma[ma.length - 1])}
        </text>

        {/* Phase bands */}
        {bands.map((b, i) => (
          <rect
            key={i}
            x={x(b.start) - (b.start === 0 ? 0 : innerW / 54)}
            y={PAD_T}
            width={x(b.end) - x(b.start) + innerW / 27}
            height={innerH}
            fill={PHASE_COLOR[b.phase]}
            opacity={0.12}
          />
        ))}

        {/* Gridline */}
        <line x1={PAD_L} x2={W - PAD_R} y1={y(50)} y2={y(50)} stroke="var(--cycle-border)" strokeDasharray="2 4" />

        {/* Daily raw dots */}
        {values.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={1.8} fill={color} opacity={0.45} />
        ))}

        {/* Moving average */}
        <path d={path} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Day labels at bottom */}
        {[1, 7, 14, 21, 28].map(d => (
          <text key={d} x={x(d - 1)} y={H - 6} fontSize={16} fill="var(--cycle-muted)" textAnchor="middle">
            {d}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ── Pearson correlation (no external deps) ──────────────────────────────────
function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 5) return 0
  const meanX = xs.slice(0, n).reduce((a, b) => a + b, 0) / n
  const meanY = ys.slice(0, n).reduce((a, b) => a + b, 0) / n
  let num = 0, denX = 0, denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  if (denX === 0 || denY === 0) return 0
  return num / Math.sqrt(denX * denY)
}

// ── Concept C: Pattern story — one headline + one focused 2-metric chart ────
const AXIS_LABEL_NL: Record<'sleep' | 'cycle' | 'activity' | 'stress', string> = {
  sleep:    'slaap',
  cycle:    'cyclus',
  activity: 'beweging',
  stress:   'stress',
}

function PatternStory({ data }: { data: Day[] }) {
  const series = {
    sleep:    data.map(d => d.sleep),
    cycle:    data.map(d => d.cycle),
    activity: data.map(d => d.activity),
    stress:   data.map(d => d.stress),
  }
  type Axis = keyof typeof series
  const keys: Axis[] = ['sleep', 'cycle', 'activity', 'stress']
  const pairs: { a: Axis; b: Axis; r: number }[] = []
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      pairs.push({ a: keys[i], b: keys[j], r: pearson(series[keys[i]], series[keys[j]]) })
    }
  }
  pairs.sort((p, q) => Math.abs(q.r) - Math.abs(p.r))
  const top = pairs[0]
  const dir = top.r > 0
    ? 'bewegen samen op en neer'
    : 'bewegen in tegengestelde richting'
  const strength = Math.abs(top.r) > 0.6 ? 'sterk' : Math.abs(top.r) > 0.4 ? 'duidelijk' : 'licht'
  const headline = `Deze cyclus ${dir} je ${AXIS_LABEL_NL[top.a]} en ${AXIS_LABEL_NL[top.b]} — ${strength}.`

  // Two-metric overlay chart
  const W = 1000, H = 360, PAD_L = 30, PAD_R = 16, PAD_T = 24, PAD_B = 40
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const x = (i: number) => PAD_L + (i / 27) * innerW
  const y = (v: number) => PAD_T + (1 - v / 100) * innerH
  const maA = movingAverage(series[top.a])
  const maB = movingAverage(series[top.b])
  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  // Phase bands
  const bands: { start: number; end: number; phase: Day['phase'] }[] = []
  for (const d of data) {
    const last = bands[bands.length - 1]
    if (last && last.phase === d.phase) last.end = d.day
    else bands.push({ start: d.day, end: d.day, phase: d.phase })
  }

  return (
    <div style={{ background: 'var(--cycle-card)', borderRadius: 18, padding: 20, border: '1px solid var(--cycle-border)' }}>
      <p className="cycle-display" style={{ fontSize: 22, lineHeight: 1.25, margin: 0, marginBottom: 16, color: 'var(--cycle-fg)' }}>
        {headline}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        {bands.map((b, i) => (
          <rect
            key={i}
            x={x(b.start - 1) - (b.start === 1 ? PAD_L : 0)}
            y={PAD_T}
            width={x(b.end - 1) - x(b.start - 1) + innerW / 27 + (b.start === 1 ? PAD_L : 0)}
            height={innerH}
            fill={PHASE_COLOR[b.phase]}
            opacity={0.10}
          />
        ))}
        {[25, 50, 75].map(v => (
          <line key={v} x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} stroke="var(--cycle-border)" strokeDasharray="2 4" />
        ))}
        <path d={path(maA)} fill="none" stroke={METRIC_COLOR[top.a]} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={path(maB)} fill="none" stroke={METRIC_COLOR[top.b]} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {[1, 7, 14, 21, 28].map(d => (
          <text key={d} x={x(d - 1)} y={H - 12} fontSize={16} fill="var(--cycle-muted)" textAnchor="middle">{d}</text>
        ))}
      </svg>

      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: 'var(--cycle-muted)' }}>
        <Legend color={METRIC_COLOR[top.a]} label={AXIS_LABEL_NL[top.a]} />
        <Legend color={METRIC_COLOR[top.b]} label={AXIS_LABEL_NL[top.b]} />
        <span style={{ marginLeft: 'auto' }}>r = {top.r.toFixed(2)}</span>
      </div>
    </div>
  )
}

// ── Concept D: Annotated stack — small multiples + outlier callouts ─────────
function AnnotatedStack({ data }: { data: Day[] }) {
  const charts = [
    { key: 'sleep',    label: 'Slaap',    color: METRIC_COLOR.sleep,    high: 'beste slaap', low: 'slechtste slaap' },
    { key: 'cycle',    label: 'Cyclus',   color: METRIC_COLOR.cycle,    high: 'fertiel piekmoment', low: 'menstrueel dieptepunt' },
    { key: 'activity', label: 'Beweging', color: METRIC_COLOR.activity, high: 'actiefste dag', low: 'rustigste dag' },
    { key: 'stress',   label: 'Stress',   color: METRIC_COLOR.stress,   high: 'meest ontspannen', low: 'meest gestrest' },
  ] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {charts.map(c => {
        const values = data.map(d => d[c.key])
        const ma = movingAverage(values)
        const maxIdx = ma.indexOf(Math.max(...ma))
        const minIdx = ma.indexOf(Math.min(...ma))
        // pick the one that's more deviant from the median
        const median = [...ma].sort((a, b) => a - b)[Math.floor(ma.length / 2)]
        const farIdx = Math.abs(ma[maxIdx] - median) > Math.abs(median - ma[minIdx]) ? maxIdx : minIdx
        const note = farIdx === maxIdx ? c.high : c.low
        return <AnnotatedMiniChart key={c.key} label={c.label} color={c.color} values={values} phases={data.map(d => d.phase)} highlightIdx={farIdx} note={note} />
      })}
    </div>
  )
}

function AnnotatedMiniChart({ label, color, values, phases, highlightIdx, note }: {
  label: string
  color: string
  values: number[]
  phases: Day['phase'][]
  highlightIdx: number
  note: string
}) {
  const W = 1000, H = 220, PAD_L = 80, PAD_R = 16, PAD_T = 18, PAD_B = 30
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const x = (i: number) => PAD_L + (i / 27) * innerW
  const y = (v: number) => PAD_T + (1 - v / 100) * innerH
  const ma = movingAverage(values)
  const path = ma.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  const bands: { start: number; end: number; phase: Day['phase'] }[] = []
  phases.forEach((p, i) => {
    const last = bands[bands.length - 1]
    if (last && last.phase === p) last.end = i
    else bands.push({ start: i, end: i, phase: p })
  })

  const hx = x(highlightIdx)
  const hy = y(ma[highlightIdx])

  return (
    <div style={{ background: 'var(--cycle-card)', borderRadius: 14, padding: '6px 10px', border: '1px solid var(--cycle-border)' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        <text x={12} y={H / 2 - 4} fontSize={28} fill="var(--cycle-fg)" fontFamily="Cormorant Garamond, Georgia, serif">{label}</text>
        <text x={12} y={H / 2 + 24} fontSize={18} fill="var(--cycle-muted)" fontFamily="Inter, system-ui">{Math.round(ma[ma.length - 1])}</text>

        {bands.map((b, i) => (
          <rect
            key={i}
            x={x(b.start) - (b.start === 0 ? 0 : innerW / 54)}
            y={PAD_T}
            width={x(b.end) - x(b.start) + innerW / 27}
            height={innerH}
            fill={PHASE_COLOR[b.phase]}
            opacity={0.12}
          />
        ))}
        <line x1={PAD_L} x2={W - PAD_R} y1={y(50)} y2={y(50)} stroke="var(--cycle-border)" strokeDasharray="2 4" />

        {values.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={2.4} fill={color} opacity={0.4} />
        ))}
        <path d={path} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />

        {/* Highlight marker */}
        <circle cx={hx} cy={hy} r={8} fill="none" stroke={color} strokeWidth={2.5} />
        <circle cx={hx} cy={hy} r={4} fill={color} />

        {/* Callout line + text */}
        <line x1={hx} y1={hy} x2={hx} y2={PAD_T + 14} stroke={color} strokeDasharray="3 3" strokeWidth={1.5} />
        <text
          x={hx < W / 2 ? hx + 10 : hx - 10}
          y={PAD_T + 12}
          fontSize={18}
          fill="var(--cycle-fg)"
          textAnchor={hx < W / 2 ? 'start' : 'end'}
          fontFamily="Inter, system-ui"
          fontWeight={500}
        >
          {note} (dag {highlightIdx + 1})
        </text>

        {[1, 7, 14, 21, 28].map(d => (
          <text key={d} x={x(d - 1)} y={H - 6} fontSize={16} fill="var(--cycle-muted)" textAnchor="middle">{d}</text>
        ))}
      </svg>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 14, height: 2, background: color, borderRadius: 2 }} />
      {label}
    </span>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function DemoTimelinePage() {
  const data = mockData()

  return (
    <main className="min-h-screen flex flex-col px-4 py-8" style={{ gap: 28 }}>
      <header>
        <h1 className="cycle-display text-3xl mb-1">Tijdlijn — visueel</h1>
        <p className="text-sm" style={{ color: 'var(--cycle-muted)' }}>
          28-daagse cyclus met 5-daags voortschrijdend gemiddelde op vier assen.
        </p>
      </header>

      <section>
        <h2 className="cycle-display text-2xl mb-1">A — Horizon</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--cycle-muted)' }}>
          Eén canvas. Vier MA-lijnen overlappend. Fase als achtergrondband. Compact, dashboard-feel.
        </p>
        <HorizonChart data={data} />
      </section>

      <section>
        <h2 className="cycle-display text-2xl mb-1">B — Small multiples</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--cycle-muted)' }}>
          Vier mini-grafieken stacked. Iedere as gescheiden, eigen fase-tint. Rustig, makkelijk per metric te lezen.
        </p>
        <StackedCharts data={data} />
      </section>

      <section>
        <h2 className="cycle-display text-2xl mb-1">C — Pattern story</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--cycle-muted)' }}>
          Eén kop-zin in NL plus de twee assen die deze cyclus het sterkst correleren. Insight first, data second.
        </p>
        <PatternStory data={data} />
      </section>

      <section>
        <h2 className="cycle-display text-2xl mb-1">D — Annotated stack</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--cycle-muted)' }}>
          Same layout als B, maar elke chart wijst zijn eigen opvallende dag aan. De grafiek vertelt zelf het verhaal.
        </p>
        <AnnotatedStack data={data} />
      </section>

      <p className="text-xs text-center" style={{ color: 'var(--cycle-muted)', marginTop: 20 }}>
        Mock data — terug via /Cycle/demo
      </p>
    </main>
  )
}

export const dynamic = 'force-static'
export const metadata = { title: 'Tijdlijn demo — Cycle Companion' }
