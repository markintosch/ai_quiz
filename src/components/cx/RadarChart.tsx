'use client'

import { DIMENSIONS } from '@/products/cx/data'

interface RadarChartProps {
  scores: Record<string, number>
  size?: number
  primaryColor?: string
}

export default function CxRadarChart({
  scores,
  size = 260,
  primaryColor = '#4B9FD6',
}: RadarChartProps) {
  const n = DIMENSIONS.length
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.37
  const labelR = size * 0.47
  const MIN = 1; const MAX = 4

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const r = (val: number) => ((val - MIN) / (MAX - MIN)) * maxR
  const pt = (i: number, val: number) => ({
    x: cx + r(val) * Math.cos(angle(i)),
    y: cy + r(val) * Math.sin(angle(i)),
  })
  const labelPt = (i: number) => ({
    x: cx + labelR * Math.cos(angle(i)),
    y: cy + labelR * Math.sin(angle(i)),
  })

  const polygon = (scoreMap: Record<string, number>) =>
    DIMENSIONS.map((d, i) => {
      const val = Math.max(MIN, Math.min(MAX, scoreMap[d.id] ?? MIN))
      const p = pt(i, val)
      return `${p.x},${p.y}`
    }).join(' ')

  const gridRings = [1, 2, 3, 4]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="CX maturity radar chart">
      {/* Soft filled grid rings */}
      {gridRings.map(v => {
        const pts = DIMENSIONS.map((_, i) => {
          const p = pt(i, v)
          return `${p.x},${p.y}`
        }).join(' ')
        return (
          <polygon
            key={v}
            points={pts}
            fill={v === 4 ? 'rgba(75,159,214,0.04)' : 'none'}
            stroke={v === 4 ? 'rgba(75,159,214,0.2)' : 'rgba(75,159,214,0.1)'}
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
            stroke="rgba(75,159,214,0.15)"
            strokeWidth="1"
          />
        )
      })}

      {/* Score polygon */}
      <polygon
        points={polygon(scores)}
        fill={`${primaryColor}18`}
        stroke={primaryColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {DIMENSIONS.map((d, i) => {
        const val = Math.max(MIN, Math.min(MAX, scores[d.id] ?? MIN))
        const p = pt(i, val)
        return (
          <circle
            key={d.id}
            cx={p.x} cy={p.y} r={4.5}
            fill={primaryColor}
            stroke="white"
            strokeWidth="2"
          />
        )
      })}

      {/* Labels */}
      {DIMENSIONS.map((d, i) => {
        const lp = labelPt(i)
        const anchor = lp.x < cx - 10 ? 'end' : lp.x > cx + 10 ? 'start' : 'middle'
        return (
          <text
            key={d.id}
            x={lp.x}
            y={lp.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={9}
            fontWeight="700"
            fill="#475569"
            fontFamily="-apple-system, sans-serif"
          >
            {d.short}
          </text>
        )
      })}

      {/* Centre dot */}
      <circle cx={cx} cy={cy} r={2.5} fill="rgba(75,159,214,0.25)" />
    </svg>
  )
}
