// FILE: src/components/sannah/WorksScroll.tsx
// Vertical-scroll werk-overzicht — Tarr-stijl.
// Server component (no interactivity needed besides Next/Image).

import Image from 'next/image'
import type { SannahWork } from '@/lib/sannah/types'
import { publicImageUrl } from '@/lib/sannah/types'

interface Props {
  works: SannahWork[]
  emptyLabel?: string
}

export default function WorksScroll({ works, emptyLabel }: Props) {
  if (works.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px', color: '#bdbdbd', fontSize: 14 }}>
        {emptyLabel ?? 'Nog geen werk gepubliceerd.'}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 0' }}>
      {works.map((w, i) => (
        <figure key={w.id} style={{
          margin: 0,
          marginBottom: i === works.length - 1 ? 80 : 96,
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            background: '#f4f4f4',
            // Aspect ratio variabel — Image neemt natural ratio van de bron
            display: 'flex',
            justifyContent: 'center',
          }}>
            <Image
              src={publicImageUrl(w.image_path)}
              alt={w.title ?? 'werk van Sannah De Zwart'}
              width={1200}
              height={1200}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 96vw, 1200px"
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: 1200,
                objectFit: 'contain',
              }}
              priority={i < 2}
            />
          </div>
          {(w.title || w.year || w.medium) && (
            <figcaption style={{
              maxWidth: 1200,
              margin: '14px auto 0',
              fontSize: 12,
              color: '#666',
              letterSpacing: '0.02em',
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
            }}>
              {w.title && <span style={{ color: '#1a1a1a' }}>{w.title}</span>}
              {w.year   && <span>{w.year}</span>}
              {w.medium && <span style={{ fontStyle: 'italic' }}>{w.medium}</span>}
            </figcaption>
          )}
          {w.description && (
            <p style={{
              maxWidth: 720,
              margin: '12px auto 0',
              fontSize: 14,
              lineHeight: 1.6,
              color: '#444',
            }}>
              {w.description}
            </p>
          )}
        </figure>
      ))}
    </div>
  )
}
