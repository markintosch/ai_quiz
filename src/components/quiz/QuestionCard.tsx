'use client'

import { motion } from 'framer-motion'
import type { Question } from '@/data/questions'

interface QuestionCardProps {
  question: Question
  answer: number | string[] | undefined
  onAnswer: (value: number | string[]) => void
  direction?: 1 | -1
}

export function QuestionCard({ question, answer, onAnswer, direction = 1 }: QuestionCardProps) {
  const isMultiselect = question.type === 'multiselect'

  function handleMultiselectToggle(label: string) {
    const current = Array.isArray(answer) ? answer : []
    const next = current.includes(label)
      ? current.filter(v => v !== label)
      : [...current, label]
    onAnswer(next)
  }

  return (
    <motion.div
      key={question.code}
      initial={{ opacity: 0, x: direction * 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -40 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-3">
        {dimensionLabel(question.dimension)}
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-snug">
        {question.text}
      </h2>

      {isMultiselect ? (
        <div className="flex flex-wrap gap-2">
          {question.options.map(opt => {
            const selected = Array.isArray(answer) && answer.includes(opt.label)
            return (
              <motion.button
                key={opt.label}
                type="button"
                onClick={() => handleMultiselectToggle(opt.label)}
                whileTap={{ scale: 0.96 }}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-brand-accent border-brand-accent text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-brand-accent hover:text-brand-accent'
                }`}
              >
                {opt.label}
              </motion.button>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2.5">
          {question.options.map((opt, i) => {
            const selected = answer === opt.value
            return (
              <motion.button
                key={String(opt.value)}
                type="button"
                onClick={() => typeof opt.value === 'number' && onAnswer(opt.value)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-brand hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function dimensionLabel(dimension: string): string {
  const map: Record<string, string> = {
    strategy_vision:       'Strategy & Vision',
    current_usage:         'Current Usage',
    data_readiness:        'Data Readiness',
    talent_culture:        'Talent & Culture',
    governance_risk:       'Governance & Risk',
    opportunity_awareness: 'Opportunity Awareness',
  }
  return map[dimension] ?? dimension
}
