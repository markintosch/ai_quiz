'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

interface DimDelta {
  label: string
  delta: number
}

interface Props {
  deltas: DimDelta[]
  wave0Label?: string
  wave1Label?: string
}

export function DimensionDeltaChart({ deltas, wave0Label = 'Wave 0', wave1Label = 'Wave 1' }: Props) {
  if (!deltas.length) return null

  const data = [...deltas].sort((a, b) => b.delta - a.delta)

  return (
    <div>
      <div className="flex items-center gap-4 mb-2 text-xs text-gray-500">
        <span>Change from <strong>{wave0Label}</strong> to <strong>{wave1Label}</strong> per dimension</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 0, left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis
            type="number"
            domain={['auto', 'auto']}
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickFormatter={v => `${v > 0 ? '+' : ''}${v}`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: '#374151' }}
            width={95}
          />
          <Tooltip
            formatter={(value) => {
              const v = Number(value)
              return [`${v > 0 ? '+' : ''}${v}`, 'Change']
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
          />
          <ReferenceLine x={0} stroke="#CBD5E1" strokeWidth={1.5} />
          <Bar dataKey="delta" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.delta >= 0 ? '#0D7377' : '#D4841A'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-2 text-center">Teal = improvement · Amber = decline</p>
    </div>
  )
}
