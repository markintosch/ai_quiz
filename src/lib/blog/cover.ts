/**
 * Cover-media helpers — gedeeld door admin upload, editor preview, en
 * publieke render-componenten.
 *
 * We bepalen of een URL naar video of afbeelding wijst op basis van extensie
 * (omdat we de extensie zelf schrijven in /api/admin/blog/upload). Mime-sniffen
 * via HEAD request zou strenger zijn maar is overkill voor onze eigen Storage.
 */

const VIDEO_EXTS = new Set([
  'mp4', 'webm', 'mov', 'mpg', 'mpeg', 'm4v', 'ogv',
])

const VIDEO_MIME: Record<string, string> = {
  mp4:  'video/mp4',
  webm: 'video/webm',
  mov:  'video/quicktime',
  mpg:  'video/mpeg',
  mpeg: 'video/mpeg',
  m4v:  'video/x-m4v',
  ogv:  'video/ogg',
}

/** Pak de extensie (lowercase, zonder querystring/fragment) uit een URL. */
function extOf(url: string): string {
  try {
    const u    = new URL(url, 'https://example.com')   // dummy base voor relatieve URLs
    const path = u.pathname
    const m    = path.toLowerCase().match(/\.([a-z0-9]{2,5})$/)
    return m ? m[1] : ''
  } catch {
    return ''
  }
}

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return VIDEO_EXTS.has(extOf(url))
}

export function mimeTypeForUrl(url: string): string {
  return VIDEO_MIME[extOf(url)] ?? 'video/mp4'
}

/**
 * Voor og:image / twitter card image: kies de beste image-URL.
 * 1. Als cover_image een afbeelding is → die.
 * 2. Anders cover_poster (als gezet) → die.
 * 3. Anders null (geen og:image).
 */
export function pickOgImage(
  coverImage:  string | null | undefined,
  coverPoster: string | null | undefined,
): string | null {
  if (coverImage && !isVideoUrl(coverImage)) return coverImage
  if (coverPoster) return coverPoster
  return null
}
