// FILE: src/app/apple-icon.tsx
// ─── Apple touch icon (180 × 180 PNG) ────────────────────────────────────────
// Used on iOS home screen and Safari pinned tabs.
// Same brand mark as icon.tsx but larger and with "BRAND PWRD" sub-label.

import { ImageResponse } from 'next/og'

export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: '#354E5E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          gap: 4,
        }}
      >
        {/* Orange accent dot — top-right */}
        <div
          style={{
            position: 'absolute',
            top: 26,
            right: 26,
            width: 24,
            height: 24,
            borderRadius: 12,
            background: '#E8611A',
            display: 'flex',
          }}
        />
        {/* "B" lettermark */}
        <div
          style={{
            color: 'white',
            fontSize: 96,
            fontWeight: 800,
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}
        >
          B
        </div>
        {/* "BRAND PWRD" sub-label */}
        <div
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 16,
            fontWeight: 600,
            fontFamily: 'sans-serif',
            letterSpacing: 3,
            lineHeight: 1,
          }}
        >
          BRAND PWRD
        </div>
      </div>
    ),
    { ...size },
  )
}
