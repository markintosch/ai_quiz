import { ImageResponse } from 'next/og'
import { OG_SIZE, renderOGImage } from '@/lib/seo/og-image-base'

export const runtime     = 'edge'
export const alt         = 'Wat ik maak — Mark de Kock'
export const size        = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    renderOGImage({
      eyebrow: 'Wat ik maak',
      heading: 'Ik adviseer niet alleen. Ik maak ook.',
      sub:     'Eén platform. Acht diagnostische producten. Van pharma tot M&A. Gebouwd met Claude als co-developer.',
      cta:     'Bekijk de projecten →',
      accent:  '#00DEFF',
      background: '#0D1B2A',
    }),
    { ...size },
  )
}
