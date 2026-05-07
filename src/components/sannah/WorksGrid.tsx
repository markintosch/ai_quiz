'use client'

// FILE: src/components/sannah/WorksGrid.tsx
// Layout: hero links (volledig zichtbaar, object-fit contain) + miniaturen rechts.
// Klik op miniatuur → die wordt de nieuwe hero. Klik op hero → lightbox met grote weergave.

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { SannahWork } from '@/lib/sannah/types'
import { publicImageUrl } from '@/lib/sannah/types'

interface Props {
  works: SannahWork[]
  emptyLabel?: string
}

export default function WorksGrid({ works, emptyLabel }: Props) {
  const [heroIdx, setHeroIdx]   = useState(0)
  const [openIdx, setOpenIdx]   = useState<number | null>(null)

  const close = useCallback(() => setOpenIdx(null), [])
  const next  = useCallback(() => {
    setOpenIdx(i => (i === null ? null : (i + 1) % works.length))
  }, [works.length])
  const prev  = useCallback(() => {
    setOpenIdx(i => (i === null ? null : (i - 1 + works.length) % works.length))
  }, [works.length])

  // Keyboard nav binnen lightbox
  useEffect(() => {
    if (openIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')          close()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft')  prev()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [openIdx, close, next, prev])

  if (works.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px', color: '#bdbdbd', fontSize: 14 }}>
        {emptyLabel ?? 'Nog geen werk gepubliceerd.'}
      </div>
    )
  }

  const hero = works[heroIdx]

  return (
    <>
      <div
        className="sannah-works-wrap"
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '40px 64px 96px',
        }}
      >
        <div
          className="sannah-works-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)',
            gap: 48,
            alignItems: 'start',
          }}
        >
          {/* ── Hero (links) ─────────────────────────────────────── */}
          <div>
            <button
              type="button"
              onClick={() => setOpenIdx(heroIdx)}
              style={{
                display: 'block',
                width: '100%',
                background: '#f4f4f4',
                border: 0,
                padding: 0,
                cursor: 'zoom-in',
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '4 / 5',
              }}
              aria-label={`Open ${hero.title ?? 'werk'} groot`}
            >
              <Image
                key={hero.id}
                src={publicImageUrl(hero.image_path)}
                alt={hero.title ?? 'werk van Sannah De Zwart'}
                fill
                sizes="(max-width: 800px) 100vw, 60vw"
                priority
                style={{ objectFit: 'contain' }}
              />
            </button>
            {(hero.title || hero.year || hero.medium) && (
              <div
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  color: '#666',
                  letterSpacing: '0.02em',
                  display: 'flex',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                {hero.title  && <span style={{ color: '#1a1a1a' }}>{hero.title}</span>}
                {hero.year   && <span>{hero.year}</span>}
                {hero.medium && <span style={{ fontStyle: 'italic' }}>{hero.medium}</span>}
              </div>
            )}
          </div>

          {/* ── Miniaturen (rechts) ──────────────────────────────── */}
          <div
            className="sannah-thumbs"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {works.map((w, i) => {
              if (i === heroIdx) return null
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setHeroIdx(i)}
                  style={{
                    display: 'block',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    background: '#f4f4f4',
                    border: 0,
                    padding: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: 0.88,
                    transition: 'opacity 0.15s',
                  }}
                  aria-label={`Toon ${w.title ?? 'werk'} als hero`}
                >
                  <Image
                    src={publicImageUrl(w.image_path)}
                    alt={w.title ?? 'werk van Sannah De Zwart'}
                    fill
                    sizes="(max-width: 800px) 50vw, 20vw"
                    style={{ objectFit: 'cover' }}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Responsive: stack op mobiel */}
      <style>{`
        @media (max-width: 800px) {
          .sannah-works-wrap { padding: 24px 20px 64px !important; }
          .sannah-works-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .sannah-thumbs {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        .sannah-thumbs button:hover { opacity: 1 !important; }
      `}</style>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {openIdx !== null && (
        <Lightbox
          work={works[openIdx]}
          index={openIdx}
          total={works.length}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  )
}

interface LightboxProps {
  work:    SannahWork
  index:   number
  total:   number
  onClose: () => void
  onPrev:  () => void
  onNext:  () => void
}

function Lightbox({ work, index, total, onClose, onPrev, onNext }: LightboxProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15,15,15,0.94)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'zoom-out',
      }}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        aria-label="Sluit"
        style={{
          position: 'absolute', top: 18, right: 18, zIndex: 110,
          background: 'transparent', border: 0, color: '#fff',
          fontSize: 30, lineHeight: 1, cursor: 'pointer',
          width: 44, height: 44, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >×</button>

      <div style={{
        position: 'absolute', top: 24, left: 24, color: 'rgba(255,255,255,0.6)',
        fontSize: 12, letterSpacing: '0.06em',
      }}>
        {index + 1} / {total}
      </div>

      {total > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="Vorige"
          style={{
            position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
            background: 'transparent', border: 0, color: '#fff',
            fontSize: 38, lineHeight: 1, cursor: 'pointer', opacity: 0.7,
            padding: 16,
          }}
        >‹</button>
      )}

      <div onClick={(e) => e.stopPropagation()} style={{
        maxWidth: '92vw', maxHeight: '82vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <Image
          src={publicImageUrl(work.image_path)}
          alt={work.title ?? 'werk van Sannah De Zwart'}
          width={2000}
          height={2000}
          sizes="92vw"
          style={{ maxWidth: '92vw', maxHeight: '78vh', width: 'auto', height: 'auto', objectFit: 'contain' }}
        />
        {(work.title || work.year || work.medium) && (
          <div style={{
            marginTop: 16,
            color: 'rgba(255,255,255,0.85)',
            fontSize: 13,
            display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
            letterSpacing: '0.02em',
          }}>
            {work.title  && <span>{work.title}</span>}
            {work.year   && <span style={{ opacity: 0.7 }}>{work.year}</span>}
            {work.medium && <span style={{ opacity: 0.7, fontStyle: 'italic' }}>{work.medium}</span>}
          </div>
        )}
        {work.description && (
          <p style={{
            marginTop: 10,
            color: 'rgba(255,255,255,0.7)',
            fontSize: 13,
            lineHeight: 1.6,
            maxWidth: 600,
            textAlign: 'center',
          }}>
            {work.description}
          </p>
        )}
      </div>

      {total > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Volgende"
          style={{
            position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            background: 'transparent', border: 0, color: '#fff',
            fontSize: 38, lineHeight: 1, cursor: 'pointer', opacity: 0.7,
            padding: 16,
          }}
        >›</button>
      )}
    </div>
  )
}
