import { ImageResponse } from 'next/og'
import { OG_SIZE, renderOGImage } from '@/lib/seo/og-image-base'
import { getPost } from '@/lib/insights/posts'

export const runtime     = 'edge'
export const alt         = 'Mark de Kock — Insights'
export const size        = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost('nl', slug) ?? getPost('en', slug)

  return new ImageResponse(
    renderOGImage({
      eyebrow: post ? (post.locale === 'en' ? 'Insights · Mark de Kock' : 'Insights · Mark de Kock') : 'Insights',
      heading: post?.title ?? 'Mark de Kock — Insights',
      sub:     post?.description,
      cta:     post?.locale === 'en' ? 'Read the article →' : 'Lees het artikel →',
      accent:  '#D97706',
      background: '#0F172A',
    }),
    { ...size },
  )
}
