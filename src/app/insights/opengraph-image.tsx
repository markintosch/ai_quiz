import { ImageResponse } from 'next/og'
import { OG_SIZE, renderOGImage } from '@/lib/seo/og-image-base'

export const runtime     = 'edge'
export const alt         = 'Insights — AI-strategie, executie en leiderschap | Mark de Kock'
export const size        = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    renderOGImage({
      eyebrow: 'Insights',
      heading: 'Artikelen voor leidinggevenden over AI-strategie en executie.',
      sub:     'Geen hype, geen tool reviews — alleen wat in de praktijk werkt.',
      cta:     'Lees de artikelen →',
      accent:  '#D97706',
      background: '#0F172A',
    }),
    { ...size },
  )
}
