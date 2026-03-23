import type { Metadata } from 'next'
import { QuizEngine } from '@/components/quiz/QuizEngine'

export const metadata: Metadata = {
  title: 'Full AI Maturity Assessment — Brand PWRD Media',
  description:
    'A comprehensive 25-question AI Maturity Assessment. Get your full score, dimension breakdown and personalised recommendations.',
}

export default function ExtendedQuizPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">
            Brand PWRD Media
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Full AI Maturity Assessment
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            25 questions · ~10 minutes · Full score + dimension breakdown + recommendations
          </p>
        </div>

        <QuizEngine version="full" leadCapture="post" />
      </div>
    </main>
  )
}
