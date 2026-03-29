import { headers } from 'next/headers'
import { getProductKeyFromHost, getProductConfig } from '@/products'
import LandingPageClient from '@/components/landing/LandingPageClient'

export default async function LandingPage() {
  const host = (await headers()).get('host') ?? ''
  const productKey = getProductKeyFromHost(host)
  const config = getProductConfig(productKey)
  const productShortName = config.name.replace(/ Assessment$/, '').replace(/ Quiz$/, '')
  const dimensions = config.dimensions.map(d => ({
    key: d.key,
    icon: d.icon ?? '⚡',
    label: d.label,
    desc: d.description ?? '',
  }))
  return (
    <LandingPageClient
      productKey={productKey}
      productName={config.name}
      productShortName={productShortName}
      dimensions={dimensions}
    />
  )
}
