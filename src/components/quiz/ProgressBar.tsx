'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const t = useTranslations('quiz')
  const pct = Math.round((current / total) * 100)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t('progress', { current, total })}
        </span>
        <motion.span
          key={pct}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold text-brand-accent"
        >
          {pct}%
        </motion.span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="h-1.5 rounded-full bg-brand-accent"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
