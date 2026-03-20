'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts'

const BANDS = [
  { label: '0–20',  min: 0,  max: 20,  color: '#DC2626' },
  { label: '21–40', min: 21, max: 40,  color: '#F59E0B' },
  { label: '41–60', min: 41, max: 60,  color: '#F5A820' },
  { label: '61–80', min: 61, max: 80,  color: '#2A9D8F' },
  { label: '81–100',min: 81, max: 100, color: '#22C55E' },
]

function scoreToBand(score: number): string {
  for (const b of BANDS) {
    if (score >= b.min && score <= b.max) return b.label
  }
  return '81–100'
}

interface Props {
  wave0Scores: number[]
  wave1Scores?: number[]
  wave0Label?: string
  wave1Label?: string
}

export function ScoreDistributionChart({ wave0Scores, wave1Scores, wave0Label = 'Wave 0', wave1Label = 'Wave 1' }: Props) {
  const hasWave1 = wave1Scores && wave1Scores.length > 0

  const data = BANDS.map(band => {
    const w0 = wave0Scores.filter(s => s >= band.min && s <= band.max).length
    const w1 = hasWave1 ? wave1Scores!.filter(s => s >= band.min && s <= band.max).length : undefined
    return { band: band.label, [wave0Label]: w0, ...(hasWave1 ? { [wave1Label]: w1 } : {}) }
  })

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="band" tick={{ fontSize: 11, fill: '#64748B' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
          />
          {hasWave1 && <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />}
          <Bar dataKey={wave0Label} fill="#1B4080" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={BANDS[i].color} fillOpacity={hasWave1 ? 0.5 : 0.85} />
            ))}
          </Bar>
          {hasWave1 && (
            <Bar dataKey={wave1Label} fill="#0D7377" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={BANDS[i].color} />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-2 text-center">Score distribution by band. All 5 bands always shown.</p>
    </div>
  )
}
