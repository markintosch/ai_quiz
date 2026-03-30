'use client'

import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import type { Question } from '@/data/questions'

interface Props {
  productKey: string
  productShortName: string
  liteQuestions: Question[]
  quizTitle?: string
  quizSub?: string
  quizLogoUrl?: string
  quizCompanyName?: string
  leadCaptureMode?: 'full' | 'minimal'
  showCallbackOption?: boolean
  hideMarketingConsent?: boolean
}

export default function LiteQuizPageClient({
  productKey,
  productShortName,
  liteQuestions,
  quizTitle,
  quizSub,
  quizLogoUrl,
  quizCompanyName,
  leadCaptureMode,
  showCallbackOption,
  hideMarketingConsent,
}: Props) {
  const t = useTranslations('quiz.lite')

  const title = quizTitle ?? `${productShortName} Quick Scan`
  const sub   = quizSub   ?? t('sub')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10 relative">
          <div className="absolute right-0 top-0">
            <LanguageSwitcher variant="light" />
          </div>

          {/* Logo hero — shown when a product logo URL is provided */}
          {quizLogoUrl ? (
            <div className="mb-5">
              <img
                src={quizLogoUrl}
                alt={quizCompanyName ?? title}
                className="h-14 mx-auto object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <p className="text-xs text-gray-400 mt-2">Powered by Brand PWRD Media</p>
            </div>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">
              {t('brand')}
            </p>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {title}
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            {sub}
          </p>
        </div>

        <QuizEngine
          version="lite"
          questions={liteQuestions}
          productKey={productKey}
          leadCaptureMode={leadCaptureMode ?? 'full'}
          showCallbackOption={showCallbackOption}
          companyName={quizCompanyName}
          hideMarketingConsent={hideMarketingConsent}
        />
      </div>
    </main>
  )
}
