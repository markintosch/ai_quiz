export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { getProductKeyFromHost, getProductConfig } from '@/products'
import LandingPageClient from '@/components/landing/LandingPageClient'

export default async function LandingPage() {
  const host = (await headers()).get('host') ?? ''
  const productKey = getProductKeyFromHost(host)
  const config = getProductConfig(productKey)
  const locale = await getLocale()
  const productShortName = config.name.replace(/ Assessment$/, '').replace(/ Quiz$/, '')
  const dimensions = config.dimensions.map(d => ({
    key: d.key,
    icon: d.icon ?? '⚡',
    label: d.label,
    desc: d.description ?? '',
  }))

  // Pass product-specific copy overrides to client
  const localeKey = (locale === 'nl' || locale === 'fr') ? locale : 'en'
  const copy = config.defaultCopy?.[localeKey] ?? config.defaultCopy?.['en'] ?? {}

  return (
    <LandingPageClient
      productKey={productKey}
      productName={config.name}
      productShortName={productShortName}
      dimensions={dimensions}
      copy={copy}
    />
  )
}
