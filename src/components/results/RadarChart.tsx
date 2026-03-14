'use client'

import { useEffect, useRef, useState } from 'react'
import type { DimensionScore } from '@/types'

interface RadarChartProps {
  dimensionScores: DimensionScore[]
  /** Size of the SVG canvas in px (it's square). Default 300 */
  size?: number
  /** Animate polygon on mount. Default true */
  animate?: boolean
}

const COLORS = {
  user:     '#E8611A', // brand-accent orange
  baseline: '#6b7280', // gray-500
  grid:     '#e5e7eb', // gray-200
  axis:     '#d1d5db', // gray-300
  fill:     'rgba(232, 97, 26, 0.15)',
  baseFill: 'rgba(107, 114, 128, 0.08)',
}

// Short labels for the radar axes
const SHORT_LABELS: Record<string, string> = {
  strategy_vision:       'Strategy',
  current_usage:         'Usage',
  data_readiness:        'Data',
  talent_culture:        'Talent',
  governance_risk:       'Governance',
  opportunity_awareness: 'Opportunity',
}

function toRad(deg: number) { return (deg * Math.PI) / 180 }

/** Compute polygon points for a radar chart with n axes */
function polygonPoints(
  values: number[],   // 0-100 each
  cx: number,
  cy: number,
  r: number
): string {
  const n = values.length
  return values
    .map((v, i) => {
      const angle = toRad(-90 + (360 / n) * i)
      const frac = v / 100
      const x = cx + frac * r * Math.cos(angle)
      const y = cy + frac * r * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')
}

/** Compute label position for axis i */
function labelPos(i: number, n: number, cx: number, cy: number, r: number, padding: number) {
  const angle = toRad(-90 + (360 / n) * i)
  return {
    x: cx + (r + padding) * Math.cos(angle),
    y: cy + (r + padding) * Math.sin(angle),
  }
}

export function RadarChart({ dimensionScores, size = 300, animate = true }: RadarChartProps) {
  const n      = dimensionScores.length
  const cx     = size / 2
  const cy     = size / 2
  const r      = size * 0.33   // radar radius
  const levels = 4             // grid rings (25, 50, 75, 100)
  const labelPad = size * 0.09

  const userValues     = dimensionScores.map(d => d.normalized)
  const baselineValues = dimensionScores.map(() => 50)

  // Animate the user polygon from 0 → actual on mount
  const [progress, setProgress] = useState(animate ? 0 : 1)
  const rafRef  = useRef<number | null>(null)
  const startTs = useRef<number | null>(null)
  const DURATION = 800 // ms

  useEffect(() => {
    if (!animate) return
    startTs.current = null
    function step(ts: number) {
      if (!startTs.current) startTs.current = ts
      const p = Math.min((ts - startTs.current) / DURATION, 1)
      // ease-out cubic
      setProgress(1 - Math.pow(1 - p, 3))
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [animate])

  const animatedValues = userValues.map(v => v * progress)

  // Grid ring labels (25 50 75 100) — placed on the right axis (index 0, -90° = up, so index 1 at -30°)
  const ringValues = [25, 50, 75, 100]

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
      aria-label="AI Maturity Radar Chart"
    >
      {/* ── Grid rings ── */}
      {ringValues.map((rv) => {
        const pts = polygonPoints(Array(n).fill(rv), cx, cy, r)
        return (
          <polygon
            key={rv}
            points={pts}
            fill="none"
            stroke={rv === 50 ? COLORS.baseline : COLORS.grid}
            strokeWidth={rv === 50 ? 1.5 : 1}
            strokeDasharray={rv === 50 ? '4 3' : undefined}
          />
        )
      })}

      {/* ── Axis lines ── */}
      {dimensionScores.map((_, i) => {
        const angle = toRad(-90 + (360 / n) * i)
        const x2 = cx + r * Math.cos(angle)
        const y2 = cy + r * Math.sin(angle)
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={x2} y2={y2}
            stroke={COLORS.axis}
            strokeWidth={1}
          />
        )
      })}

      {/* ── Baseline polygon (50) ── */}
      <polygon
        points={polygonPoints(baselineValues, cx, cy, r)}
        fill={COLORS.baseFill}
        stroke={COLORS.baseline}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />

      {/* ── User score polygon ── */}
      <polygon
        points={polygonPoints(animatedValues, cx, cy, r)}
        fill={COLORS.fill}
        stroke={COLORS.user}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* ── User score dots ── */}
      {animatedValues.map((v, i) => {
        const angle = toRad(-90 + (360 / n) * i)
        const frac  = v / 100
        const x = cx + frac * r * Math.cos(angle)
        const y = cy + frac * r * Math.sin(angle)
        return (
          <circle
            key={i}
            cx={x} cy={y} r={4}
            fill={COLORS.user}
            stroke="#fff"
            strokeWidth={1.5}
          />
        )
      })}

      {/* ── Axis labels ── */}
      {dimensionScores.map((ds, i) => {
        const pos = labelPos(i, n, cx, cy, r, labelPad)
        const label = SHORT_LABELS[ds.dimension] ?? ds.label
        // Determine text-anchor based on horizontal position
        const textAnchor =
          pos.x < cx - 5 ? 'end' :
          pos.x > cx + 5 ? 'start' : 'middle'

        return (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fontSize={size * 0.042}
            fontWeight="600"
            fill="#374151"
            fontFamily="Inter, -apple-system, sans-serif"
          >
            {label}
          </text>
        )
      })}

      {/* Score value labels disabled — scores are shown in the dimension breakdown list below */}

      {/* ── Legend ── */}
      <g transform={`translate(${cx - 60}, ${size - size * 0.06})`}>
        <line x1={0} y1={0} x2={16} y2={0} stroke={COLORS.user} strokeWidth={2.5} />
        <circle cx={8} cy={0} r={3} fill={COLORS.user} />
        <text x={20} y={0} dominantBaseline="middle" fontSize={size * 0.038} fill="#374151" fontFamily="Inter, sans-serif">
          Your score
        </text>
      </g>
      <g transform={`translate(${cx + 14}, ${size - size * 0.06})`}>
        <line x1={0} y1={0} x2={16} y2={0} stroke={COLORS.baseline} strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={20} y={0} dominantBaseline="middle" fontSize={size * 0.038} fill="#6b7280" fontFamily="Inter, sans-serif">
          Market avg
        </text>
      </g>
    </svg>
  )
}
