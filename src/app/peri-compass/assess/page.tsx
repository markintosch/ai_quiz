// FILE: src/app/peri-compass/assess/page.tsx
// Server-component shell — laadt het client-component dat alle state managet.

import type { Metadata } from 'next'
import CompassAssessClient from './CompassAssessClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:  'Perimenopause Compass — assessment',
  robots: { index: false, follow: true },
}

export default function CompassAssessPage() {
  return <CompassAssessClient />
}
