// FILE: src/components/blog/BlogCover.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server component voor cover-media. Detecteert of de URL naar een video of
// afbeelding wijst en rendert het juiste element.
//
// Video's worden afgespeeld als hero-beeld: autoplay + muted + loop +
// playsinline + zonder controls. Dat is wat je wilt voor een korte
// achtergrond-loop. Wil je controls? Pas controls= prop aan.
//
// Mime-detectie gebeurt o.b.v. extensie (URL eindigt op .mp4 etc.) — daarom
// schrijven we de extensie bewust uit in /api/admin/blog/upload route.
// ─────────────────────────────────────────────────────────────────────────────

import { isVideoUrl, mimeTypeForUrl } from '@/lib/blog/cover'

interface Props {
  src:        string
  alt?:       string | null
  /** Optioneel poster-frame voor video covers (eerste frame voor afspelen). */
  poster?:    string | null
  className?: string
  /** Toon video controls (default: false → loopt als hero) */
  controls?:  boolean
  /** Voor responsive sizing */
  aspect?:    '16/9' | '4/3' | 'auto'
}

export function BlogCover({
  src, alt, poster, className = '', controls = false, aspect = 'auto',
}: Props) {
  const aspectClass =
    aspect === '16/9' ? 'aspect-[16/9]'
    : aspect === '4/3'  ? 'aspect-[4/3]'
    : ''

  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        poster={poster ?? undefined}
        className={`w-full ${aspectClass} object-cover ${className}`.trim()}
        autoPlay={!controls}
        muted
        loop={!controls}
        playsInline
        preload="metadata"
        controls={controls}
        // Aria fallback — schermlezer leest dit als "video: <alt>"
        aria-label={alt ?? undefined}
      >
        {/* Expliciete <source> met type-hint helpt Safari */}
        <source src={src} type={mimeTypeForUrl(src)} />
      </video>
    )
  }

  // Plain <img> — Supabase Storage URL is user-generated, daarom geen next/image.
  // Zou je willen: voeg de Storage host toe aan next.config.mjs images.domains
  // en gebruik next/image hier.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ''}
      loading="lazy"
      className={`w-full ${aspectClass} object-cover ${className}`.trim()}
    />
  )
}
