// FILE: src/lib/signal/ocr.ts
// ─── Moba Signal — OCR fallback for image-only inputs ─────────────────────────
//
// Screenshot PDFs (browser "full page capture") and uploaded image files carry
// no text layer, so the normal extractor finds nothing. Here we read the
// pixels: pull each page's embedded image out of the PDF with unpdf, encode it
// with sharp, slice tall full-page captures into readable strips, and have
// Claude's vision transcribe the visible text. The transcript then flows into
// the same ingest pipeline as any other document. This reads content the user
// can already see in their own browser; it defeats no access control.

import sharp from 'sharp'
import { getDocumentProxy, extractImages } from 'unpdf'
import { signalVisionCall, type VisionImage } from './llm'

// Bounds so a huge capture cannot blow memory, time (maxDuration 300s) or cost.
const TARGET_WIDTH = 1500       // Claude reads ~1500px-wide text well
const STRIP_HEIGHT = 1500       // slice tall captures into legible strips
const MAX_STRIPS_PER_PAGE = 12
const MAX_PAGES = 8
const MAX_STRIPS_TOTAL = 24
const MIN_IMAGE_AREA = 100 * 100

const OCR_SYSTEM = `You transcribe text from screenshots of web pages for a competitive-intelligence tool.

Output ONLY the readable text you can actually see, in top-to-bottom reading order: headings, paragraphs, list items, captions, table cells, menu and button labels. Put headings on their own line. Keep the wording exactly as shown; do not translate, summarise, rephrase or add commentary. Never invent text you cannot read. If a strip is blank or unreadable, output nothing for it. When several images are given, they are vertical slices of one page in order: transcribe them as one continuous document.`

const OCR_USER = 'Transcribe all readable text from these page image(s), in order.'

interface RawImage {
  data: Uint8Array | Uint8ClampedArray
  width: number
  height: number
  channels: number
}

/** Encode one image (raw bitmap or an encoded file buffer) to base64 PNG strips,
 *  downscaled to a readable width and sliced vertically when very tall. */
async function toStrips(
  input: { raw: RawImage } | { buffer: Uint8Array },
  budget: { left: number },
): Promise<VisionImage[]> {
  if (budget.left <= 0) return []
  const pipeline = 'raw' in input
    ? sharp(Buffer.from(input.raw.data.buffer, input.raw.data.byteOffset, input.raw.data.byteLength), {
        raw: { width: input.raw.width, height: input.raw.height, channels: input.raw.channels as 1 | 3 | 4 },
      })
    : sharp(Buffer.from(input.buffer)).rotate() // honour EXIF orientation on real photos

  const resized = await pipeline
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .flatten({ background: '#ffffff' }) // drop alpha so text on transparency stays legible
    .png()
    .toBuffer()
  const meta = await sharp(resized).metadata()
  const w = meta.width ?? TARGET_WIDTH
  const h = meta.height ?? STRIP_HEIGHT

  const out: VisionImage[] = []
  for (let top = 0, n = 0; top < h && n < MAX_STRIPS_PER_PAGE && out.length < budget.left; top += STRIP_HEIGHT, n++) {
    const sh = Math.min(STRIP_HEIGHT, h - top)
    if (sh < 20) break
    const strip = await sharp(resized).extract({ left: 0, top, width: w, height: sh }).png().toBuffer()
    out.push({ base64: strip.toString('base64'), mediaType: 'image/png' })
  }
  budget.left -= out.length
  return out
}

/** OCR one uploaded image file (png/jpg/webp) to text. */
export async function ocrImageBytes(bytes: Uint8Array): Promise<string> {
  const budget = { left: MAX_STRIPS_TOTAL }
  const strips = await toStrips({ buffer: bytes }, budget)
  if (strips.length === 0) return ''
  return (await signalVisionCall({ tier: 'sonnet', system: OCR_SYSTEM, user: OCR_USER, images: strips })).trim()
}

export interface PdfOcrResult {
  text: string
  pagesOcr: number
  imagesFound: number
}

/** OCR an image-only PDF (a screenshot capture) to text, page by page. */
export async function ocrPdfBytes(bytes: Uint8Array): Promise<PdfOcrResult> {
  // isOffscreenCanvasSupported:false forces pdf.js to decode images to plain
  // typed arrays; otherwise JPEG XObjects (browser full-page captures) come
  // back as an ImageBitmap the fake worker cannot structured-clone.
  const pdf = await getDocumentProxy(bytes, { isOffscreenCanvasSupported: false })
  const pageCount = Math.min(pdf.numPages, MAX_PAGES)
  const budget = { left: MAX_STRIPS_TOTAL }
  const pageTexts: string[] = []
  let imagesFound = 0
  let pagesOcr = 0

  for (let p = 1; p <= pageCount && budget.left > 0; p++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const images = (await extractImages(pdf, p)) as any as RawImage[]
    const usable = images
      .filter(im => im.data && im.width * im.height >= MIN_IMAGE_AREA)
      .sort((a, b) => b.width * b.height - a.width * a.height)
    imagesFound += usable.length
    if (usable.length === 0) continue

    // Largest image is the page capture; include others in paint order in case
    // a tool tiled one tall screenshot into several XObjects.
    const strips: VisionImage[] = []
    for (const im of usable) {
      if (budget.left <= 0) break
      strips.push(...await toStrips({ raw: im }, budget))
    }
    if (strips.length === 0) continue
    const text = (await signalVisionCall({ tier: 'sonnet', system: OCR_SYSTEM, user: OCR_USER, images: strips })).trim()
    if (text) { pageTexts.push(text); pagesOcr++ }
  }

  return { text: pageTexts.join('\n\n'), pagesOcr, imagesFound }
}
