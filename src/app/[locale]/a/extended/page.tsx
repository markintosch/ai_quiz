import { headers } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { getProductKeyFromHost, getProductConfig } from '@/products'
import { QuizEngine } from '@/components/quiz/QuizEngine'

export const dynamic = 'force-dynamic'

type Locale = 'en' | 'nl' | 'fr'

const COPY: Record<Locale, {
  brand: string
  title: (productShortName: string) => string
  sub:   (count: number) => string
}> = {
  en: {
    brand: 'Brand PWRD Media',
    title: (p) => `Full ${p} Assessment`,
    sub:   (n) => `${n} questions · ~10 minutes · Full score + dimension breakdown + recommendations`,
  },
  nl: {
    brand: 'Brand PWRD Media',
    title: (p) => `Volledige ${p} Assessment`,
    sub:   (n) => `${n} vragen · ~10 minuten · Volledige score, dimensies en aanbevelingen`,
  },
  fr: {
    brand: 'Brand PWRD Media',
    title: (p) => `Évaluation ${p} complète`,
    sub:   (n) => `${n} questions · ~10 minutes · Score complet, détail par dimension et recommandations`,
  },
}

export default async function ExtendedQuizPage() {
  const host = (await headers()).get('host') ?? ''
  const productKey = getProductKeyFromHost(host)
  const config = getProductConfig(productKey)
  const allQuestions = config.questions
  const productShortName = config.name.replace(/ Assessment$/, '').replace(/ Quiz$/, '')

  const locale = await getLocale()
  const localeKey: Locale = (locale === 'nl' || locale === 'fr') ? locale : 'en'
  const t = COPY[localeKey]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">
            {t.brand}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t.title(productShortName)}
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            {t.sub(allQuestions.length)}
          </p>
        </div>
        <QuizEngine version="full" leadCapture="post" questions={allQuestions} productKey={productKey} />
      </div>
    </main>
  )
}
