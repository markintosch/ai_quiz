import { ImageResponse } from 'next/og'
import { OG_SIZE, renderOGImage } from '@/lib/seo/og-image-base'

export const runtime     = 'edge'
export const alt         = 'Wat ik maak — AI-assessmentplatform | Mark de Kock'
export const size        = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    renderOGImage({
      eyebrow: 'Wat ik maak',
      heading: 'Één codebase. Meerdere diagnostische producten. Gebouwd met AI als co-developer.',
      sub:     'White-label assessmentplatform voor AI-volwassenheid, M&A-gereedheid, cloud readiness en meer.',
      cta:     'Zie de projecten →',
      accent:  '#1D4ED8',
      background: '#0F172A',
    }),
    { ...size },
  )
}
