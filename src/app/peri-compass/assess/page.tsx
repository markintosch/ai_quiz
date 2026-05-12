// FILE: src/app/peri-compass/assess/page.tsx
// Server-component shell — geeft language door aan de client.

import type { Metadata } from 'next'
import CompassAssessClient from './CompassAssessClient'
import { pickLang } from '@/lib/peri-compass/i18n'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:  'Peri-Compass — assessment',
  robots: { index: false, follow: true },
}

export default function CompassAssessPage({
  searchParams,
}: {
  searchParams: { lang?: string; email?: string }
}) {
  const lang = pickLang(searchParams.lang)
  return <CompassAssessClient lang={lang} prefilledEmail={searchParams.email ?? ''} />
}
