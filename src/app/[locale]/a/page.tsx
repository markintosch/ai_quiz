import { headers } from 'next/headers'
import { getProductKeyFromHost, getProductConfig } from '@/products'
import LiteQuizPageClient from './LiteQuizPageClient'

export default async function LiteQuizPage() {
  const host = (await headers()).get('host') ?? ''
  const productKey = getProductKeyFromHost(host)
  const config = getProductConfig(productKey)
  const liteQuestions = config.questions.filter(q => q.lite)
  const productShortName = config.name.replace(/ Assessment$/, '').replace(/ Quiz$/, '')
  return (
    <LiteQuizPageClient
      productKey={productKey}
      productShortName={productShortName}
      liteQuestions={liteQuestions}
    />
  )
}
