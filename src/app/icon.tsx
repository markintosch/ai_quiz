// FILE: src/app/icon.tsx
// ─── Browser favicon (32 × 32 PNG) ───────────────────────────────────────────
// Generated at request-time via Next.js ImageResponse / Satori.
// Shows the Brand PWRD Media "B" monogram on teal with orange accent dot.

import { ImageResponse } from 'next/og'

export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: '#354E5E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Orange accent dot — top-right corner */}
        <div
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            width: 7,
            height: 7,
            borderRadius: 4,
            background: '#E8611A',
            display: 'flex',
          }}
        />
        {/* "B" lettermark */}
        <div
          style={{
            color: 'white',
            fontSize: 19,
            fontWeight: 800,
            fontFamily: 'sans-serif',
            lineHeight: 1,
            marginBottom: 1,
          }}
        >
          B
        </div>
      </div>
    ),
    { ...size },
  )
}
