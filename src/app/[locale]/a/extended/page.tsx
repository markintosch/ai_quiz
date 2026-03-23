import { headers } from 'next/headers'
import { getProductKeyFromHost, getProductConfig } from '@/products'
import { QuizEngine } from '@/components/quiz/QuizEngine'

export const dynamic = 'force-dynamic'

export default async function ExtendedQuizPage() {
  const host = (await headers()).get('host') ?? ''
  const productKey = getProductKeyFromHost(host)
  const config = getProductConfig(productKey)
  const allQuestions = config.questions
  const productShortName = config.name.replace(/ Assessment$/, '').replace(/ Quiz$/, '')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">
            Brand PWRD Media
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Full {productShortName} Assessment
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            {allQuestions.length} questions · ~10 minutes · Full score + dimension breakdown + recommendations
          </p>
        </div>
        <QuizEngine version="full" leadCapture="post" questions={allQuestions} productKey={productKey} />
      </div>
    </main>
  )
}
