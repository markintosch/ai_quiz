// FILE: src/app/api/admin/detect-brand-colors/route.ts
// Server-side color detection from a public URL.
// Parses meta tags, PWA manifest, and CSS custom properties — no external APIs needed.
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { isAuthorised } from '@/lib/admin/auth'

export interface DetectedColor {
  hex: string
  source: string
  confidence: number // 0–100
}

// Block private/local/reserved addresses (SSRF protection).
// Covers: loopback, RFC-1918, APIPA/link-local, CGNAT (100.64/10),
// IPv6 ULA (fc00::/7), cloud metadata endpoints, and class-A reserved.
const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|0\.|::1|[fFdD][cCdD][0-9a-fA-F]{2}:|metadata\.google\.internal|metadata\.azure\.com)/i

export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json() as { url?: string }
  const rawUrl = (body.url ?? '').trim()

  if (!rawUrl) {
    return NextResponse.json({ error: 'URL is required.' }, { status: 400 })
  }

  // Normalise — prepend https:// if missing
  let parsed: URL
  try {
    parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)
  } catch {
    return NextResponse.json({ error: 'That doesn\'t look like a valid URL.' }, { status: 400 })
  }

  if (PRIVATE_HOST.test(parsed.hostname)) {
    return NextResponse.json({ error: 'Private/internal URLs are not allowed.' }, { status: 400 })
  }

  // ── Fetch the page ────────────────────────────────────────────
  let html: string
  try {
    const res = await fetch(parsed.toString(), {
      signal: AbortSignal.timeout(10_000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrandPWRD-ColorBot/1.0; +https://brandpwrd.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Website returned ${res.status}. Check the URL.` }, { status: 400 })
    }
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('html')) {
      return NextResponse.json({ error: 'That URL doesn\'t point to an HTML page.' }, { status: 400 })
    }
    // Read up to 500 KB — enough for head section + styles
    const reader = res.body?.getReader()
    if (!reader) {
      html = await res.text()
    } else {
      const chunks: Uint8Array[] = []
      let total = 0
      while (total < 512_000) {
        const { done, value } = await reader.read()
        if (done || !value) break
        chunks.push(value)
        total += value.length
      }
      reader.cancel()
      html = new TextDecoder().decode(
        chunks.reduce((acc, c) => {
          const merged = new Uint8Array(acc.length + c.length)
          merged.set(acc)
          merged.set(c, acc.length)
          return merged
        }, new Uint8Array())
      )
    }
  } catch {
    return NextResponse.json({ error: 'Could not reach the website. Check the URL.' }, { status: 400 })
  }

  const candidates: DetectedColor[] = []

  // ── 1. <meta name="theme-color"> ─────────────────────────────
  const themeColor = extractMeta(html, 'theme-color')
  if (themeColor) {
    const hex = toHex(themeColor)
    if (hex) candidates.push({ hex, source: 'theme-color meta tag', confidence: 95 })
  }

  // ── 2. MS tile color ─────────────────────────────────────────
  const tileColor = extractMeta(html, 'msapplication-TileColor')
  if (tileColor) {
    const hex = toHex(tileColor)
    if (hex) candidates.push({ hex, source: 'Windows tile colour', confidence: 80 })
  }

  // ── 3. PWA manifest ──────────────────────────────────────────
  const manifestHref = extractManifestHref(html)
  if (manifestHref) {
    try {
      const manifestUrl = new URL(manifestHref, parsed.origin).toString()
      const mRes = await fetch(manifestUrl, { signal: AbortSignal.timeout(4_000) })
      if (mRes.ok) {
        const manifest = await mRes.json() as { theme_color?: string; background_color?: string }
        if (manifest.theme_color) {
          const hex = toHex(manifest.theme_color)
          if (hex) candidates.push({ hex, source: 'PWA manifest theme_color', confidence: 90 })
        }
        if (manifest.background_color) {
          const hex = toHex(manifest.background_color)
          if (hex) candidates.push({ hex, source: 'PWA manifest background_color', confidence: 65 })
        }
      }
    } catch { /* ignore — manifest is optional */ }
  }

  // ── 4. CSS custom properties in <style> blocks ───────────────
  const styleBlocks = Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
  for (const block of styleBlocks) {
    const css = block[1]
    // Common brand variable names (order = priority)
    const varNames = [
      '--primary', '--brand', '--accent', '--color-primary', '--color-brand',
      '--color-accent', '--theme-color', '--main-color', '--corporate-color',
      '--header-bg', '--nav-bg', '--highlight', '--link-color',
    ]
    for (const name of varNames) {
      const pattern = new RegExp(`${escapeRegex(name)}\\s*:\\s*([^;}{]+)`, 'gi')
      for (const match of Array.from(css.matchAll(pattern))) {
        const raw = match[1].trim()
        const hex = toHex(raw)
        if (hex) {
          candidates.push({ hex, source: `CSS var ${name}`, confidence: 72 })
        }
      }
    }
  }

  // ── 5. Inline styles on <body>, <header>, <nav>, <main> ──────
  const tagPatterns = [
    /<(?:body|header|nav|main)[^>]*style=["']([^"']*background(?:-color)?:[^;'"]+)[^>]*>/gi,
  ]
  for (const pattern of tagPatterns) {
    for (const match of Array.from(html.matchAll(pattern))) {
      const styleStr = match[1]
      const bgMatch = styleStr.match(/background(?:-color)?\s*:\s*([^;'"]+)/i)
      if (bgMatch) {
        const hex = toHex(bgMatch[1].trim())
        if (hex) candidates.push({ hex, source: 'Header/nav background', confidence: 60 })
      }
    }
  }

  // ── Deduplicate + sort by confidence ─────────────────────────
  const seen = new Set<string>()
  const results: DetectedColor[] = []
  for (const c of candidates.sort((a, b) => b.confidence - a.confidence)) {
    const key = c.hex.toUpperCase()
    if (seen.has(key)) continue
    // Skip pure white / pure black — not useful brand colours
    if (key === '#FFFFFF' || key === '#000000' || key === '#FFFFFFFF') continue
    seen.add(key)
    results.push(c)
    if (results.length >= 6) break
  }

  return NextResponse.json({ colors: results, url: parsed.toString() })
}

// ── Helpers ───────────────────────────────────────────────────

function extractMeta(html: string, name: string): string | null {
  const a = html.match(
    new RegExp(`<meta[^>]+name=["']${escapeRegex(name)}["'][^>]+content=["']([^"']+)["']`, 'i')
  )
  const b = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escapeRegex(name)}["']`, 'i')
  )
  return (a ?? b)?.[1] ?? null
}

function extractManifestHref(html: string): string | null {
  const a = html.match(/<link[^>]+rel=["']manifest["'][^>]+href=["']([^"']+)["']/i)
  const b = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']manifest["']/i)
  return (a ?? b)?.[1] ?? null
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Convert any common CSS color format to uppercase #RRGGBB. Returns null if not parseable. */
function toHex(value: string): string | null {
  value = value.trim().toLowerCase()

  // 6-digit hex
  if (/^#[0-9a-f]{6}$/.test(value)) return value.toUpperCase()

  // 3-digit hex → expand
  if (/^#[0-9a-f]{3}$/.test(value)) {
    const r = value[1], g = value[2], b = value[3]
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }

  // 8-digit hex (with alpha) → strip alpha
  if (/^#[0-9a-f]{8}$/.test(value)) return `#${value.slice(1, 7)}`.toUpperCase()

  // rgb(r, g, b) or rgb(r g b)
  const rgb = value.match(/^rgb\s*\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)/)
  if (rgb) {
    return `#${pad(parseInt(rgb[1]))}${pad(parseInt(rgb[2]))}${pad(parseInt(rgb[3]))}`.toUpperCase()
  }

  // rgba() — strip alpha
  const rgba = value.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgba) {
    return `#${pad(parseInt(rgba[1]))}${pad(parseInt(rgba[2]))}${pad(parseInt(rgba[3]))}`.toUpperCase()
  }

  // hsl() — convert
  const hsl = value.match(/^hsl\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%/)
  if (hsl) {
    return hslToHex(parseFloat(hsl[1]), parseFloat(hsl[2]) / 100, parseFloat(hsl[3]) / 100)
  }

  return null
}

function pad(n: number) {
  return Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0')
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const col = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * col).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}
