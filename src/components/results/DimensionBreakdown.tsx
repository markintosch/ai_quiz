'use client'

import { motion } from 'framer-motion'
import type { DimensionScore } from '@/types'

interface DimensionBreakdownProps {
  scores: DimensionScore[]
}

export function DimensionBreakdown({ scores }: DimensionBreakdownProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-5">Dimension Breakdown</h3>
      <div className="space-y-4">
        {scores.map((ds, i) => (
          <motion.div
            key={ds.dimension}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-gray-700">{ds.label}</span>
              <span className="text-sm font-semibold text-gray-900">{ds.normalized}/100</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className={`h-2.5 rounded-full ${barColor(ds.normalized)}`}
                initial={{ width: 0 }}
                animate={{ width: `${ds.normalized}%` }}
                transition={{ delay: i * 0.08 + 0.2, duration: 0.7, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function barColor(score: number): string {
  if (score <= 20) return 'bg-red-500'
  if (score <= 40) return 'bg-orange-400'
  if (score <= 60) return 'bg-yellow-400'
  if (score <= 80) return 'bg-teal-400'
  return 'bg-green-500'
}
