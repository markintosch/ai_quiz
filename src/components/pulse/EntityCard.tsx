'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PulseEntity } from '@/types/pulse'

interface EntityCardProps {
  entity: PulseEntity
  href?: string
  showStatus?: boolean
}

const statusDot: Record<string, string> = {
  live: '#22c55e',
  reviewed: '#e3ef38',
  approved: '#3b82f6',
  draft: '#828282',
}

export default function EntityCard({ entity, href, showStatus }: EntityCardProps) {
  const [hovered, setHovered] = useState(false)

  const imageUrl = entity.hero_image_url || entity.og_image_url

  const inner = (
    <div
      style={{
        background: '#f4f4f4',
        borderRadius: 0,
        overflow: 'hidden',
        border: hovered && href ? '1px solid transparent' : '1px solid transparent',
        borderBottom: hovered && href ? '2px solid #e3ef38' : '2px solid transparent',
        transition: 'border-color 0.15s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero image */}
      {imageUrl && (
        <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={entity.label}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          {/* Type badge */}
          <span
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: '#000000',
              color: '#e3ef38',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '3px 8px',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {entity.entity_type}
          </span>
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* No image — show type badge inline */}
        {!imageUrl && (
          <span
            style={{
              background: '#000000',
              color: '#e3ef38',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '3px 8px',
              display: 'inline-block',
              alignSelf: 'flex-start',
              marginBottom: '8px',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {entity.entity_type}
          </span>
        )}

        {/* Status dot */}
        {showStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: statusDot[entity.ingest_status] ?? '#828282',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '11px', color: '#616162', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {entity.ingest_status}
            </span>
          </div>
        )}

        <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#121212', margin: 0, lineHeight: '1.2' }}>
          {entity.label}
        </h3>

        {entity.subtitle && (
          <p style={{ color: '#616162', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
            {entity.subtitle}
          </p>
        )}

        {(entity.location_text || entity.start_date) && (
          <p style={{ color: '#828282', fontSize: '12px', margin: 0 }}>
            {[
              entity.location_text,
              entity.start_date
                ? new Date(entity.start_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
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
