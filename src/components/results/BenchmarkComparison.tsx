'use client'

import { motion } from 'framer-motion'

export interface BenchmarkData {
  market:  { avg: number; count: number }
  cohort?: { avg: number; count: number; name: string }
  role?:   { avg: number; count: number; role: string }
}

interface BenchmarkComparisonProps {
  yourScore: number
  benchmark: BenchmarkData
}

interface BarRowProps {
  label: string
  sublabel: string
  score: number
  yourScore: number
  index: number
}

function BarRow({ label, sublabel, score, yourScore, index }: BarRowProps) {
  const isAhead = yourScore > score
  const diff = Math.abs(yourScore - score)

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-500 text-xs ml-2">{sublabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{Math.round(score)}</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
            isAhead
              ? 'bg-green-100 text-green-700'
              : diff === 0
                ? 'bg-gray-100 text-gray-500'
                : 'bg-orange-100 text-orange-700'
          }`}>
            {isAhead ? `+${diff}` : diff === 0 ? '=' : `-${diff}`} vs you
          </span>
        </div>
      </div>

      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        {/* Benchmark bar */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gray-300 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.7, ease: 'easeOut' }}
        />
        {/* Your score marker */}
        <motion.div
          className="absolute inset-y-0 w-0.5 bg-brand-accent"
          initial={{ left: 0 }}
          animate={{ left: `${yourScore}%` }}
          transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span className="text-brand-accent font-medium">You: {yourScore}</span>
        <span>100</span>
      </div>
    </motion.div>
  )
}

export function BenchmarkComparison({ yourScore, benchmark }: BenchmarkComparisonProps) {
  const rows: { label: string; sublabel: string; score: number }[] = [
    {
      label: 'Market average',
      sublabel: `${benchmark.market.count.toLocaleString()} respondents`,
      score: benchmark.market.avg,
    },
  ]

  if (benchmark.cohort) {
    rows.push({
      label: 'Your cohort',
      sublabel: `${benchmark.cohort.name} · ${benchmark.cohort.count} people`,
      score: benchmark.cohort.avg,
    })
  }

  if (benchmark.role) {
    rows.push({
      label: 'Same role',
      sublabel: `${benchmark.role.role} · ${benchmark.role.count} people`,
      score: benchmark.role.avg,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-lg flex-shrink-0">
          📊
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">How you compare</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Your score benchmarked against others who took this assessment.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {rows.map((row, i) => (
          <BarRow
            key={row.label}
            label={row.label}
            sublabel={row.sublabel}
            score={row.score}
            yourScore={yourScore}
            index={i}
          />
        ))}
      </div>

      {benchmark.market.count < 10 && (
        <p className="text-xs text-gray-500 mt-4 border-t border-gray-50 pt-3">
          Benchmarks become more meaningful as more people complete the assessment.
        </p>
      )}
    </motion.div>
  )
}
