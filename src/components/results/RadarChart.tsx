'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { DimensionScore } from '@/types'

interface RadarChartProps {
  dimensionScores: DimensionScore[]
  /** Size of the SVG canvas in px (it's square). Default 300 */
  size?: number
  /** Animate polygon on mount. Default true */
  animate?: boolean
  /** Use light colours for legend/labels when rendered on a dark background */
  dark?: boolean
  /** Optional second dataset (wave 0 ghost outline for wave comparison) */
  secondaryData?: DimensionScore[]
  /** Label for primary data in legend when secondaryData is present */
  primaryLabel?: string
  /** Label for secondary data in legend when secondaryData is present */
  secondaryLabel?: string
}

const COLORS = {
  user:      '#E8611A', // brand-accent orange (single wave / wave 1)
  baseline:  '#6b7280', // gray-500
  grid:      '#e5e7eb', // gray-200
  axis:      '#d1d5db', // gray-300
  fill:      'rgba(232, 97, 26, 0.15)',
  baseFill:  'rgba(107, 114, 128, 0.08)',
  // Wave overlay colours
  wave1:     '#0D7377', // teal — current/wave 1
  wave1Fill: 'rgba(13, 115, 119, 0.15)',
  wave0:     '#1B4080', // cobalt — previous/wave 0
  wave0Fill: 'rgba(27, 64, 128, 0.10)',
}

// Short labels fallback for the radar axes
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

export function RadarChart({ dimensionScores, size = 300, animate = true, dark = false, secondaryData, primaryLabel, secondaryLabel }: RadarChartProps) {
  const t = useTranslations('results')

  const labelColor  = dark ? '#e5e7eb' : '#374151'   // gray-200 vs gray-700
  const legendMuted = dark ? '#9ca3af' : '#6b7280'   // gray-400 vs gray-500

  const n        = dimensionScores.length
  const cx       = size / 2
  const cy       = size / 2
  const r        = size * 0.30   // slightly smaller radius to give labels more room
  const labelPad = size * 0.10
  const legendY  = size + 22    // legend sits below the chart content

  const hasOverlay     = Boolean(secondaryData && secondaryData.length === dimensionScores.length)
  const userValues     = dimensionScores.map(d => d.normalized)
  const baselineValues = dimensionScores.map(() => 50)
  const secondaryValues = secondaryData?.map(d => d.normalized) ?? []

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

  const ringValues = [25, 50, 75, 100]

  return (
    <svg
      width={size}
      height={legendY + 12}
      viewBox={`0 0 ${size} ${legendY + 12}`}
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

      {/* ── Baseline polygon (50) — only shown in single-wave mode ── */}
      {!hasOverlay && (
        <polygon
          points={polygonPoints(baselineValues, cx, cy, r)}
          fill={COLORS.baseFill}
          stroke={COLORS.baseline}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}

      {/* ── Wave 0 ghost polygon (overlay mode only) ── */}
      {hasOverlay && secondaryValues.length > 0 && (
        <polygon
          points={polygonPoints(secondaryValues, cx, cy, r)}
          fill={COLORS.wave0Fill}
          stroke={COLORS.wave0}
          strokeWidth={1.5}
          strokeDasharray="5 3"
          strokeLinejoin="round"
        />
      )}

      {/* ── User / Wave 1 score polygon ── */}
      <polygon
        points={polygonPoints(animatedValues, cx, cy, r)}
        fill={hasOverlay ? COLORS.wave1Fill : COLORS.fill}
        stroke={hasOverlay ? COLORS.wave1 : COLORS.user}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* ── User / Wave 1 score dots ── */}
      {animatedValues.map((v, i) => {
        const angle = toRad(-90 + (360 / n) * i)
        const frac  = v / 100
        const x = cx + frac * r * Math.cos(angle)
        const y = cy + frac * r * Math.sin(angle)
        return (
          <circle
            key={i}
            cx={x} cy={y} r={4}
            fill={hasOverlay ? COLORS.wave1 : COLORS.user}
            stroke="#fff"
            strokeWidth={1.5}
          />
        )
      })}

      {/* ── Axis labels ── */}
      {dimensionScores.map((ds, i) => {
        const pos = labelPos(i, n, cx, cy, r, labelPad)
        const label = t(`radarShortLabels.${ds.dimension}` as Parameters<typeof t>[0]) || SHORT_LABELS[ds.dimension] || ds.label
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
            fill={labelColor}
            fontFamily="Inter, -apple-system, sans-serif"
          >
            {label}
          </text>
        )
      })}

      {/* Score value labels disabled — scores are shown in the dimension breakdown list below */}

      {/* ── Legend ── */}
      {hasOverlay ? (
        <>
          <g transform={`translate(${cx - 80}, ${legendY})`}>
            <line x1={0} y1={0} x2={16} y2={0} stroke={COLORS.wave1} strokeWidth={2.5} />
            <circle cx={8} cy={0} r={3} fill={COLORS.wave1} />
            <text x={20} y={0} dominantBaseline="middle" fontSize={size * 0.038} fill={labelColor} fontFamily="Inter, sans-serif">
              {primaryLabel ?? 'Wave 1'}
            </text>
          </g>
          <g transform={`translate(${cx + 8}, ${legendY})`}>
            <line x1={0} y1={0} x2={16} y2={0} stroke={COLORS.wave0} strokeWidth={1.5} strokeDasharray="5 3" />
            <text x={20} y={0} dominantBaseline="middle" fontSize={size * 0.038} fill={legendMuted} fontFamily="Inter, sans-serif">
              {secondaryLabel ?? 'Wave 0'}
            </text>
          </g>
        </>
      ) : (
        <>
          <g transform={`translate(${cx - 68}, ${legendY})`}>
            <line x1={0} y1={0} x2={16} y2={0} stroke={COLORS.user} strokeWidth={2.5} />
            <circle cx={8} cy={0} r={3} fill={COLORS.user} />
            <text x={20} y={0} dominantBaseline="middle" fontSize={size * 0.038} fill={labelColor} fontFamily="Inter, sans-serif">
              {t('legend.yourScore')}
            </text>
          </g>
          <g transform={`translate(${cx + 10}, ${legendY})`}>
            <line x1={0} y1={0} x2={16} y2={0} stroke={COLORS.baseline} strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={20} y={0} dominantBaseline="middle" fontSize={size * 0.038} fill={legendMuted} fontFamily="Inter, sans-serif">
              {t('legend.baseline')}
            </text>
          </g>
        </>
      )}
    </svg>
  )
}
