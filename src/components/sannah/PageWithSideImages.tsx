// FILE: src/components/sannah/PageWithSideImages.tsx
// Shared layout for content pages (Over / CV / Contact) — text left,
// optional photos right. Falls back to centered text if no photos.

import Image from 'next/image'
import SimpleMarkdown from './SimpleMarkdown'
import type { SannahPageImage } from '@/lib/sannah/types'
import { publicImageUrl } from '@/lib/sannah/types'

interface Props {
  title:    string
  body:     string
  images:   SannahPageImage[]
  /** Empty-state copy when both body and images are blank */
  emptyLabel?: string
}

export default function PageWithSideImages({ title, body, images, emptyLabel }: Props) {
  const hasImages = images.length > 0
  const hasBody   = body.trim().length > 0

  return (
    <section style={{ padding: '64px 0' }}>
      <h1 style={{
        textAlign: 'center', fontSize: 28, fontWeight: 500,
        margin: '0 0 40px', letterSpacing: '-0.01em',
      }}>{title}</h1>

      {!hasBody && !hasImages ? (
        <p style={{ textAlign: 'center', color: '#bdbdbd', fontSize: 14 }}>
          {emptyLabel ?? 'Tekst volgt.'}
        </p>
      ) : hasImages ? (
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 360px)',
          gap: 56,
          alignItems: 'start',
        }} className="sannah-page-grid">
          <div>
            {hasBody && <SimpleMarkdown source={body} maxWidth={9999} />}
          </div>
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {images.map((img, i) => (
              <div key={img.path} style={{
                position: 'relative',
                width: '100%',
                background: '#f4f4f4',
                overflow: 'hidden',
              }}>
                <Image
                  src={publicImageUrl(img.path)}
                  alt={img.alt ?? ''}
                  width={720}
                  height={900}
                  sizes="(max-width: 900px) 100vw, 360px"
                  priority={i === 0}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            ))}
          </aside>
        </div>
      ) : (
        <SimpleMarkdown source={body} />
      )}

      {/* Stack columns on small screens — done via inline style is hard, so a CSS rule */}
      <style>{`
        @media (max-width: 800px) {
          .sannah-page-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
