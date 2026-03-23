// FILE: src/components/admin/BrandColorDetector.tsx
'use client'

import { useState, useRef } from 'react'
import { extractColorsFromImageFile, type ExtractedColor } from '@/lib/admin/extractImageColors'
import type { DetectedColor } from '@/app/api/admin/detect-brand-colors/route'

type AnyColor = DetectedColor | ExtractedColor

interface Props {
  onApply: (hex: string, slot: 'bg' | 'primary' | 'secondary') => void
}

export default function BrandColorDetector({ onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [colors, setColors] = useState<AnyColor[]>([])
  const [imageLoading, setImageLoading] = useState(false)
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── URL detection ─────────────────────────────────────────────
  async function handleDetect() {
    if (!url.trim()) return
    setError('')
    setLoading(true)
    setColors([])
    try {
      const res = await fetch('/api/admin/detect-brand-colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const json = await res.json() as { colors?: AnyColor[]; error?: string }
      if (!res.ok || json.error) {
        setError(json.error ?? 'Detection failed.')
      } else {
        setColors(json.colors ?? [])
        if (!json.colors?.length) setError('No brand colours found. Try uploading a logo instead.')
      }
    } catch {
      setError('Could not reach the server. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Image upload ──────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setImageLoading(true)
    setColors([])
    try {
      const extracted = await extractColorsFromImageFile(file)
      if (extracted.length === 0) {
        setError('Could not extract colours. Try a different image.')
      } else {
        setColors(extracted)
      }
    } catch {
      setError('Image processing failed.')
    } finally {
      setImageLoading(false)
      // Reset file input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function applyAndClose(hex: string, slot: 'bg' | 'primary' | 'secondary') {
    onApply(hex, slot)
    setActiveColor(null)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-brand-accent hover:text-red-600 font-medium transition-colors"
      >
        <span>✦</span>
        Auto-detect from website or logo
      </button>
    )
  }

  return (
    <div className="border border-brand-accent/30 bg-orange-50/50 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Auto-detect brand colours</p>
        <button
          type="button"
          onClick={() => { setOpen(false); setColors([]); setError('') }}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* URL detection */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1.5">From website URL</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleDetect()}
            placeholder="https://truefullstaq.com"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <button
            type="button"
            onClick={() => void handleDetect()}
            disabled={loading || !url.trim()}
            className="bg-brand-accent hover:bg-red-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Scanning…
              </span>
            ) : 'Detect'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Reads meta tags, PWA manifest, and CSS colour variables from the site.
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Image upload */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1.5">From logo or screenshot</p>
        <label className={`
          flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-200
          hover:border-brand-accent/50 rounded-lg px-4 py-3 transition-colors
          ${imageLoading ? 'opacity-60 pointer-events-none' : ''}
        `}>
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {imageLoading ? 'Extracting colours…' : 'Upload logo, screenshot or brand image'}
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, SVG, WebP</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.svg"
            className="hidden"
            onChange={(e) => void handleImageUpload(e)}
            disabled={imageLoading}
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Results */}
      {colors.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">
            {colors.length} colour{colors.length !== 1 ? 's' : ''} detected — click to apply
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const isActive = activeColor === c.hex
              return (
                <div key={c.hex} className="relative">
                  <button
                    type="button"
                    title={`${c.hex} · ${c.source}`}
                    onClick={() => setActiveColor(isActive ? null : c.hex)}
                    className={`
                      w-12 h-12 rounded-xl border-2 transition-all shadow-sm hover:scale-105
                      ${isActive ? 'border-gray-800 scale-105 shadow-md' : 'border-white'}
                    `}
                    style={{ backgroundColor: c.hex }}
                  />
                  {/* Confidence badge */}
                  <span className="absolute -bottom-1 -right-1 text-[9px] font-bold bg-white border border-gray-200 rounded-full px-1 leading-4 text-gray-500">
                    {c.confidence}
                  </span>
                  {/* Apply popover */}
                  {isActive && (
                    <div className="absolute left-0 top-14 z-20 bg-white border border-gray-200 rounded-xl shadow-xl p-2 min-w-[160px] space-y-1">
                      <p className="text-[10px] text-gray-400 px-1 pb-1 border-b border-gray-100 font-mono">{c.hex}</p>
                      <p className="text-[10px] text-gray-400 px-1 pb-1 border-b border-gray-100 truncate max-w-[148px]">{c.source}</p>
                      {(
                        [
                          { slot: 'bg', label: '🎨 Set as Background' },
                          { slot: 'primary', label: '⚡ Set as Primary' },
                          { slot: 'secondary', label: '✦ Set as Secondary' },
                        ] as { slot: 'bg' | 'primary' | 'secondary'; label: string }[]
                      ).map(({ slot, label }) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => applyAndClose(c.hex, slot)}
                          className="w-full text-left text-xs text-gray-700 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Tap a colour to choose where to apply it. Confidence score = how certain we are it&apos;s a brand colour.
          </p>
        </div>
      )}
    </div>
  )
}
