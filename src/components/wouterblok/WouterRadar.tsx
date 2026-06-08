'use client'

import { useEffect, useRef, useState } from 'react'

// Self-contained radar for the Growth Flywheel Scan. No next-intl, no shared
// brand tokens: wouterblok lives outside the [locale] provider and uses its own
// emerald/navy palette, so it cannot reuse src/components/results/RadarChart.tsx.

const ACCENT     = '#0E9F6E'
const ACCENT_DIM = 'rgba(14,159,110,0.16)'
const GOLD       = '#E8920A'
const GRID       = '#E2E8E5'
const AXIS       = '#CBD6D0'
const LABEL      = '#0C2B3A'

export interface RadarAxis {
  label: string
  /** 0–100 */
  value: number
  /** highlight this axis (e.g. the weakest pillar) in gold */
  weak?: boolean
}

interface WouterRadarProps {
  axes: RadarAxis[]
  size?: number
  animate?: boolean
}

function toRad(deg: number) { return (deg * Math.PI) / 180 }

function points(values: number[], cx: number, cy: number, r: number): string {
  const n = values.length
  return values.map((v, i) => {
    const angle = toRad(-90 + (360 / n) * i)
    const frac = Math.max(0, Math.min(100, v)) / 100
    return `${cx + frac * r * Math.cos(angle)},${cy + frac * r * Math.sin(angle)}`
  }).join(' ')
}

export function WouterRadar({ axes, size = 320, animate = true }: WouterRadarProps) {
  const n   = axes.length
  const cx  = size / 2
  const cy  = size / 2
  const r   = size * 0.30
  const pad = size * 0.115

  const [progress, setProgress] = useState(animate ? 0 : 1)
  const rafRef  = useRef<number | null>(null)
  const startTs = useRef<number | null>(null)

  useEffect(() => {
    if (!animate) return
    startTs.current = null
    const step = (ts: number) => {
      if (!startTs.current) startTs.current = ts
      const p = Math.min((ts - startTs.current) / 800, 1)
      setProgress(1 - Math.pow(1 - p, 3))
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [animate])

  const values    = axes.map(a => a.value * progress)
  const ringSteps = [25, 50, 75, 100]

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${size} ${size}`}
      style={{ maxWidth: size, display: 'block', margin: '0 auto', overflow: 'visible' }}
      role="img"
      aria-label="Growth flywheel radar"
    >
      {ringSteps.map(rv => (
        <polygon key={rv} points={points(Array(n).fill(rv), cx, cy, r)}
          fill="none" stroke={GRID} strokeWidth={1} />
      ))}

      {axes.map((_, i) => {
        const angle = toRad(-90 + (360 / n) * i)
        return (
          <line key={i} x1={cx} y1={cy}
            x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)}
            stroke={AXIS} strokeWidth={1} />
        )
      })}

      <polygon points={points(values, cx, cy, r)}
        fill={ACCENT_DIM} stroke={ACCENT} strokeWidth={2.5} strokeLinejoin="round" />

      {values.map((v, i) => {
        const angle = toRad(-90 + (360 / n) * i)
        const frac  = v / 100
        return (
          <circle key={i}
            cx={cx + frac * r * Math.cos(angle)} cy={cy + frac * r * Math.sin(angle)}
            r={4} fill={axes[i].weak ? GOLD : ACCENT} stroke="#fff" strokeWidth={1.5} />
        )
      })}

      {axes.map((a, i) => {
        const angle = toRad(-90 + (360 / n) * i)
        const x = cx + (r + pad) * Math.cos(angle)
        const y = cy + (r + pad) * Math.sin(angle)
        const anchor = x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle'
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
            fontSize={size * 0.039} fontWeight={a.weak ? 800 : 600}
            fill={a.weak ? GOLD : LABEL}
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}
