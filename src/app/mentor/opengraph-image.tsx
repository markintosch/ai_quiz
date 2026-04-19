import { ImageResponse } from 'next/og'
import { OG_SIZE, renderOGImage } from '@/lib/seo/og-image-base'

export const runtime     = 'edge'
export const alt         = 'Mark de Kock — Strategisch mentor voor AI & executie'
export const size        = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    renderOGImage({
      eyebrow: 'Strategisch mentor · AI & executie',
      heading: 'Van AI-ambitie naar iets wat écht werkt in jouw organisatie.',
      sub:     'Persoonlijke begeleiding voor senior leiders. Gratis intakegesprek. Max. 5 trajecten tegelijk.',
      cta:     'Plan een intakegesprek →',
      accent:  '#D97706',
      background: '#0F172A',
    }),
    { ...size },
  )
}
