// FILE: src/app/HCSS/assess/page.tsx

import type { Metadata } from 'next'
import CompassAssessClient from './CompassAssessClient'
import { pickLang } from '@/lib/cyber-compass/i18n'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:  'HCSS Cyber Compass — assessment',
  robots: { index: false, follow: true },
}

export default async function CyberAssessPage(
  props: {
    searchParams: Promise<{ lang?: string; email?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const lang = pickLang(searchParams.lang)
  return <CompassAssessClient lang={lang} prefilledEmail={searchParams.email ?? ''} />
}
