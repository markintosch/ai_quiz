'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import type { Question } from '@/data/questions'
import { localizeQuestion, localizeDimension } from '@/data/question-i18n'

interface QuestionCardProps {
  question: Question
  answer: number | string[] | undefined
  onAnswer: (value: number | string[]) => void
  direction?: 1 | -1
}

export function QuestionCard({ question, answer, onAnswer, direction = 1 }: QuestionCardProps) {
  const locale = useLocale()
  const enOptionLabels = question.options.map(o => o.label)
  const { text, optionLabels } = localizeQuestion(question.code, question.text, enOptionLabels, locale)
  const dimLabel = localizeDimension(question.dimension, locale)

  const isMultiselect = question.type === 'multiselect'

  const currentSelections = Array.isArray(answer) ? answer : []
  const otherSelected = currentSelections.includes('Other')
  const otherDetailEntry = currentSelections.find(v => v.startsWith('other_detail:'))
  const otherDetailText = otherDetailEntry ? otherDetailEntry.slice('other_detail:'.length) : ''

  function handleMultiselectToggle(label: string) {
    const current = Array.isArray(answer) ? answer : []
    if (current.includes(label)) {
      let next = current.filter(v => v !== label)
      if (label === 'Other') next = next.filter(v => !v.startsWith('other_detail:'))
      onAnswer(next)
    } else {
      onAnswer([...current, label])
    }
  }

  function handleOtherDetail(text: string) {
    const current = Array.isArray(answer) ? answer : []
    const without = current.filter(v => !v.startsWith('other_detail:'))
    onAnswer(text.trim() ? [...without, `other_detail:${text}`] : without)
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
        {dimLabel}
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-snug">
        {text}
      </h2>

      {isMultiselect ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {question.options.map((opt, i) => {
              const localLabel = optionLabels[i] ?? opt.label
              const selected = currentSelections.includes(opt.label)
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
                  {localLabel}
                </motion.button>
              )
            })}
          </div>
          {otherSelected && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="text"
                autoFocus
                value={otherDetailText}
                onChange={e => handleOtherDetail(e.target.value)}
                placeholder="Which tool(s)? e.g. Perplexity, Cursor, Make…"
                className="w-full text-sm border border-brand-accent/40 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 bg-orange-50/30 placeholder-gray-400"
              />
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {question.options.map((opt, i) => {
            const localLabel = optionLabels[i] ?? opt.label
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
                {localLabel}
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

