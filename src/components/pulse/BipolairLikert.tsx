'use client'

interface DimensionProps {
  slug: string
  label: string
  anchorLow: string
  anchorHigh: string
}

interface BipolairLikertProps {
  dimension: DimensionProps
  value: number | null
  onChange: (v: number) => void
}

export default function BipolairLikert({ dimension, value, onChange }: BipolairLikertProps) {
  const options = [1, 2, 3, 4, 5]

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        marginBottom: '32px',
      }}
    >
      {/* Label */}
      <p
        style={{
          fontWeight: 700,
          color: '#121212',
          fontSize: '16px',
          lineHeight: '1.2',
          marginBottom: '16px',
        }}
      >
        {dimension.label}
      </p>

      {/* Scale row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Anchor low */}
        <p
          style={{
            color: '#616162',
            fontSize: '12px',
            lineHeight: '1.4',
            margin: 0,
            textAlign: 'left',
          }}
        >
          {dimension.anchorLow}
        </p>

        {/* Radio buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          {options.map((n) => {
            const selected = value === n
            return (
              <button
                key={n}
                onClick={() => onChange(n)}
                aria-label={`Score ${n}`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: selected ? '2px solid #e3ef38' : '2px solid #424242',
                  background: selected ? '#e3ef38' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: '12px',
                  fontWeight: selected ? 700 : 400,
                  color: selected ? '#121212' : '#424242',
                  transition: 'background 0.12s, border-color 0.12s',
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                {n}
              </button>
            )
          })}
        </div>

        {/* Anchor high */}
        <p
          style={{
            color: '#616162',
            fontSize: '12px',
            lineHeight: '1.4',
            margin: 0,
            textAlign: 'right',
          }}
        >
          {dimension.anchorHigh}
        </p>
      </div>
    </div>
  )
}
