// FILE: src/components/admin/NewCompanyForm.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import BrandColorDetector from './BrandColorDetector'

interface ProductOption {
  id: string
  key: string
  name: string
}

interface NewCompanyFormProps {
  products: ProductOption[]
}

export default function NewCompanyForm({ products }: NewCompanyFormProps) {
  const defaultProductId = products[0]?.id ?? ''

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [active, setActive] = useState(true)
  const [productId, setProductId] = useState(defaultProductId)
  const [brandColor, setBrandColor] = useState('#E8611A')
  const [secondaryColor, setSecondaryColor] = useState('#F5A820')
  const [bgColor, setBgColor] = useState('#354E5E')
  const [assessmentMode, setAssessmentMode] = useState<'internal' | 'external'>('internal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const json = await res.json() as { url: string }
        setLogoUrl(json.url)
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Upload failed')
      }
    } catch { setError('Upload failed') }
    setUploading(false)
  }

  function handleNameChange(value: string) {
    setName(value)
    setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          logo_url: logoUrl.trim() || null,
          active,
          product_id: productId || null,
          brand_color: brandColor,
          secondary_color: secondaryColor,
          bg_color: bgColor,
          assessment_mode: assessmentMode,
        }),
      })

      if (res.ok) {
        window.location.href = '/admin/companies'
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to create company.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-5 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name <span className="text-brand-accent">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          placeholder="Acme Corp"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug <span className="text-brand-accent">*</span>
        </label>
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-sm">/a/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            required
            placeholder="acme-corp"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Logo <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap">
              {uploading ? 'Uploading…' : 'Upload file'}
              <input type="file" accept="image/*,.svg" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
            </label>
            <span className="text-gray-400 text-xs">or paste URL:</span>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo preview" className="h-8 object-contain rounded border border-gray-100 bg-brand p-1" />
          )}
        </div>
      </div>

      {/* Product assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assessment product <span className="text-brand-accent">*</span>
        </label>
        {products.length === 0 ? (
          <p className="text-sm text-amber-600">No active products found in database.</p>
        ) : (
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Brand colours */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Brand colours</p>
        <p className="text-xs text-gray-500 mb-3">Set the page background and brand accent colours. The preview adapts automatically.</p>

        {/* Auto-detect */}
        <div className="mb-4">
          <BrandColorDetector
            onApply={(hex, slot) => {
              if (slot === 'bg') setBgColor(hex)
              else if (slot === 'primary') setBrandColor(hex)
              else setSecondaryColor(hex)
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {/* Background */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Background</p>
            <p className="text-xs text-gray-400">Page hero bg</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                maxLength={7}
                className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent uppercase"
              />
            </div>
          </div>

          {/* Primary */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Primary colour</p>
            <p className="text-xs text-gray-400">Buttons · badges</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                maxLength={7}
                className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent uppercase"
              />
            </div>
          </div>

          {/* Secondary */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Secondary colour</p>
            <p className="text-xs text-gray-400">Gradient · accents</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                maxLength={7}
                className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent uppercase"
              />
            </div>
          </div>
        </div>

        {/* Live preview — adapts to bgColor */}
        {(() => {
          const h = bgColor.replace('#', '')
          const r = parseInt(h.slice(0, 2) || 'ff', 16)
          const g = parseInt(h.slice(2, 4) || 'ff', 16)
          const b = parseInt(h.slice(4, 6) || 'ff', 16)
          const light = (r * 299 + g * 587 + b * 114) / 1000 > 140
          const fg = light ? '#111827' : '#ffffff'
          const fgMuted = light ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)'
          const borderCol = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.10)'
          return (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="bg-gray-100 px-3 py-1.5 flex items-center gap-2 border-b border-gray-200">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                </div>
                <span className="text-xs text-gray-400 font-mono">/a/{slug || 'company'}</span>
              </div>
              <div className="px-6 py-6" style={{ background: bgColor }}>
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${secondaryColor}25, ${brandColor}25)`,
                    border: `1px solid ${brandColor}50`,
                    color: brandColor,
                  }}
                >
                  {name || 'Company'} · AI Maturity Assessment
                </div>
                <p className="text-sm font-bold mb-1 leading-snug" style={{ color: fg }}>
                  How does{' '}
                  <span style={{ color: brandColor }}>{name || 'Company'}</span>
                  {' '}stand on AI?
                </p>
                <p className="text-xs mb-4" style={{ color: fgMuted }}>26 questions · 10 minutes · Confidential results</p>
                <button
                  type="button"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${brandColor})` }}
                >
                  Start the assessment →
                </button>
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${borderCol}` }}>
                    <img src={logoUrl} alt={name} className="h-6 object-contain" />
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Assessment mode */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Assessment mode</p>
        <p className="text-xs text-gray-500 mb-3">
          Choose who is being assessed. This changes the copy on the landing page.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAssessmentMode('internal')}
            className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-all ${
              assessmentMode === 'internal'
                ? 'border-brand-accent bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <span className="text-sm font-semibold text-gray-800">🏢 Own team</span>
            <span className="text-xs text-gray-500 leading-relaxed">
              The company is assessing its own employees. Company name appears as the subject.
            </span>
            <span className={`mt-1 text-xs font-medium ${assessmentMode === 'internal' ? 'text-brand-accent' : 'text-gray-400'}`}>
              "How does <em>{name || 'Acme'}</em> stand on AI?"
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAssessmentMode('external')}
            className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-all ${
              assessmentMode === 'external'
                ? 'border-brand-accent bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <span className="text-sm font-semibold text-gray-800">🤝 Clients / prospects</span>
            <span className="text-xs text-gray-500 leading-relaxed">
              The company is assessing clients or prospects. Respondent&apos;s own org is the subject.
            </span>
            <span className={`mt-1 text-xs font-medium ${assessmentMode === 'external' ? 'text-brand-accent' : 'text-gray-400'}`}>
              "Presented by <em>{name || 'Acme'}</em>"
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="w-4 h-4 accent-brand-accent"
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
          Active (assessment accessible at /a/[slug])
        </label>
      </div>

      {error && (
        <p className="text-brand-accent text-sm">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-brand-accent hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Creating…' : 'Create Company'}
        </button>
        <Link
          href="/admin/companies"
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
