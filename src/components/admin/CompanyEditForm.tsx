// FILE: src/components/admin/CompanyEditForm.tsx
'use client'

import { useState } from 'react'
import { QUESTIONS } from '@/data/questions'

const DIMENSION_LABELS: Record<string, string> = {
  strategy_vision: 'Strategy & Vision',
  current_usage: 'Current Usage',
  data_readiness: 'Data Readiness',
  talent_culture: 'Talent & Culture',
  governance_risk: 'Governance & Risk',
  opportunity_awareness: 'Opportunity Awareness',
}

const FULL_ONLY_QUESTIONS = QUESTIONS.filter((q) => !q.lite)
const GROUPED = FULL_ONLY_QUESTIONS.reduce<Record<string, typeof FULL_ONLY_QUESTIONS>>((acc, q) => {
  if (!acc[q.dimension]) acc[q.dimension] = []
  acc[q.dimension].push(q)
  return acc
}, {})

interface ProductOption {
  id: string
  key: string
  name: string
}

interface Company {
  id: string
  name: string
  slug: string
  logo_url: string | null
  active: boolean
  brand_color?: string | null
  secondary_color?: string | null
  welcome_message?: string | null
  excluded_question_codes?: string[] | null
  product_id?: string | null
  access_code?: string | null
  notify_email?: string | null
}

interface CompanyEditFormProps {
  company: Company
  products?: ProductOption[]
}

export default function CompanyEditForm({ company, products = [] }: CompanyEditFormProps) {
  const [name, setName] = useState(company.name)
  const [slug, setSlug] = useState(company.slug)
  const [logoUrl, setLogoUrl] = useState(company.logo_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [active, setActive] = useState(company.active)
  const [brandColor, setBrandColor] = useState(company.brand_color ?? '#E8611A')
  const [secondaryColor, setSecondaryColor] = useState(company.secondary_color ?? '#F5A820')
  const [welcomeMessage, setWelcomeMessage] = useState(company.welcome_message ?? '')
  const [productId, setProductId] = useState(company.product_id ?? '')
  const [accessCode, setAccessCode] = useState(company.access_code ?? '')
  const [showAccessCode, setShowAccessCode] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(company.notify_email ?? '')
  const [excluded, setExcluded] = useState<Set<string>>(
    new Set(company.excluded_question_codes ?? [])
  )
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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

  function toggleQuestion(code: string) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          logo_url: logoUrl.trim() || null,
          active,
          brand_color: brandColor,
          secondary_color: secondaryColor,
          welcome_message: welcomeMessage.trim() || null,
          excluded_question_codes: Array.from(excluded),
          product_id: productId || null,
          access_code: accessCode.trim() || null,
          notify_email: notifyEmail.trim() || null,
        }),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to update company.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const includedCount = FULL_ONLY_QUESTIONS.length - excluded.size

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-sm">/a/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            required
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
      {products.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assessment product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
          >
            <option value="">— Not assigned —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Branding */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Brand colours</p>
        <p className="text-xs text-gray-500 mb-4">
          Applied to buttons, badges and accents on the company landing page.
        </p>

        {/* Colour pickers */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Primary */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Primary colour</p>
            <p className="text-xs text-gray-400">Buttons · headline · badges</p>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                />
              </div>
              <input
                type="text"
                value={brandColor}
                onChange={(e) => {
                  const v = e.target.value
                  setBrandColor(v)
                }}
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
              <div className="relative">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                />
              </div>
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => {
                  const v = e.target.value
                  setSecondaryColor(v)
                }}
                maxLength={7}
                className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent uppercase"
              />
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="rounded-xl overflow-hidden border border-gray-200 mb-5">
          <div className="bg-gray-100 px-3 py-1.5 flex items-center gap-2 border-b border-gray-200">
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            </div>
            <span className="text-xs text-gray-400 font-mono">/a/{slug || 'company'}</span>
          </div>
          {/* Simulated landing page hero */}
          <div className="bg-[#354E5E] px-6 py-6">
            {/* Badge */}
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
            {/* Headline */}
            <p className="text-white text-sm font-bold mb-1 leading-snug">
              How does{' '}
              <span style={{ color: brandColor }}>{name || 'Company'}</span>
              {' '}stand on AI?
            </p>
            <p className="text-white/50 text-xs mb-4">
              26 questions · 12 minutes · Confidential results
            </p>
            {/* CTA */}
            <button
              type="button"
              className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${brandColor})` }}
            >
              Start the assessment →
            </button>
            {/* Logo preview */}
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                <img src={logoUrl} alt={name} className="h-6 object-contain" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Welcome message <span className="text-gray-500 text-xs">(optional — shown above the assessment)</span>
          </label>
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            rows={3}
            placeholder="e.g. Welcome to the Acme Corp AI readiness assessment. This takes about 15 minutes…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none"
          />
        </div>
      </div>

      {/* Access code */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Access code</p>
        <p className="text-xs text-gray-500 mb-3">
          Optional. If set, participants must enter this code before seeing the assessment.
          Leave blank for open access.
        </p>
        <div className="flex items-center gap-2">
          <input
            type={showAccessCode ? 'text' : 'password'}
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="e.g. acme2025"
            autoComplete="new-password"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <button
            type="button"
            onClick={() => setShowAccessCode((v) => !v)}
            className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showAccessCode ? 'Hide' : 'Show'}
          </button>
          {accessCode && (
            <button
              type="button"
              onClick={() => setAccessCode('')}
              className="px-3 py-2 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {accessCode && (
          <p className="text-xs text-amber-600 mt-2">
            Code set — participants will be asked to enter this before starting.
          </p>
        )}
      </div>

      {/* Lead notification email */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Lead notification email</p>
        <p className="text-xs text-gray-500 mb-3">
          Optional. When set, an email with lead details and score is sent to this address after every submission.
        </p>
        <input
          type="email"
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          placeholder="e.g. leads@truefullstaq.nl"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      {/* Question selection */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-gray-700">Custom question set</p>
          <span className="text-xs text-gray-500">
            {includedCount}/{FULL_ONLY_QUESTIONS.length} full questions included
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          The 7 lite questions are always included. Uncheck any to skip them in the full assessment.
        </p>

        <div className="space-y-4">
          {Object.entries(GROUPED).map(([dim, qs]) => (
            <div key={dim}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
                {DIMENSION_LABELS[dim] ?? dim}
              </p>
              <div className="space-y-1.5">
                {qs.map((q) => (
                  <label key={q.code} className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!excluded.has(q.code)}
                      onChange={() => toggleQuestion(q.code)}
                      className="mt-0.5 w-4 h-4 accent-brand-accent flex-shrink-0"
                    />
                    <span className={`text-xs leading-relaxed ${excluded.has(q.code) ? 'text-gray-300 line-through' : 'text-gray-600'}`}>
                      <span className="font-mono text-gray-400 mr-1">{q.code}</span>
                      {q.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active */}
      <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
        <input
          id="edit-active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="w-4 h-4 accent-brand-accent"
        />
        <label htmlFor="edit-active" className="text-sm font-medium text-gray-700">
          Active (assessment accessible at /a/{slug})
        </label>
      </div>

      {error && <p className="text-brand-accent text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">Changes saved successfully.</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-brand-accent hover:bg-red-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
      >
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
