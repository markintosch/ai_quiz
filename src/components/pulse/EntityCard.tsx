'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PulseEntity } from '@/types/pulse'

// ── Design tokens ─────────────────────────────────────────────────────────────
const BLACK = '#000000'
const WHITE = '#ffffff'
const NEAR_BLACK = '#121212'
const YELLOW = '#e3ef38'
const MID_GREY = '#828282'

interface EntityCardProps {
  entity: PulseEntity
  href?: string
  showStatus?: boolean
  featured?: boolean
}

export default function EntityCard({ entity, href, showStatus, featured }: EntityCardProps) {
  const [hovered, setHovered] = useState(false)

  const imageUrl = entity.hero_image_url || entity.og_image_url
  const minHeight = featured ? '480px' : '280px'

  const inner = (
    <div
      style={{
        position: 'relative',
        minHeight,
        height: '100%',
        overflow: 'hidden',
        borderRadius: 0,
        borderBottom: hovered && href ? `3px solid ${YELLOW}` : '3px solid transparent',
        transition: 'border-color 0.12s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: imageUrl ? BLACK : NEAR_BLACK,
      }}
    >
      {/* Full-bleed image */}
      {imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt={entity.label}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.65)',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.5s ease',
          }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      )}

      {/* Gradient overlay — only with image */}
      {imageUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.92) 100%)',
            zIndex: 1,
          }}
        />
      )}

      {/* Type badge — top left */}
      <span
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: YELLOW,
          color: BLACK,
          fontSize: '9px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '4px 8px',
          zIndex: 2,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {entity.entity_type}
      </span>

      {/* Status indicator — only when showStatus */}
      {showStatus && (
        <span
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: '1px solid #424242',
            color: MID_GREY,
            fontSize: '9px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '3px 8px',
            zIndex: 2,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {entity.ingest_status}
        </span>
      )}

      {/* Card content — always at bottom */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <h3
          style={{
            fontWeight: 700,
            fontSize: featured ? '22px' : '17px',
            color: WHITE,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {entity.label}
        </h3>

        {entity.subtitle && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>
            {entity.subtitle}
          </p>
        )}

        {(entity.location_text || entity.start_date) && (
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {[
              entity.location_text,
              entity.start_date
                ? new Date(entity.start_date).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        style={{ textDecoration: 'none', display: 'block', height: '100%' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {inner}
      </Link>
    )
  }

  return <div style={{ height: '100%' }}>{inner}</div>
}
