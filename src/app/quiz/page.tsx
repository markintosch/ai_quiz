import type { Metadata } from 'next'
import { QuizEngine } from '@/components/quiz/QuizEngine'

export const metadata: Metadata = {
  title: 'AI Maturity Quiz — Brand PWRD Media',
  description:
    'Find out where your organisation stands on AI adoption. 7 questions, instant score.',
}

export default function LiteQuizPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Page header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">
            Brand PWRD Media
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            AI Maturity Assessment
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            7 questions · ~5 minutes · Instant personalised score
          </p>
        </div>

        <QuizEngine version="lite" />
      </div>
    </main>
  )
}
