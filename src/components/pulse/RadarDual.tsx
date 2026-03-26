'use client'

interface DimensionItem {
  slug: string
  label: string
  anchorLow?: string
  anchorHigh?: string
}

interface RadarDualProps {
  yours: Record<string, number>
  collective: Record<string, number>
  dimensions: DimensionItem[]
  size?: number
}

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

function buildPolygonPoints(
  cx: number,
  cy: number,
  maxR: number,
  values: number[],
  angles: number[],
): string {
  return values
    .map((v, i) => {
      const r = (v / 5) * maxR
      const pt = polarToCartesian(cx, cy, r, angles[i])
      return `${pt.x},${pt.y}`
    })
    .join(' ')
}

export default function RadarDual({ yours, collective, dimensions, size = 320 }: RadarDualProps) {
  const n = dimensions.length
  const cx = size / 2
  const cy = size / 2
  // Leave room for labels
  const maxR = size / 2 - 48

  // Angles: start from top (-π/2), evenly spaced
  const angles = dimensions.map((_, i) => -Math.PI / 2 + (2 * Math.PI * i) / n)

  const yourValues = dimensions.map((d) => yours[d.slug] ?? 1)
  const collectiveValues = dimensions.map((d) => collective[d.slug] ?? 1)

  // Grid rings at 1,2,3,4,5
  const rings = [1, 2, 3, 4, 5]

  // Axis end points (at ring 5)
  const axisPoints = angles.map((a) => polarToCartesian(cx, cy, maxR, a))

  // Label positions (slightly beyond max ring)
  const labelDist = maxR + 24
  const labelPoints = angles.map((a, i) => ({
    ...polarToCartesian(cx, cy, labelDist, a),
    label: dimensions[i].label,
    angle: a,
  }))

  const yourPolygon = buildPolygonPoints(cx, cy, maxR, yourValues, angles)
  const collectivePolygon = buildPolygonPoints(cx, cy, maxR, collectiveValues, angles)

  // Build ring polygon strings
  function ringPolygon(ringVal: number) {
    return angles
      .map((a) => {
        const r = (ringVal / 5) * maxR
        const pt = polarToCartesian(cx, cy, r, a)
        return `${pt.x},${pt.y}`
      })
      .join(' ')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block' }}
      >
        {/* Grid rings */}
        {rings.map((r) => (
          <polygon
            key={r}
            points={ringPolygon(r)}
            fill="none"
            stroke="#424242"
            strokeWidth="0.5"
          />
        ))}

        {/* Axes */}
        {axisPoints.map((pt, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={pt.x}
            y2={pt.y}
            stroke="#424242"
            strokeWidth="1"
          />
        ))}

        {/* Collective polygon */}
        <polygon
          points={collectivePolygon}
          fill="rgba(130,130,130,0.08)"
          stroke="#828282"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />

        {/* Your polygon */}
        <polygon
          points={yourPolygon}
          fill="rgba(227,239,56,0.15)"
          stroke="#e3ef38"
          strokeWidth="2"
        />

        {/* Axis labels */}
        {labelPoints.map((lp, i) => {
          const a = lp.angle
          // Determine text anchor based on angle position
          let anchor: 'start' | 'middle' | 'end' = 'middle'
          if (Math.cos(a) > 0.1) anchor = 'start'
          else if (Math.cos(a) < -0.1) anchor = 'end'

          return (
            <text
              key={i}
              x={lp.x}
              y={lp.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="#828282"
              fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif"
            >
              {lp.label}
            </text>
          )
        })}
      </svg>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="20" height="12">
            <line x1="0" y1="6" x2="20" y2="6" stroke="#e3ef38" strokeWidth="2" />
          </svg>
          <span style={{ color: '#e3ef38' }}>Jouw beoordeling</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="20" height="12">
            <line
              x1="0"
              y1="6"
              x2="20"
              y2="6"
              stroke="#828282"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          </svg>
          <span style={{ color: '#828282' }}>Gemiddelde</span>
        </div>
      </div>
    </div>
  )
}
