// SVG radar chart — 6 dimensions overlaid by role.

import { getContent, type Lang } from '@/products/ai_benchmark/data'

const INK    = '#0F172A'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'

type Series = {
  id:    string
  label: string
  color: string
  values: number[]   // length === axes.length, each 0–100
}

export function Radar({
  axes, series, size = 280, lang = 'nl',
}: {
  axes:   { id: string; label: string }[]
  series: Series[]
  size?:  number
  lang?:  Lang
}) {
  const t = getContent(lang)
  const cx = size / 2
  const cy = size / 2
  const r  = size / 2 - 36   // padding for labels

  const angleFor = (i: number) => (Math.PI * 2 * i) / axes.length - Math.PI / 2
  const point = (i: number, value: number) => {
    const a = angleFor(i)
    const d = (value / 100) * r
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d] as const
  }

  // Concentric grid rings at 25/50/75/100
  const rings = [0.25, 0.5, 0.75, 1.0]

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Concentric rings */}
        {rings.map((ring, i) => {
          const pts = axes.map((_, idx) => {
            const a = angleFor(idx); const d = ring * r
            return `${cx + Math.cos(a) * d},${cy + Math.sin(a) * d}`
          }).join(' ')
          return (
            <polygon
              key={i}
              points={pts}
              fill="none"
              stroke={BORDER}
              strokeWidth={1}
              strokeDasharray={ring === 1 ? '0' : '2,3'}
            />
          )
        })}

        {/* Axes lines + labels */}
        {axes.map((ax, i) => {
          const a = angleFor(i)
          const x = cx + Math.cos(a) * r
          const y = cy + Math.sin(a) * r
          const lx = cx + Math.cos(a) * (r + 18)
          const ly = cy + Math.sin(a) * (r + 18)
          return (
            <g key={ax.id}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={BORDER} strokeWidth={1} />
              <text
                x={lx} y={ly}
                fontSize={11} fill={INK} fontWeight={700}
                textAnchor={Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle'}
                dominantBaseline={Math.sin(a) > 0.3 ? 'hanging' : Math.sin(a) < -0.3 ? 'auto' : 'middle'}
              >
                {ax.label}
              </text>
            </g>
          )
        })}

        {/* Series polygons */}
        {series.map(s => {
          const pts = s.values.map((v, i) => point(i, v).join(',')).join(' ')
          return (
            <g key={s.id}>
              <polygon points={pts} fill={s.color} fillOpacity={0.22} stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
              {s.values.map((v, i) => {
                const [x, y] = point(i, v)
                return <circle key={i} cx={x} cy={y} r={3.5} fill={s.color} stroke="#fff" strokeWidth={1.5} />
              })}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        {series.map(s => (
          <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: INK, fontWeight: 600 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, display: 'inline-block' }} />
            {s.label}
          </span>
        ))}
      </div>

      <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>{t.radarRange}</p>
    </div>
  )
}
