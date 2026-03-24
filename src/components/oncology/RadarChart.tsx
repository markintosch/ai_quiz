'use client'

import { DIMENSIONS } from '@/products/oncology/data'

interface RadarChartProps {
  scores: Record<string, number>
  size?: number
  primaryColor?: string
  secondaryScores?: Record<string, number>
}

export default function RadarChart({
  scores,
  size = 240,
  primaryColor = '#C8006E',
  secondaryScores,
}: RadarChartProps) {
  const n = DIMENSIONS.length
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.38
  const labelR = size * 0.47
  const MIN = 1; const MAX = 4

  // angle for axis i (start at top, go clockwise)
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2

  // radius for a given score value
  const r = (val: number) => ((val - MIN) / (MAX - MIN)) * maxR

  // point on a given axis at a given radius
  const pt = (i: number, val: number) => ({
    x: cx + r(val) * Math.cos(angle(i)),
    y: cy + r(val) * Math.sin(angle(i)),
  })

  // label position (outer ring)
  const labelPt = (i: number) => ({
    x: cx + labelR * Math.cos(angle(i)),
    y: cy + labelR * Math.sin(angle(i)),
  })

  // concentric grid rings (values 1,2,3,4)
  const gridRings = [1, 2, 3, 4]

  // polygon from scores
  const polygon = (scoreMap: Record<string, number>) =>
    DIMENSIONS.map((d, i) => {
      const val = Math.max(MIN, Math.min(MAX, scoreMap[d.id] ?? MIN))
      const p = pt(i, val)
      return `${p.x},${p.y}`
    }).join(' ')

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Market readiness radar chart"
    >
      {/* Grid rings */}
      {gridRings.map(v => {
        const ringR = r(v)
        const pts = DIMENSIONS.map((_, i) => {
          const p = pt(i, v)
          return `${p.x},${p.y}`
        }).join(' ')
        return (
          <polygon
            key={v}
            points={pts}
            fill="none"
            stroke={v === 4 ? 'rgba(31,41,112,0.15)' : 'rgba(31,41,112,0.08)'}
            strokeWidth="1"
          />
        )
      })}

      {/* Axis lines */}
      {DIMENSIONS.map((_, i) => {
        const outer = pt(i, MAX)
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={outer.x} y2={outer.y}
            stroke="rgba(31,41,112,0.1)"
            strokeWidth="1"
          />
        )
      })}

      {/* Secondary scores (baseline) */}
      {secondaryScores && (
        <polygon
          points={polygon(secondaryScores)}
          fill="rgba(200,0,110,0.06)"
          stroke="rgba(200,0,110,0.25)"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />
      )}

      {/* Primary scores */}
      <polygon
        points={polygon(scores)}
        fill={`${primaryColor}22`}
        stroke={primaryColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Score dots */}
      {DIMENSIONS.map((d, i) => {
        const val = Math.max(MIN, Math.min(MAX, scores[d.id] ?? MIN))
        const p = pt(i, val)
        return (
          <circle
            key={d.id}
            cx={p.x} cy={p.y} r={4}
            fill={primaryColor}
            stroke="white"
            strokeWidth="1.5"
          />
        )
      })}

      {/* Axis labels */}
      {DIMENSIONS.map((d, i) => {
        const lp = labelPt(i)
        const a = angle(i) * (180 / Math.PI) + 90
        // simple left/right/center anchoring
        const anchor = lp.x < cx - 10 ? 'end' : lp.x > cx + 10 ? 'start' : 'middle'
        const lines = d.short.length > 10 ? [d.short.slice(0, 10), d.short.slice(10)] : [d.short]
        return (
          <g key={d.id}>
            {lines.map((line, li) => (
              <text
                key={li}
                x={lp.x}
                y={lp.y + li * 11}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={9}
                fontWeight="600"
                fill="#1F2970"
                fontFamily="-apple-system, sans-serif"
              >
                {line}
              </text>
            ))}
          </g>
        )
      })}

      {/* Centre dot */}
      <circle cx={cx} cy={cy} r={2.5} fill="rgba(31,41,112,0.2)" />
    </svg>
  )
}
