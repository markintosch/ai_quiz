export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { getProductKeyFromHost, getProductConfig } from '@/products'
import LiteQuizPageClient from './LiteQuizPageClient'

export default async function LiteQuizPage() {
  const host = (await headers()).get('host') ?? ''
  const productKey = getProductKeyFromHost(host)
  const config = getProductConfig(productKey)
  const liteQuestions = config.questions.filter(q => q.lite)
  const productShortName = config.name.replace(/ Assessment$/, '').replace(/ Quiz$/, '').replace(/ Scan$/, '')
  const locale = await getLocale()
  const localeKey = (locale === 'nl' || locale === 'fr') ? locale : 'en'
  const copy = config.defaultCopy?.[localeKey] ?? config.defaultCopy?.['en'] ?? {}
  return (
    <LiteQuizPageClient
      productKey={productKey}
      productShortName={productShortName}
      liteQuestions={liteQuestions}
      quizTitle={copy.quizTitle}
      quizSub={copy.quizSub}
      quizLogoUrl={copy.quizLogoUrl}
      quizCompanyName={copy.quizCompanyName}
      leadCaptureMode={copy.leadCaptureMode}
      showCallbackOption={copy.showCallbackOption}
      hideMarketingConsent={copy.hideMarketingConsent}
    />
  )
}
