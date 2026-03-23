// FILE: src/lib/admin/extractImageColors.ts
// Client-side dominant colour extraction from an image file using Canvas.
// No external libraries — works entirely in the browser.

export interface ExtractedColor {
  hex: string
  source: string
  confidence: number
}

/**
 * Extract the top dominant brand colours from an image file.
 * Filters out near-white, near-black, and desaturated (grey) pixels.
 * Returns up to 6 colours sorted by frequency.
 */
export async function extractColorsFromImageFile(file: File): Promise<ExtractedColor[]> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      try {
        // Scale down for performance — 120px wide is plenty for colour sampling
        const targetW = 120
        const targetH = Math.max(1, Math.round((img.height / img.width) * targetW))

        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve([]); return }

        ctx.drawImage(img, 0, 0, targetW, targetH)
        const { data } = ctx.getImageData(0, 0, targetW, targetH)

        const buckets = new Map<string, number>()

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]

          // Skip transparent pixels
          if (a < 128) continue

          // Skip near-white
          if (r > 235 && g > 235 && b > 235) continue

          // Skip near-black
          if (r < 25 && g < 25 && b < 25) continue

          // Skip near-grey (low saturation) — max channel diff < 30
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          if (max - min < 30) continue

          // Quantise into coarse buckets (step = 32) to merge nearby colours
          const qr = Math.round(r / 32) * 32
          const qg = Math.round(g / 32) * 32
          const qb = Math.round(b / 32) * 32
          const key = `${qr},${qg},${qb}`
          buckets.set(key, (buckets.get(key) ?? 0) + 1)
        }

        // Sort by frequency, take top 6
        const results: ExtractedColor[] = [...buckets.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([key], idx) => {
            const [r, g, b] = key.split(',').map(Number)
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase()
            return {
              hex,
              source: `Extracted from image (colour ${idx + 1})`,
              confidence: Math.max(90 - idx * 12, 30),
            }
          })

        resolve(results)
      } catch {
        resolve([])
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve([])
    }

    img.src = objectUrl
  })
}
