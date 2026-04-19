import { ImageResponse } from 'next/og'
import { OG_SIZE, renderOGImage } from '@/lib/seo/og-image-base'

export const runtime     = 'edge'
export const alt         = 'Hoe ik werk — drie trajectopties | Mark de Kock'
export const size        = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    renderOGImage({
      eyebrow: 'Hoe ik werk',
      heading: 'Drie trajectopties. Eén uitgangspunt: een match die klopt.',
      sub:     'Verkenning (3–4 weken) · Begeleiding (8–12 weken) · Strategisch partnerschap (doorlopend). Gratis intake.',
      cta:     'Bekijk de trajecten →',
      accent:  '#1D4ED8',
      background: '#0F172A',
    }),
    { ...size },
  )
}
