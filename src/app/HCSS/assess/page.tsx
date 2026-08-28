// FILE: src/app/HCSS/assess/page.tsx

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CompassAssessClient from './CompassAssessClient'
import { pickLang } from '@/lib/cyber-compass/i18n'
import { HCSS_OFFLINE } from '@/lib/cyber-compass/offline'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:  'HCSS Cyber Compass — assessment',
  robots: { index: false, follow: false },
}

export default async function CyberAssessPage(
  props: {
    searchParams: Promise<{ lang?: string; email?: string }>
  }
) {
  if (HCSS_OFFLINE) notFound()
  const searchParams = await props.searchParams;
  const lang = pickLang(searchParams.lang)
  return <CompassAssessClient lang={lang} prefilledEmail={searchParams.email ?? ''} />
}
