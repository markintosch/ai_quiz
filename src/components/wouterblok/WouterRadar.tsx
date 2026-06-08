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

function wrapLabel(label: string): string[] {
  const words = label.split(' ')
  if (words.length < 2) return [label]
  if (words.length === 2) return words
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

export function WouterRadar({ axes, size = 320, animate = true }: WouterRadarProps) {
  const n   = axes.length
  // Extra horizontal room inside the viewBox so left/right axis labels never
  // clip (they render outside the square, which clipped on narrow screens).
  const marginX  = size * 0.24
  const viewW    = size + marginX * 2
  const cx  = viewW / 2
  const cy  = size / 2
  const r   = size * 0.32
  const pad = size * 0.105

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
      viewBox={`0 0 ${viewW} ${size}`}
      style={{ maxWidth: viewW, display: 'block', margin: '0 auto', overflow: 'hidden' }}
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
        const x = cx + frac * r * Math.cos(angle)
        const y = cy + frac * r * Math.sin(angle)
        const weak = axes[i].weak
        return (
          <g key={i}>
            {weak && <circle cx={x} cy={y} r={8} fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.35} />}
            <circle cx={x} cy={y} r={weak ? 5 : 4} fill={weak ? GOLD : ACCENT} stroke="#fff" strokeWidth={1.5} />
          </g>
        )
      })}

      {axes.map((a, i) => {
        const angle = toRad(-90 + (360 / n) * i)
        const x = cx + (r + pad) * Math.cos(angle)
        const y = cy + (r + pad) * Math.sin(angle)
        const anchor = x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle'
        const lines = wrapLabel(a.label)
        const fs = size * 0.038
        const lh = fs * 1.15
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
            fontSize={fs} fontWeight={a.weak ? 800 : 600}
            fill={a.weak ? GOLD : LABEL}
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
            {lines.map((ln, li) => (
              <tspan key={li} x={x} dy={li === 0 ? -((lines.length - 1) * lh) / 2 : lh}>{ln}</tspan>
            ))}
          </text>
        )
      })}
    </svg>
  )
}
