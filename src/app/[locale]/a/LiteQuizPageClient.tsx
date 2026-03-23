'use client'

import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import type { Question } from '@/data/questions'

interface Props {
  productKey: string
  productShortName: string
  liteQuestions: Question[]
}

export default function LiteQuizPageClient({ productKey, productShortName, liteQuestions }: Props) {
  const t = useTranslations('quiz.lite')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10 relative">
          <div className="absolute right-0 top-0">
            <LanguageSwitcher variant="light" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">
            {t('brand')}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {productShortName} Quick Scan
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            {t('sub')}
          </p>
        </div>
        <QuizEngine version="lite" questions={liteQuestions} productKey={productKey} />
      </div>
    </main>
  )
}
