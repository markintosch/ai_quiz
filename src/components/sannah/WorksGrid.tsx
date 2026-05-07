'use client'

// FILE: src/components/sannah/WorksGrid.tsx
// Tarr-stijl, maar dan met 1 hero + 3-kolomsraster.
// Klik op een tile → lightbox (modal) met grote weergave + prev/next.
// Hero = werk met laagste position. Mark / Sannah herordenen via /admin/sannah.

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { SannahWork } from '@/lib/sannah/types'
import { publicImageUrl } from '@/lib/sannah/types'

interface Props {
  works: SannahWork[]
  emptyLabel?: string
}

export default function WorksGrid({ works, emptyLabel }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const openLightbox = (i: number) => setOpenIdx(i)
  const close       = useCallback(() => setOpenIdx(null), [])
  const next = useCallback(() => {
    setOpenIdx(i => (i === null ? null : (i + 1) % works.length))
  }, [works.length])
  const prev = useCallback(() => {
    setOpenIdx(i => (i === null ? null : (i - 1 + works.length) % works.length))
  }, [works.length])

  // Keyboard: Esc to close, arrows to navigate
  useEffect(() => {
    if (openIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
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

  const hero = works[0]
  const rest = works.slice(1)

  return (
    <>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          style={{
            display: 'block',
            width: '100%',
            background: '#f4f4f4',
            border: 0,
            padding: 0,
            cursor: 'zoom-in',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 64,
          }}
          aria-label={`Open ${hero.title ?? 'werk'} groot`}
        >
          <Image
            src={publicImageUrl(hero.image_path)}
            alt={hero.title ?? 'werk van Sannah De Zwart'}
            width={1600}
            height={1200}
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '78vh' }}
          />
        </button>
        {(hero.title || hero.year || hero.medium) && (
          <div style={{
            maxWidth: 1280, margin: '-48px auto 64px',
            fontSize: 12, color: '#666', letterSpacing: '0.02em',
            display: 'flex', gap: 14, flexWrap: 'wrap',
          }}>
            {hero.title  && <span style={{ color: '#1a1a1a' }}>{hero.title}</span>}
            {hero.year   && <span>{hero.year}</span>}
            {hero.medium && <span style={{ fontStyle: 'italic' }}>{hero.medium}</span>}
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────────── */}
        {rest.length > 0 && (
          <div style={{
            display: 'grid',
            gap: 18,
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            paddingBottom: 80,
          }}>
            {rest.map((w, i) => (
              <button
                key={w.id}
                type="button"
                onClick={() => openLightbox(i + 1)}
                style={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  background: '#f4f4f4',
                  border: 0,
                  padding: 0,
                  cursor: 'zoom-in',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                aria-label={`Open ${w.title ?? 'werk'} groot`}
              >
                <Image
                  src={publicImageUrl(w.image_path)}
                  alt={w.title ?? 'werk van Sannah De Zwart'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
                {(w.title || w.year) && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
                    padding: '36px 14px 12px',
                    color: '#fff',
                    fontSize: 11,
                    letterSpacing: '0.02em',
                    textAlign: 'left',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                  className="sannah-tile-caption"
                  >
                    {w.title && <div>{w.title}</div>}
                    {w.year   && <div style={{ opacity: 0.7 }}>{w.year}</div>}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover-only caption styles (kan niet inline) */}
      <style>{`
        button:hover .sannah-tile-caption,
        button:focus-visible .sannah-tile-caption { opacity: 1; }
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
      {/* Close */}
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

      {/* Counter */}
      <div style={{
        position: 'absolute', top: 24, left: 24, color: 'rgba(255,255,255,0.6)',
        fontSize: 12, letterSpacing: '0.06em',
      }}>
        {index + 1} / {total}
      </div>

      {/* Prev */}
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

      {/* Image */}
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

      {/* Next */}
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
