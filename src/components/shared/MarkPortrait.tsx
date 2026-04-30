// FILE: src/components/shared/MarkPortrait.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Reusable portrait of Mark, used to add a human touch above-the-fold on
// markdekock.com and the AI-benchmark landing.
//
// The image lives at /public/MDK_klein.png. If the file is missing,
// nothing renders — the surrounding layout stays intact.

'use client'

import Image from 'next/image'
import { useState } from 'react'

interface MarkPortraitProps {
  /** Pixel diameter (square crop, rendered as circle). Default 96. */
  size?: number
  /** Optional accent ring colour (e.g. brand warm). Falls back to no ring. */
  ringColor?: string
  /** Inline alt for accessibility. Defaults to a sensible Dutch label. */
  alt?: string
  /** Pass-through style overrides for the wrapper. */
  style?: React.CSSProperties
  /** Pass-through className for the wrapper. */
  className?: string
}

export function MarkPortrait({
  size      = 96,
  ringColor,
  alt       = 'Mark de Kock — portret',
  style,
  className,
}: MarkPortraitProps) {
  const [errored, setErrored] = useState(false)
  if (errored) return null  // graceful fallback: hide entirely if image missing

  const ring = ringColor
    ? { boxShadow: `0 0 0 3px ${ringColor}, 0 6px 18px rgba(0,0,0,0.12)` }
    : { boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        background: '#F1F5F9',
        ...ring,
        ...style,
      }}
    >
      <Image
        src="/MDK_klein.png"
        alt={alt}
        fill
        sizes={`${size}px`}
        style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        onError={() => setErrored(true)}
        priority
      />
    </div>
  )
}
